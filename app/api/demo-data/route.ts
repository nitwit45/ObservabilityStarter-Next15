import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Demo endpoint to generate sample data for the dashboard
export async function POST(request: NextRequest) {
  try {
    const { count = 10 } = await request.json();
    
    const results = {
      logs: 0,
      traces: 0,
      metrics: 0,
      errorBudget: 0,
    };

    // Create sample logs
    const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;
    const sources = ['client', 'server'] as const;
    const messages = [
      'User authentication successful',
      'Database query executed',
      'API request received',
      'Cache hit for user data',
      'Rate limit check passed',
      'Session validated',
      'Request processing completed',
      'Data transformation applied',
    ];

    for (let i = 0; i < count; i++) {
      const requestId = nanoid();
      await prisma.log.create({
        data: {
          requestId,
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          metadata: {
            user_id: Math.floor(Math.random() * 1000),
            endpoint: `/api/v1/resource/${Math.floor(Math.random() * 100)}`,
          },
        },
      });
      results.logs++;
    }

    // Create sample traces
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const traceId = nanoid();
      const requestId = nanoid();
      const startTime = new Date(Date.now() - Math.random() * 3600000);
      const duration = Math.floor(Math.random() * 500) + 50;
      const endTime = new Date(startTime.getTime() + duration);

      await prisma.trace.create({
        data: {
          traceId,
          requestId,
          name: 'HTTP GET /api/users',
          startTime,
          endTime,
          duration,
          status: Math.random() > 0.1 ? 'ok' : 'error',
          spans: {
            create: [
              {
                spanId: nanoid(),
                name: 'Database query',
                kind: 'client',
                startTime: new Date(startTime.getTime() + 10),
                endTime: new Date(startTime.getTime() + 100),
                duration: 90,
                status: 'ok',
              },
              {
                spanId: nanoid(),
                name: 'Process data',
                kind: 'internal',
                startTime: new Date(startTime.getTime() + 110),
                endTime: new Date(startTime.getTime() + 200),
                duration: 90,
                status: 'ok',
              },
            ],
          },
        },
      });
      results.traces++;
    }

    // Create sample metrics
    const metricNames = ['request_duration', 'memory_usage', 'cpu_usage'];
    for (let i = 0; i < count * 3; i++) {
      await prisma.metric.create({
        data: {
          name: metricNames[i % metricNames.length],
          type: 'HISTOGRAM',
          value: Math.random() * 200 + 50,
          requestId: nanoid(),
          timestamp: new Date(Date.now() - Math.random() * 3600000),
        },
      });
      results.metrics++;
    }

    // Create sample error budget
    await prisma.errorBudget.upsert({
      where: { service: 'api-service' },
      update: {
        totalRequests: { increment: 1000 },
        errorRequests: { increment: 5 },
        consumed: 10.5,
        remaining: 89.5,
      },
      create: {
        service: 'api-service',
        period: '30d',
        targetSlo: 99.9,
        totalRequests: 1000,
        errorRequests: 5,
        consumed: 10.5,
        remaining: 89.5,
      },
    });
    results.errorBudget = 1;

    return NextResponse.json({
      success: true,
      message: 'Demo data generated successfully',
      results,
    });
  } catch (error) {
    console.error('Error generating demo data:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    );
  }
}

