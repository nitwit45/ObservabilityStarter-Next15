import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;
    
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role' },
        { status: 400 }
      );
    }
    
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, DEVELOPER, or VIEWER' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
      },
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    
    const where: any = {};
    if (role) where.role = role;
    if (email) where.email = email;
    
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

