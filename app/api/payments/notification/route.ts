/**
 * Payment Notification Email Endpoint
 * Sends professional payment confirmation emails to both admin and customer
 * Called when payment is successfully processed
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, formatCurrencyForEmail, formatDateForEmail, getAdminEmail } from '@/lib/email-service';
import { EmailTemplates } from '@/lib/email-templates-professional';

interface PaymentNotificationRequest {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  packageType: string;
  transactionId?: string;
  paymentMethod?: string;
  vehicleInfo?: string;
  dashboardUrl?: string;
  supportEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentNotificationRequest = await request.json();

    // ===== VALIDATION =====
    const { orderNumber, customerName, customerEmail, amount, currency, packageType } = body;
    const effectiveCustomerName = customerName || (customerEmail ? customerEmail.split('@')[0] : 'Customer');

    if (!orderNumber || !customerEmail || !amount || !currency || !packageType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields for payment notification',
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment amount',
        },
        { status: 400 }
      );
    }

    console.log(`[PAYMENT NOTIFICATION] Processing payment for order ${orderNumber}`);

    try {
      const adminEmail = getAdminEmail();
      const supportEmail = body.supportEmail || adminEmail;

      // ===== SEND ADMIN NOTIFICATION =====
      const adminHtmlContent = EmailTemplates.paymentConfirmationToAdmin({
        orderNumber,
        customerName: effectiveCustomerName,
        customerEmail,
        amount,
        currency,
        packageType,
        transactionId: body.transactionId,
        paymentMethod: body.paymentMethod,
        vehicleInfo: body.vehicleInfo,
        dashboardUrl: body.dashboardUrl,
      });

      const adminResult = await sendEmail({
        to: adminEmail,
        subject: `💳 Payment Received - Order ${orderNumber}`,
        html: adminHtmlContent,
      });

      if (!adminResult.success) {
        console.error('[PAYMENT NOTIFICATION] Failed to send admin notification:', adminResult.error);
        // Don't fail the entire request if admin notification fails
      } else {
        console.log(`[PAYMENT NOTIFICATION] ✓ Admin notification sent for order ${orderNumber}`);
      }

      // ===== SEND CUSTOMER CONFIRMATION =====
      const customerHtmlContent = EmailTemplates.paymentConfirmationToCustomer({
        orderNumber,
        customerName: effectiveCustomerName,
        amount,
        currency,
        packageType,
        estimatedDelivery: '12 to 24 hours',
        supportEmail,
      });

      const customerResult = await sendEmail({
        to: customerEmail,
        subject: `✓ Payment Confirmed - Order ${orderNumber}`,
        html: customerHtmlContent,
        replyTo: supportEmail,
      });

      if (!customerResult.success) {
        console.error('[PAYMENT NOTIFICATION] Failed to send customer confirmation:', customerResult.error);
        return NextResponse.json(
          {
            success: false,
            error: 'Payment recorded but failed to send confirmation email. Please check your email or contact support.',
            debug: process.env.NODE_ENV === 'development' ? customerResult.error : undefined,
          },
          { status: 500 }
        );
      }

      console.log(`[PAYMENT NOTIFICATION] ✓ Customer confirmation sent to ${customerEmail}`);

      // ===== SUCCESS RESPONSE =====
      return NextResponse.json({
        success: true,
        message: 'Payment notification emails sent successfully',
        debug: process.env.NODE_ENV === 'development' ? {
          adminMessageId: adminResult.messageId,
          customerMessageId: customerResult.messageId,
          timestamp: new Date().toISOString(),
        } : undefined,
      });
    } catch (error: any) {
      console.error('[PAYMENT NOTIFICATION] Unexpected error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred while sending payment notifications.',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (parseError: any) {
    console.error('[PAYMENT NOTIFICATION] JSON parse error:', parseError);
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request format. Expected JSON body.',
      },
      { status: 400 }
    );
  }
}

/**
 * GET endpoint to verify payment notification system is working
 */
export async function GET(request: NextRequest) {
  const isConfigured = !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
  const hasAdminEmail = !!process.env.ADMIN_EMAIL;

  return NextResponse.json({
    status: isConfigured && hasAdminEmail ? 'ready' : 'not-configured',
    checks: {
      email_provider: process.env.SMTP_HOST ? 'SMTP' : process.env.RESEND_API_KEY ? 'Resend' : 'none',
      admin_email: hasAdminEmail ? 'configured' : 'missing',
    },
    message: isConfigured && hasAdminEmail
      ? 'Payment notification system is ready'
      : 'Payment notification system is not fully configured',
  });
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'POST, GET, OPTIONS',
    },
  });
}
