import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ========== ZERO TRUST: Validar sesión primero ==========
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Si hay error o no hay usuario, redirigir a login (excepto si ya está en login)
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  if (userError || !user) {
    if (!isLoginPage && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ========== Usuario autenticado: validar rol ==========
  const { data: roleData, error: roleError } = await supabase.rpc("get_user_role");
  
  // Si hay error obteniendo rol, invalidar sesión
  if (roleError || !roleData) {
    if (!isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const role = typeof roleData === "string" ? roleData : roleData?.[0]?.get_user_role;
  const parsedRole = role?.toUpperCase();

  // ========== Redirección según rol ==========
  // Si está en página de login o raíz, redirigir según su rol
  if (isLoginPage || request.nextUrl.pathname === "/") {
    let redirectPath = "/cliente";
    if (parsedRole === "ADMIN") redirectPath = "/admin";
    else if (parsedRole === "CAPITAN") redirectPath = "/capitan";

    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  // ========== Proteger rutas por rol ==========
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isCapitanRoute = request.nextUrl.pathname.startsWith("/capitan");
  const isClienteRoute = request.nextUrl.pathname.startsWith("/cliente");

  if (isAdminRoute && parsedRole !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = parsedRole === "CAPITAN" ? "/capitan" : "/cliente";
    return NextResponse.redirect(url);
  }

  if (isCapitanRoute && parsedRole !== "CAPITAN") {
    const url = request.nextUrl.clone();
    url.pathname = parsedRole === "ADMIN" ? "/admin" : "/cliente";
    return NextResponse.redirect(url);
  }

  if (isClienteRoute && parsedRole !== "CLIENTE") {
    const url = request.nextUrl.clone();
    url.pathname = parsedRole === "ADMIN" ? "/admin" : "/capitan";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
