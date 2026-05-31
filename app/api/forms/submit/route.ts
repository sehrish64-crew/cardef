/**
 * Form Submission Email Endpoint
 * Handles sending emails for all form submissions (contact, feedback, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, validateEmail, sanitizeForEmail, formatDateForEmail, getAdminEmail } from '@/lib/email-service';
import { EmailTemplates } from '@/lib/email-templates-professional';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      subject,
      message,
      formType = 'contact',
      vehicleType,
      vin,
      language = 'en',
    } = body;

    // ===== VALIDATION =====
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // ===== SANITIZE INPUT =====
    const sanitizedData: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      vehicleType?: string;
      vin?: string;
      formType: 'contact' | 'get-report' | 'review';
      submittedAt: string;
    } = {
      name: sanitizeForEmail(name.substring(0, 100)),
      email: email.toLowerCase().trim(),
      phone: phone ? sanitizeForEmail(phone.substring(0, 20)) : undefined,
      subject: sanitizeForEmail((subject || '').substring(0, 200)),
      message: sanitizeForEmail(message.substring(0, 5000)),
      vehicleType: vehicleType ? sanitizeForEmail(vehicleType.substring(0, 50)) : undefined,
      vin: vin ? sanitizeForEmail(vin.substring(0, 17)) : undefined,
      formType: formType as 'contact' | 'get-report' | 'review',
      submittedAt: formatDateForEmail(new Date()),
    };

    console.log(`[FORM SUBMISSION] New ${formType} submission from ${sanitizedData.email}`);

    try {
      const adminEmail = getAdminEmail();

      // ===== SEND TO ADMIN =====
      const adminHtmlContent = EmailTemplates.formSubmissionToAdmin(sanitizedData);

      const adminResult = await sendEmail({
        to: adminEmail,
        subject: `🔔 New Form Submission: ${formType} from ${sanitizedData.name}`,
        html: adminHtmlContent,
      });

      if (!adminResult.success) {
        console.error('[FORM SUBMISSION] Failed to send admin notification:', adminResult.error);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to submit form. Please try again later.',
            debug: process.env.NODE_ENV === 'development' ? adminResult.error : undefined,
          },
          { status: 500 }
        );
      }

      // ===== SEND CONFIRMATION TO CUSTOMER =====
      const customerConfirmationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .box { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Thank You!</h1>
              <p>We received your ${formType === 'contact' ? 'message' : formType === 'get-report' ? 'report request' : 'submission'}</p>
            </div>
            <div class="content">
              <p>Hi ${sanitizedData.name},</p>
              
              <p>Thank you for reaching out to us. We've successfully received your ${formType === 'contact' ? 'message' : formType === 'get-report' ? 'report request' : 'submission'} and will get back to you as soon as possible.</p>
              
              <div class="box">
                <p><strong>Submission Details:</strong></p>
                <p>Type: ${formType === 'contact' ? 'Contact Form' : formType === 'get-report' ? 'Report Request' : 'Feedback'}<br/>
                Received: ${sanitizedData.submittedAt}<br/>
                Reference Email: ${sanitizedData.email}</p>
              </div>
              
              <p>Our team typically responds within 24-48 hours. If you don't hear from us within that time, please check your spam folder or feel free to reach out again.</p>
              
              <div class="footer">
                <p>Best regards,<br/>CarReaders Support Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send confirmation to customer but don't fail if it doesn't send
      try {
        await sendEmail({
          to: sanitizedData.email,
          subject: 'We received your message - CarReaders Support',
          html: customerConfirmationHtml,
        });
        console.log(`[FORM SUBMISSION] Confirmation sent to customer ${sanitizedData.email}`);
      } catch (customerEmailError) {
        console.warn('[FORM SUBMISSION] Failed to send customer confirmation (non-critical):', customerEmailError);
      }

      // ===== SUCCESS RESPONSE =====
      console.log(`[FORM SUBMISSION] ✓ Successfully processed ${formType} from ${sanitizedData.email}`);

      return NextResponse.json({
        success: true,
        message: 'Thank you! Your message has been received. We will get back to you shortly.',
        debug: process.env.NODE_ENV === 'development' ? { messageId: adminResult.messageId } : undefined,
      });
    } catch (error: any) {
      console.error('[FORM SUBMISSION] Unexpected error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred while processing your form.',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (parseError: any) {
    console.error('[FORM SUBMISSION] JSON parse error:', parseError);
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request format. Expected JSON body.',
      },
      { status: 400 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Length': '0',
    },
  });
}
