import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LogLevel } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestId = request.headers.get('x-request-id') || 'unknown';
    
    const { level, message, source, userId, metadata } = body;
    
    // Validate required fields
    if (!level || !message || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: level, message, source' },
        { status: 400 }
      );
    }
    
    // Validate log level
    if (!Object.values(LogLevel).includes(level)) {
      return NextResponse.json(
        { error: 'Invalid log level' },
        { status: 400 }
      );
    }
    
    const log = await prisma.log.create({
      data: {
        level,
        message,
        source,
        requestId,
        userId,
        metadata: metadata || {},
      },
    });
    
    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const source = searchParams.get('source');
    const requestId = searchParams.get('requestId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    const where: any = {};
    
    if (level) where.level = level;
    if (source) where.source = source;
    if (requestId) where.requestId = requestId;
    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) where.timestamp.gte = new Date(startTime);
      if (endTime) where.timestamp.lte = new Date(endTime);
    }
    
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.log.count({ where }),
    ]);
    
    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

