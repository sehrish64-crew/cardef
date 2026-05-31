/**
 * Email Utilities & Helpers
 * Centralized email sending functionality with error handling and logging
 * Updated for Port 587 TLS with Gmail
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
 * Send email via SMTP (Nodemailer) - Optimized for Port 587 TLS
 */
async function sendViaSmtp(options: EmailOptions): Promise<EmailResult> {
  try {
    const nodemailer = await import('nodemailer');
    
    const port = parseInt(process.env.SMTP_PORT || '587');
    
    // Auto-detect secure flag based on port
    // Port 587 = TLS (secure: false)
    // Port 465 = SSL (secure: true)
    let secure = false;
    if (port === 465) {
      secure = true;
      console.log(`[EMAIL] Using SSL mode for port ${port}`);
    } else if (port === 587) {
      secure = false;
      console.log(`[EMAIL] Using TLS mode for port ${port}`);
    } else {
      // Fallback to env variable for custom ports
      secure = process.env.SMTP_SECURE === 'true';
    }
    
    console.log(`[EMAIL] SMTP Config: ${process.env.SMTP_HOST}:${port} secure=${secure}`);
    
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Required for Hostinger
        ciphers: 'SSLv3:TLSv1.2',
      },
      // Timeout settings for Hostinger
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
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
    console.error(`[EMAIL] Error Code:`, error.code);
    console.error(`[EMAIL] Error Command:`, error.command);
    throw error;
  }
}

/**
 * Send email via Resend API (Fallback)
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
      console.warn(`[EMAIL] SMTP failed: ${smtpError.message}`);
      console.warn(`[EMAIL] Attempting fallback to Resend...`);
      
      if (!hasResend) {
        console.error(`[EMAIL] ✗ No fallback provider available`);
        return {
          success: false,
          error: smtpError.message || 'SMTP failed and no fallback configured',
        };
      }
    }
  }

  // Try Resend if configured (or as fallback)
  if (hasResend) {
    try {
      return await sendViaResend(options);
    } catch (resendError: any) {
      console.error(`[EMAIL] ✗ Resend also failed: ${resendError.message}`);
      return {
        success: false,
        error: `All email providers failed: ${resendError.message}`,
        provider: 'resend',
      };
    }
  }

  // No provider configured
  console.error('[EMAIL] ✗ No email provider configured (SMTP_HOST or RESEND_API_KEY)');
  return {
    success: false,
    error: 'No email provider configured. Please set SMTP_HOST or RESEND_API_KEY',
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
      <title>${options?.title || 'CarReaders'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .email-header {
          background-color: #3b82f6;
          padding: 20px;
          text-align: center;
        }
        .email-header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .email-content {
          padding: 30px;
        }
        .email-footer {
          background-color: #f8f9fa;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e9ecef;
        }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>CarReaders</h1>
        </div>
        <div class="email-content">
          ${content}
        </div>
        <div class="email-footer">
          <p>&copy; ${new Date().getFullYear()} CarReaders. All rights reserved.</p>
          <p>carreaders@gmail.com</p>
        </div>
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
  wrapEmailTemplate,
};