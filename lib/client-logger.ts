'use client';

interface ClientLogOptions {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  metadata?: Record<string, any>;
}

export class ClientLogger {
  private requestId: string;

  constructor() {
    this.requestId = this.generateRequestId();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendLog(options: ClientLogOptions) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          source: 'client',
        }),
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    console.debug(message, metadata);
    this.sendLog({ level: 'DEBUG', message, metadata });
  }

  info(message: string, metadata?: Record<string, any>) {
    console.info(message, metadata);
    this.sendLog({ level: 'INFO', message, metadata });
  }

  warn(message: string, metadata?: Record<string, any>) {
    console.warn(message, metadata);
    this.sendLog({ level: 'WARN', message, metadata });
  }

  error(message: string, metadata?: Record<string, any>) {
    console.error(message, metadata);
    this.sendLog({ level: 'ERROR', message, metadata });
  }

  fatal(message: string, metadata?: Record<string, any>) {
    console.error('[FATAL]', message, metadata);
    this.sendLog({ level: 'FATAL', message, metadata });
  }
}

// Singleton instance
export const clientLogger = new ClientLogger();

