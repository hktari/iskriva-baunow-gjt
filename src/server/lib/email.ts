import logger from '@/shared/lib/logger';
import { Resend } from 'resend';

type InvitationEmailPayload = {
  to: string;
  userName: string;
  tempPassword: string;
  loginUrl: string;
};

type MagicLinkEmailPayload = {
  to: string;
  userName: string;
  magicLinkUrl: string;
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
      <h2 style="color: #333;">Welcome to Baunow GJT!</h2>
      <p>Hi ${userName},</p>
      <p>You've been invited to join our system. Here are your login details:</p>
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

function buildMagicLinkEmailHtml({ userName, magicLinkUrl }: MagicLinkEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Baunow GJT!</h2>
      <p>Hi ${userName},</p>
      <p>You've been invited to join our system. Click the button below to set up your password and access your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLinkUrl}" 
           style="background-color: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Set Up Your Account
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <code style="background: #f5f5f5; padding: 8px; display: block; margin-top: 8px; word-break: break-all; font-size: 12px;">${magicLinkUrl}</code>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 48 hours for security reasons.
      </p>
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
      from: `Baunow GJT <${fromEmail}>`,
      to: [payload.to],
      subject: '[Baunow GJT]: Invitation to Join',
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

export async function sendMagicLinkEmail(
  payload: MagicLinkEmailPayload
): Promise<ResendSendResult> {
  const resend = getResendClient();
  const fromEmail = getRequiredEnv('RESEND_FROM_EMAIL');

  try {
    const { data, error } = await resend.emails.send({
      from: `Baunow GJT <${fromEmail}>`,
      to: [payload.to],
      subject: '[Baunow GJT]: Invitation to Join',
      html: buildMagicLinkEmailHtml(payload),
      text: `Hello ${payload.userName},\n\nYou've been invited to join Baunow GJT.\n\nClick this link to set up your account:\n${payload.magicLinkUrl}\n\nThis link will expire in 48 hours.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    const messageId = data?.id ?? null;
    logger.info(
      {
        scope: 'resend.magic-link',
        messageId,
        to: payload.to,
      },
      'Magic link email sent via Resend'
    );

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    logger.error(
      {
        scope: 'resend.magic-link',
        to: payload.to,
        error: error instanceof Error ? error.message : error,
      },
      'Failed to send magic link email'
    );
    throw error;
  }
}

type PasswordResetEmailPayload = {
  to: string;
  userName: string;
  resetUrl: string;
};

function buildPasswordResetEmailHtml({ userName, resetUrl }: PasswordResetEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <code style="background: #f5f5f5; padding: 8px; display: block; margin-top: 8px; word-break: break-all; font-size: 12px;">${resetUrl}</code>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 48 hours. If you did not request a password reset, you can safely ignore this email.
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
}

export async function sendPasswordResetEmail(
  payload: PasswordResetEmailPayload
): Promise<ResendSendResult> {
  const resend = getResendClient();
  const fromEmail = getRequiredEnv('RESEND_FROM_EMAIL');

  try {
    const { data, error } = await resend.emails.send({
      from: `Baunow GJT <${fromEmail}>`,
      to: [payload.to],
      subject: '[Baunow GJT]: Reset Your Password',
      html: buildPasswordResetEmailHtml(payload),
      text: `Hi ${payload.userName},\n\nWe received a request to reset your password.\n\nClick this link to reset it:\n${payload.resetUrl}\n\nThis link will expire in 48 hours. If you did not request a password reset, you can safely ignore this email.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    const messageId = data?.id ?? null;
    logger.info(
      {
        scope: 'resend.password-reset',
        messageId,
        to: payload.to,
      },
      'Password reset email sent via Resend'
    );

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    logger.error(
      {
        scope: 'resend.password-reset',
        to: payload.to,
        error: error instanceof Error ? error.message : error,
      },
      'Failed to send password reset email'
    );
    throw error;
  }
}

export { EmailConfigurationError };
