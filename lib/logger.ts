import { prisma } from './prisma';
import { LogLevel } from '@prisma/client';
import { getCurrentTraceId, getCurrentSpanId } from './telemetry';

export interface LogOptions {
  level: LogLevel;
  message: string;
  source: 'client' | 'server';
  requestId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function log(options: LogOptions) {
  const { level, message, source, requestId, userId, metadata } = options;
  
  try {
    await prisma.log.create({
      data: {
        level,
        message,
        source,
        requestId,
        userId,
        metadata: metadata || {},
        traceId: getCurrentTraceId(),
        spanId: getCurrentSpanId(),
      },
    });
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

export const logger = {
  debug: (message: string, requestId: string, metadata?: Record<string, any>) =>
    log({ level: 'DEBUG', message, source: 'server', requestId, metadata }),
  info: (message: string, requestId: string, metadata?: Record<string, any>) =>
    log({ level: 'INFO', message, source: 'server', requestId, metadata }),
  warn: (message: string, requestId: string, metadata?: Record<string, any>) =>
    log({ level: 'WARN', message, source: 'server', requestId, metadata }),
  error: (message: string, requestId: string, metadata?: Record<string, any>) =>
    log({ level: 'ERROR', message, source: 'server', requestId, metadata }),
  fatal: (message: string, requestId: string, metadata?: Record<string, any>) =>
    log({ level: 'FATAL', message, source: 'server', requestId, metadata }),
};

