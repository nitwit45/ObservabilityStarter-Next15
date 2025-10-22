import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, period, targetSlo } = body;
    
    if (!service || !period || !targetSlo) {
      return NextResponse.json(
        { error: 'Missing required fields: service, period, targetSlo' },
        { status: 400 }
      );
    }
    
    const errorBudget = await prisma.errorBudget.upsert({
      where: { service },
      update: {
        period,
        targetSlo: parseFloat(targetSlo),
        lastCalculated: new Date(),
      },
      create: {
        service,
        period,
        targetSlo: parseFloat(targetSlo),
      },
    });
    
    return NextResponse.json({ success: true, errorBudget });
  } catch (error) {
    console.error('Error creating/updating error budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update error budget' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');
    
    if (service) {
      const errorBudget = await prisma.errorBudget.findUnique({
        where: { service },
      });
      
      if (!errorBudget) {
        return NextResponse.json(
          { error: 'Error budget not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ errorBudget });
    }
    
    const errorBudgets = await prisma.errorBudget.findMany({
      orderBy: { lastCalculated: 'desc' },
    });
    
    return NextResponse.json({ errorBudgets });
  } catch (error) {
    console.error('Error fetching error budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error budgets' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update error budget metrics
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, totalRequests, errorRequests } = body;
    
    if (!service) {
      return NextResponse.json(
        { error: 'Missing required field: service' },
        { status: 400 }
      );
    }
    
    const errorBudget = await prisma.errorBudget.findUnique({
      where: { service },
    });
    
    if (!errorBudget) {
      return NextResponse.json(
        { error: 'Error budget not found' },
        { status: 404 }
      );
    }
    
    const newTotalRequests = errorBudget.totalRequests + (totalRequests || 0);
    const newErrorRequests = errorBudget.errorRequests + (errorRequests || 0);
    
    const errorRate = newTotalRequests > 0 ? (newErrorRequests / newTotalRequests) * 100 : 0;
    const consumed = ((100 - errorBudget.targetSlo) > 0) 
      ? (errorRate / (100 - errorBudget.targetSlo)) * 100 
      : 0;
    const remaining = Math.max(0, 100 - consumed);
    
    const updated = await prisma.errorBudget.update({
      where: { service },
      data: {
        totalRequests: newTotalRequests,
        errorRequests: newErrorRequests,
        consumed,
        remaining,
        lastCalculated: new Date(),
      },
    });
    
    return NextResponse.json({ success: true, errorBudget: updated });
  } catch (error) {
    console.error('Error updating error budget:', error);
    return NextResponse.json(
      { error: 'Failed to update error budget' },
      { status: 500 }
    );
  }
}

