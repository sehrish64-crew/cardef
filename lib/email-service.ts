/**
 * Email Utilities & Helpers
 * Centralized email sending functionality with error handling and logging
 */

import { NextRequest } from 'next/server';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'smtp' | 'resend' | 'none';
}

/**
 * Get the configured "from" address for emails
 */
export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    `CarReaders <${process.env.SMTP_USER || 'noreply@example.com'}>`
  );
}

/**
 * Check if email system is properly configured
 */
export function isEmailConfigured(): {
  configured: boolean;
  provider?: 'smtp' | 'resend';
  warnings?: string[];
} {
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasResend = !!process.env.RESEND_API_KEY;
  const warnings: string[] = [];

  if (!hasSmtp && !hasResend) {
    warnings.push('No email provider configured');
  }

  if (!process.env.ADMIN_EMAIL) {
    warnings.push('ADMIN_EMAIL not configured');
  }

  const provider = hasSmtp ? 'smtp' : hasResend ? 'resend' : undefined;

  return {
    configured: !!(hasSmtp || hasResend),
    provider: provider as 'smtp' | 'resend' | undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Send email via SMTP (Nodemailer)
 */
async function sendViaSmtp(options: EmailOptions): Promise<EmailResult> {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: options.from || getEmailFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    });

    console.log(`[EMAIL] ✓ Sent via SMTP to ${options.to}:`, info.messageId || info.response);

    return {
      success: true,
      messageId: info.messageId || info.response,
      provider: 'smtp',
    };
  } catch (error: any) {
    console.error(`[EMAIL] ✗ SMTP Error to ${options.to}:`, error.message);
    throw error;
  }
}

/**
 * Send email via Resend API
 */
async function sendViaResend(options: EmailOptions): Promise<EmailResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: options.from || getEmailFromAddress(),
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Resend API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`[EMAIL] ✓ Sent via Resend to ${options.to}:`, data.id);

    return {
      success: true,
      messageId: data.id,
      provider: 'resend',
    };
  } catch (error: any) {
    console.error(`[EMAIL] ✗ Resend Error to ${options.to}:`, error.message);
    throw error;
  }
}

/**
 * Main email sending function with automatic provider selection and fallback
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  console.log(`[EMAIL] Attempting to send to ${options.to}: "${options.subject}"`);

  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasResend = !!process.env.RESEND_API_KEY;

  // Try SMTP first if configured
  if (hasSmtp) {
    try {
      return await sendViaSmtp(options);
    } catch (smtpError: any) {
      console.warn(`[EMAIL] SMTP failed, attempting fallback to Resend...`);
      
      if (!hasResend) {
        console.error(`[EMAIL] ✗ No email provider available`);
        return {
          success: false,
          error: 'Email system not properly configured',
        };
      }
    }
  }

  // Try Resend if configured
  if (hasResend) {
    try {
      return await sendViaResend(options);
    } catch (resendError: any) {
      console.error(`[EMAIL] ✗ Resend also failed: ${resendError.message}`);
      return {
        success: false,
        error: `Email sending failed: ${resendError.message}`,
        provider: 'resend',
      };
    }
  }

  // No provider configured
  console.error('[EMAIL] ✗ No email provider configured (SMTP_HOST or RESEND_API_KEY)');
  return {
    success: false,
    error: 'No email provider configured',
  };
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS in emails
 */
export function sanitizeForEmail(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format currency for email display
 */
export function formatCurrencyForEmail(amount: number, currency: string = 'USD'): string {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date for email display
 */
export function formatDateForEmail(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get admin email address
 */
export function getAdminEmail(): string {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured in environment variables');
  }
  return adminEmail;
}

/**
 * Extract domain from email address
 */
export function getEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * Format email for display (strip domain if same as configured)
 */
export function formatEmailForDisplay(email: string, hideAt: boolean = false): string {
  if (hideAt) {
    const [local] = email.split('@');
    return local + '@...';
  }
  return email;
}

/**
 * Create HTML wrapper with consistent styling
 */
export function wrapEmailTemplate(content: string, options?: { title?: string }): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${content}
      </div>
    </body>
    </html>
  `;
}

/**
 * Check rate limiting for email sending
 */
export async function checkEmailRateLimit(email: string, limit: number = 5): Promise<boolean> {
  // This is a placeholder - implement with Redis or similar in production
  // For now, just return true (allow)
  return true;
}

export default {
  sendEmail,
  getEmailFromAddress,
  isEmailConfigured,
  validateEmail,
  sanitizeForEmail,
  formatCurrencyForEmail,
  formatDateForEmail,
  getAdminEmail,
  getEmailDomain,
};
