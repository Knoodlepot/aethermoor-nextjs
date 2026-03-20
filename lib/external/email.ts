
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
    subject: 'Welcome to Aethermoor — your adventure begins',
    text: [
      `Welcome to Aethermoor, ${playerName}!`,
      '',
      'You have 50 free tokens waiting for you.',
      '',
      'A few tips before you begin:',
      '  • Choose your class on the character screen — Warrior, Rogue, Mage, or Cleric each play differently.',
      '  • Type naturally. The narrator responds to anything — ask questions, try odd things, push the world.',
      '  • Cloud Save often. Hit the Save button after each big moment so your progress is safe.',
      '  • Tokens: Haiku costs 1/turn (fast), Sonnet costs 4/turn (richer prose). Change in Options.',
      '',
      'Play now: https://aethermoor.com',
      '',
      'Need help? Email support.aethermoor@gmail.com',
    ].join('\n'),
    html: `
      <div style="background:#0d0b07;color:#c4a87a;font-family:Georgia,serif;padding:32px 28px;max-width:520px;margin:0 auto">
        <h1 style="font-family:'Cinzel',Georgia,serif;color:#f0c060;font-size:1.5rem;letter-spacing:2px;margin-top:0">
          ⚔ AETHERMOOR
        </h1>
        <p style="font-size:1rem;margin-top:0">Welcome, <strong style="color:#f0c060">${playerName}</strong>.</p>
        <p>You have <strong style="color:#80c060">50 free tokens</strong> waiting — enough to begin your adventure right now.</p>
        <hr style="border:none;border-top:1px solid #2e2010;margin:24px 0"/>
        <p style="color:#a08060;font-size:0.9rem;margin-bottom:8px"><strong style="color:#c4a87a">A few tips before you enter:</strong></p>
        <ul style="color:#a08060;font-size:0.9rem;line-height:1.8;padding-left:20px;margin:0 0 24px">
          <li>Pick your class — Warrior, Rogue, Mage, or Cleric all play differently.</li>
          <li>Type naturally. The narrator understands anything — questions, odd choices, pushing back.</li>
          <li>Hit <strong style="color:#c4a87a">Save</strong> after big moments so your progress is safe in the cloud.</li>
          <li>Haiku costs 1 token/turn (fast), Sonnet costs 4/turn (richer prose). Change in Options.</li>
        </ul>
        <a href="https://aethermoor.com"
           style="display:inline-block;background:#c4873a;color:#0d0b07;font-family:'Cinzel',Georgia,serif;font-weight:700;padding:12px 28px;text-decoration:none;border-radius:3px;font-size:0.95rem;letter-spacing:1px">
          Enter Aethermoor
        </a>
        <hr style="border:none;border-top:1px solid #2e2010;margin:28px 0 16px"/>
        <p style="color:#6a5535;font-size:0.8rem;margin:0">
          Questions? Reply to this email or write to
          <a href="mailto:support.aethermoor@gmail.com" style="color:#a08060">support.aethermoor@gmail.com</a>
        </p>
      </div>
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
