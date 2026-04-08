import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@db.kxsffjiuqmfaqknlokrh.supabase.co:5432/postgres',
  connectionTimeoutMillis: 10000,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Ejecutando corrección de desembolsos...\n');

    console.log('1. Eliminando columna desembolsado de prestamos...');
    await client.query('ALTER TABLE prestamos DROP COLUMN IF EXISTS desembolsado');
    console.log('   ✓ Listo');

    console.log('\n2. Creando índice único para prevenir múltiples desembolsos...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unico_desembolso_por_prestamo
      ON desembolsos(prestamo_id)
    `);
    console.log('   ✓ Listo');

    console.log('\n3. Creando función prestamo_esta_desembolsado...');
    await client.query(`
      CREATE OR REPLACE FUNCTION prestamo_esta_desembolsado(p_prestamo UUID)
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM desembolsos WHERE prestamo_id = p_prestamo
        );
      END;
      $$ LANGUAGE plpgsql STABLE;
    `);
    console.log('   ✓ Listo');

    console.log('\n4. Creando vista prestamos_con_desembolso...');
    await client.query(`
      CREATE OR REPLACE VIEW prestamos_con_desembolso AS
      SELECT p.*,
        EXISTS (SELECT 1 FROM desembolsos d WHERE d.prestamo_id = p.id) AS desembolsado,
        (SELECT d.monto FROM desembolsos d WHERE d.prestamo_id = p.id LIMIT 1) AS monto_desembolsado,
        (SELECT d.fecha_desembolso FROM desembolsos d WHERE d.prestamo_id = p.id LIMIT 1) AS fecha_desembolso,
        (SELECT d.metodo_desembolso FROM desembolsos d WHERE d.prestamo_id = p.id LIMIT 1) AS metodo_desembolso,
        (SELECT d.comprobante_url FROM desembolsos d WHERE d.prestamo_id = p.id LIMIT 1) AS comprobante_desembolso
      FROM prestamos p;
    `);
    console.log('   ✓ Listo');

    console.log('\n✅ ¡Corrección completada!');
    
    // Verificar acceso
    console.log('\n🔍 Verificando tablas existentes...');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('   Tablas encontradas:', tables.rows.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
