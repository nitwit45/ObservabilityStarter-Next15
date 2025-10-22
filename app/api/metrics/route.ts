import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MetricType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestId = request.headers.get('x-request-id') || 'unknown';
    
    const { name, type, value, tags } = body;
    
    if (!name || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, value' },
        { status: 400 }
      );
    }
    
    if (!Object.values(MetricType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 }
      );
    }
    
    const metric = await prisma.metric.create({
      data: {
        name,
        type,
        value: parseFloat(value),
        requestId,
        tags: tags || {},
      },
    });
    
    return NextResponse.json({ success: true, metricId: metric.id });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const aggregation = searchParams.get('aggregation'); // avg, sum, min, max, count
    
    const where: any = {};
    
    if (name) where.name = name;
    if (type) where.type = type;
    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) where.timestamp.gte = new Date(startTime);
      if (endTime) where.timestamp.lte = new Date(endTime);
    }
    
    // If aggregation is requested, compute stats
    if (aggregation && name) {
      const metrics = await prisma.metric.findMany({ where });
      const values = metrics.map(m => m.value);
      
      let result;
      switch (aggregation) {
        case 'avg':
          result = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'sum':
          result = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          result = Math.min(...values);
          break;
        case 'max':
          result = Math.max(...values);
          break;
        case 'count':
          result = values.length;
          break;
        case 'p95':
          const sorted = values.sort((a, b) => a - b);
          const index = Math.ceil(sorted.length * 0.95) - 1;
          result = sorted[index] || 0;
          break;
        case 'p99':
          const sorted99 = values.sort((a, b) => a - b);
          const index99 = Math.ceil(sorted99.length * 0.99) - 1;
          result = sorted99[index99] || 0;
          break;
        default:
          result = null;
      }
      
      return NextResponse.json({
        name,
        aggregation,
        value: result,
        count: values.length,
      });
    }
    
    const [metrics, total] = await Promise.all([
      prisma.metric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.metric.count({ where }),
    ]);
    
    return NextResponse.json({
      metrics,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

