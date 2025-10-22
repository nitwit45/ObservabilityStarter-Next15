import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Severity, AlertStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, description, condition, threshold, metric, severity, enabled } = body;
    
    if (!name || !condition || threshold === undefined || !metric || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!Object.values(Severity).includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity' },
        { status: 400 }
      );
    }
    
    const alertRule = await prisma.alertRule.create({
      data: {
        name,
        description,
        condition,
        threshold: parseFloat(threshold),
        metric,
        severity,
        enabled: enabled !== false,
      },
    });
    
    return NextResponse.json({ success: true, alertRule });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to create alert rule' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enabled = searchParams.get('enabled');
    const severity = searchParams.get('severity');
    
    const where: any = {};
    if (enabled !== null) where.enabled = enabled === 'true';
    if (severity) where.severity = severity;
    
    const alertRules = await prisma.alertRule.findMany({
      where,
      include: {
        alerts: {
          where: { status: AlertStatus.FIRING },
          orderBy: { triggeredAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ alertRules });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert rules' },
      { status: 500 }
    );
  }
}

