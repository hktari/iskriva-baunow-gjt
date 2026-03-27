import logger from '@/shared/lib/logger';
import { Resend } from 'resend';

type InvitationEmailPayload = {
  to: string;
  userName: string;
  tempPassword: string;
  loginUrl: string;
};

type ResendSendResult = {
  success: true;
  messageId: string | null;
};

class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailConfigurationError';
  }
}

let cachedResend: Resend | null = null;

function getRequiredEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new EmailConfigurationError(`${key} is not configured`);
  }
  return value;
}

function getResendClient() {
  if (!cachedResend) {
    const apiKey = getRequiredEnv('RESEND_API_KEY');
    cachedResend = new Resend(apiKey);
  }
  return cachedResend;
}

function buildInvitationEmailHtml({
  to,
  userName,
  tempPassword,
  loginUrl,
}: InvitationEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to the Project Management System!</h2>
      <p>Hi ${userName},</p>
      <p>You've been invited to join our Project Management System. Here are your login details:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 4px;">${tempPassword}</code></p>
      </div>
      <p>Please <a href="${loginUrl}" style="color: #0066cc;">click here to login</a> and change your password after your first login.</p>
      <p>If you have any questions, please contact your system administrator.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
}

export async function sendInvitationEmail(
  payload: InvitationEmailPayload
): Promise<ResendSendResult> {
  const resend = getResendClient();
  const fromEmail = getRequiredEnv('RESEND_FROM_EMAIL');

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [payload.to],
      subject: 'Invitation to Join Project Management System',
      html: buildInvitationEmailHtml(payload),
      text: `Hello ${payload.userName},\n\nYou've been invited to the Project Management System.\nLogin: ${payload.loginUrl}\nTemporary password: ${payload.tempPassword}\n\nPlease change your password after your first login.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    const messageId = data?.id ?? null;
    logger.info(
      {
        scope: 'resend.invitation',
        messageId,
        to: payload.to,
      },
      'Invitation email sent via Resend'
    );

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    logger.error(
      {
        scope: 'resend.invitation',
        to: payload.to,
        error: error instanceof Error ? error.message : error,
      },
      'Failed to send invitation email'
    );
    throw error;
  }
}

export async function resendInvitationEmail(payload: InvitationEmailPayload) {
  return sendInvitationEmail(payload);
}

export { EmailConfigurationError };
