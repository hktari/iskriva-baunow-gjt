import { sendInvitationEmail } from '@/server/lib/email';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to, userName, tempPassword, loginUrl } = body;

    if (!to || !userName || !tempPassword || !loginUrl) {
      return Response.json(
        {
          error: 'Missing required fields: to, userName, tempPassword, loginUrl',
        },
        { status: 400 }
      );
    }

    const result = await sendInvitationEmail({ to, userName, tempPassword, loginUrl });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
