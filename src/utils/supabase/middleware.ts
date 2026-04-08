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

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  
  if (user) {
    if (isLoginPage || request.nextUrl.pathname === '/') {
      // Validate role using secure RPC function explicitly requested by user
      const { data: role } = await supabase.rpc('get_user_role');
      
      const roleStr = typeof role === 'string' ? role : role?.[0]?.get_user_role;
      const parsedRole = roleStr?.toUpperCase();
      
      let redirectPath = '/cliente'; // fallback or default
      if (parsedRole === 'ADMIN') redirectPath = '/admin';
      else if (parsedRole === 'CAPITAN') redirectPath = '/capitan';
      else redirectPath = '/cliente';

      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      return NextResponse.redirect(url);
    }
  } else if (!isLoginPage && !request.nextUrl.pathname.startsWith('/auth')) {
    // If no user and not on login/auth, block incorrect route
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // TODO: we could add specific role guards, e.g., if path starts with /admin but role != ADMIN
  if (user && !isLoginPage) {
    // Specific role guarding logic can be placed here
    // e.g., protect /admin from non-admin, etc.
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isCapitanRoute = request.nextUrl.pathname.startsWith('/capitan');
    const isClienteRoute = request.nextUrl.pathname.startsWith('/cliente');

    if (isAdminRoute || isCapitanRoute || isClienteRoute) {
      const { data: role } = await supabase.rpc('get_user_role');
      const roleStr = typeof role === 'string' ? role : role?.[0]?.get_user_role;
      const parsedRole = roleStr?.toUpperCase();
      
      if (isAdminRoute && parsedRole !== 'ADMIN') {
         const url = request.nextUrl.clone();
         url.pathname = parsedRole === 'CAPITAN' ? '/capitan' : '/cliente';
         return NextResponse.redirect(url);
      }
      if (isCapitanRoute && parsedRole !== 'CAPITAN') {
         const url = request.nextUrl.clone();
         url.pathname = parsedRole === 'ADMIN' ? '/admin' : '/cliente';
         return NextResponse.redirect(url);
      }
      if (isClienteRoute && parsedRole !== 'CLIENTE') {
         const url = request.nextUrl.clone();
         url.pathname = parsedRole === 'ADMIN' ? '/admin' : '/capitan';
         return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
