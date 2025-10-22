import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestId = request.headers.get('x-request-id') || 'unknown';
    
    const { traceId, name, startTime, endTime, status, spans, metadata } = body;
    
    if (!traceId || !name || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: traceId, name, startTime' },
        { status: 400 }
      );
    }
    
    const duration = endTime ? new Date(endTime).getTime() - new Date(startTime).getTime() : null;
    
    const trace = await prisma.trace.create({
      data: {
        traceId,
        requestId,
        name,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        status: status || 'ok',
        metadata: metadata || {},
        spans: {
          create: spans?.map((span: any) => ({
            spanId: span.spanId,
            traceId: traceId,
            parentId: span.parentId,
            name: span.name,
            kind: span.kind || 'internal',
            startTime: new Date(span.startTime),
            endTime: span.endTime ? new Date(span.endTime) : null,
            duration: span.endTime ? new Date(span.endTime).getTime() - new Date(span.startTime).getTime() : null,
            attributes: span.attributes || {},
            events: span.events || [],
            status: span.status || 'ok',
          })) || [],
        },
      },
    });
    
    return NextResponse.json({ success: true, traceId: trace.id });
  } catch (error) {
    console.error('Error creating trace:', error);
    return NextResponse.json(
      { error: 'Failed to create trace' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const traceId = searchParams.get('traceId');
    const requestId = searchParams.get('requestId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    const where: any = {};
    
    if (traceId) where.traceId = traceId;
    if (requestId) where.requestId = requestId;
    if (startTime || endTime) {
      where.startTime = {};
      if (startTime) where.startTime.gte = new Date(startTime);
      if (endTime) where.startTime.lte = new Date(endTime);
    }
    
    const [traces, total] = await Promise.all([
      prisma.trace.findMany({
        where,
        include: {
          spans: {
            orderBy: { startTime: 'asc' },
          },
        },
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trace.count({ where }),
    ]);
    
    return NextResponse.json({
      traces,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching traces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traces' },
      { status: 500 }
    );
  }
}

