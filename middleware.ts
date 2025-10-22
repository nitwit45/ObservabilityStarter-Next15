import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || nanoid();
  
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

