-- ==========================================
-- FUNCIONES RPC FINANCIERAS - MIVANK
-- ==========================================
-- Instrucción de Seguridad Local:
-- Deben ejecutarse desde el Dashboard de Supabase (SQL Editor)
-- para garantizar el entorno limpio y de SSL.
-- ==========================================

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);

-- 1. CREAR PRÉSTAMO
-- Esta función inserta el préstamo y auto-genera las cuotas matemáticamente.
CREATE OR REPLACE FUNCTION crear_prestamo(
  p_cliente_id UUID,
  p_monto DECIMAL,
  p_interes DECIMAL,
  p_interes_mora DECIMAL,
  p_frecuencia VARCHAR,
  p_numero_cuotas INT,
  p_fecha_inicio DATE
) RETURNS UUID AS $$
DECLARE
  v_prestamo_id UUID;
  v_capitan_id UUID;
  v_total_pagar DECIMAL;
  v_valor_cuota DECIMAL;
  v_fecha_cuota DATE;
  i INT;
BEGIN
  -- Obtain auth context
  v_capitan_id := auth.uid();
  
  IF v_capitan_id IS NULL THEN
    RAISE EXCEPTION 'No autorizado.';
  END IF;

  -- Validate that the client belongs to the caller logic
  IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id AND capitan_id = v_capitan_id) THEN
    -- If caller is admin, allow it? Let's check roles if needed,
    -- but currently Capitán only creates them.
    RAISE EXCEPTION 'Cliente no le pertenece o no tiene autorización.';
  END IF;

  -- Cálculo Financiero: Interés Fijo sobre el capital total (Modalidad Flat predominante)
  v_total_pagar := ROUND(p_monto + (p_monto * (p_interes / 100)), 2);
  v_valor_cuota := ROUND(v_total_pagar / p_numero_cuotas, 2);

  -- 1. Insert Préstamo
  INSERT INTO prestamos (
    cliente_id, capitan_id, monto, saldo_actual, interes, interes_mora, frecuencia, numero_cuotas, fecha_inicio, estado, tipo
  )
  VALUES (
    p_cliente_id, v_capitan_id, p_monto, v_total_pagar, p_interes, p_interes_mora, p_frecuencia, p_numero_cuotas, p_fecha_inicio, 'ACTIVO', 'NORMAL'
  ) RETURNING id INTO v_prestamo_id;

  -- 2. Insert Cuotas Generadas
  v_fecha_cuota := p_fecha_inicio;
  FOR i IN 1..p_numero_cuotas LOOP
      
      IF p_frecuencia = 'DIARIA' THEN
         v_fecha_cuota := v_fecha_cuota + INTERVAL '1 day';
      ELSIF p_frecuencia = 'SEMANAL' THEN
         v_fecha_cuota := v_fecha_cuota + INTERVAL '1 week';
      ELSIF p_frecuencia = 'QUINCENAL' THEN
         v_fecha_cuota := v_fecha_cuota + INTERVAL '15 days';
      ELSIF p_frecuencia = 'MENSUAL' THEN
         v_fecha_cuota := v_fecha_cuota + INTERVAL '1 month';
      END IF;

      INSERT INTO cuotas (
        prestamo_id, numero, fecha_pago, valor_cuota, valor_pagado, saldo_restante, estado
      )
      VALUES (
        v_prestamo_id, i, v_fecha_cuota, v_valor_cuota, 0, v_valor_cuota, 'PENDIENTE'
      );
  END LOOP;

  -- Registrar Auditoría
  INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_nuevos)
  VALUES (v_capitan_id, 'CREAR_PRESTAMO', 'prestamos', v_prestamo_id, jsonb_build_object('monto', p_monto, 'cuotas', p_numero_cuotas));

  RETURN v_prestamo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. APROBAR PAGO
-- Función que acepta un pago interceptado y asume la distribución.
CREATE OR REPLACE FUNCTION aprobar_pago(
  p_pago_id UUID
) RETURNS VOID AS $$
DECLARE
  v_pago RECORD;
  v_monto_distribuir DECIMAL;
  v_cuota RECORD;
  v_monto_aplicado DECIMAL;
  v_capitan_id UUID;
BEGIN
  v_capitan_id := auth.uid();
  
  -- Bloqueo de concurrencia y validación de estado
  SELECT * INTO v_pago FROM pagos WHERE id = p_pago_id AND estado = 'PENDIENTE_VALIDACION' FOR UPDATE;
  
  IF v_pago IS NULL THEN
    RAISE EXCEPTION 'Pago no válido, no encontrado o ya fue procesado.';
  END IF;

  -- Seguridad: Solo el dueño del préstamo o un admin puede aprobar este pago
  IF NOT EXISTS (
     SELECT 1 FROM prestamos p 
     WHERE p.id = v_pago.prestamo_id AND p.capitan_id = v_capitan_id
  ) THEN
    -- Verificamos si es ADMIN
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = v_capitan_id AND rol = 'ADMIN') THEN
       RAISE EXCEPTION 'Acceso denegado: Este préstamo no te pertenece.';
    END IF;
  END IF;
  
  v_monto_distribuir := v_pago.valor;

  -- Ciclo de distribución FIFO hacia cuotas con saldo
  FOR v_cuota IN 
      SELECT * FROM cuotas 
      WHERE prestamo_id = v_pago.prestamo_id 
        AND estado IN ('PENDIENTE', 'ABONO', 'EN_MORA')
      ORDER BY numero ASC
      FOR UPDATE
  LOOP
      EXIT WHEN v_monto_distribuir <= 0;

      IF v_monto_distribuir >= v_cuota.saldo_restante THEN
         -- Cubre íntegramente la cuota
         v_monto_aplicado := v_cuota.saldo_restante;
         v_monto_distribuir := v_monto_distribuir - v_monto_aplicado;
         
         UPDATE cuotas SET 
            valor_pagado = valor_pagado + v_monto_aplicado,
            saldo_restante = 0,
            estado = 'PAGADO'
         WHERE id = v_cuota.id;

      ELSE
         -- Solo cubre parte de la cuota (Abono)
         v_monto_aplicado := v_monto_distribuir;
         v_monto_distribuir := 0;
         
         UPDATE cuotas SET 
            valor_pagado = valor_pagado + v_monto_aplicado,
            saldo_restante = saldo_restante - v_monto_aplicado,
            estado = 'ABONO' -- Importante, no cerrar la cuota
         WHERE id = v_cuota.id;
      END IF;

      -- Crear trazabilidad en pagos_detalle
      INSERT INTO pagos_detalle (pago_id, cuota_id, monto_aplicado) 
      VALUES (v_pago.id, v_cuota.id, v_monto_aplicado);
  END LOOP;

  -- Reajustar saldo global de préstamo
  UPDATE prestamos SET 
     saldo_actual = saldo_actual - v_pago.valor
  WHERE id = v_pago.prestamo_id;

  -- Marcar pago como finalizado
  UPDATE pagos SET estado = 'APROBADO' WHERE id = v_pago.id;

  -- Auditoría financiera
  INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_nuevos)
  VALUES (v_capitan_id, 'APROBAR_PAGO', 'pagos', v_pago.id, jsonb_build_object('valor', v_pago.valor));

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
