import { NextRequest } from 'next/server';
import { createSSEResponse } from '@/lib/realtime';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;

  if (!groupId) {
    return new Response('Group ID is required', { status: 400 });
  }

  try {
    return createSSEResponse(groupId);
  } catch (error) {
    console.error('Error creating SSE connection:', error);
    return new Response('Failed to create real-time connection', { status: 500 });
  }
}
