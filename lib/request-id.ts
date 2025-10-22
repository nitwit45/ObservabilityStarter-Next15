import { headers } from 'next/headers';
import { nanoid } from 'nanoid';

export async function getRequestId(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-request-id') || nanoid();
}

export function generateRequestId(): string {
  return nanoid();
}

