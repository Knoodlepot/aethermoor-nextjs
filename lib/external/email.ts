
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@aethermoor.com';
let warnedMissingResendKey = false;

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email via Resend API
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: EmailOptions): Promise<{ success: boolean; error?: string }> {

  // In development or without API key, just log ONCE per session
  if (!RESEND_API_KEY) {
    if (!warnedMissingResendKey) {
      console.warn('[EMAIL] RESEND_API_KEY missing: emails will be logged, not sent.');
      warnedMissingResendKey = true;
    }
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        reply_to: ['support.aethermoor@gmail.com'],
        subject,
        text,
        html: html || `<p>${text.replace(/\n/g, '</p><p>')}</p>`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[RESEND] Error ${response.status}:`, body);
      return {
        success: false,
        error: `Email service error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[RESEND] Failed to send email:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  gameUrl: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${gameUrl}?reset=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Aethermoor — Reset your password',
    text: `Reset your Aethermoor password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <p>Click to reset your Aethermoor password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p><small>This link expires in 1 hour.</small></p>
    `,
  });
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  verifyToken: string,
  gameUrl: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${gameUrl}?verify=${verifyToken}`;

  return sendEmail({
    to: email,
    subject: 'Aethermoor — Verify your email',
    text: `Verify your email:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <p>Verify your email:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p><small>This link expires in 24 hours.</small></p>
    `,
  });
}

/**
 * Send welcome email to new player
 */
export async function sendWelcomeEmail(
  email: string,
  playerName: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Aethermoor!',
    text: `Welcome to Aethermoor, ${playerName}!\n\nYour adventure awaits. Begin your journey and uncover the mysteries of this fantastical world.`,
    html: `
      <p>Welcome to Aethermoor, <strong>${playerName}</strong>!</p>
      <p>Your adventure awaits. Begin your journey and uncover the mysteries of this fantastical world.</p>
    `,
  });
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): boolean {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured (emails will be logged only)');
    return false;
  }
  return true;
}
