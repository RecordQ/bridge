import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth';
 
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl

  // If user is trying to access an admin page and is not logged in, redirect to login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // If user is logged in and tries to access login page, redirect to admin dashboard
  if (pathname.startsWith('/admin/login') && session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
 
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
