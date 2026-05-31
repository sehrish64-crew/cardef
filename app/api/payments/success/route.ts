/**
 * Complete Payment Success Handler
 * Handles all payment success scenarios with comprehensive email notifications
 * 
 * Usage:
 * POST /api/payments/success
 * Body: { type: 'order' | 'registration', ...data }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getAdminEmail, sanitizeForEmail } from '@/lib/email-service';

interface OrderPaymentData {
  type: 'order';
  orderNumber: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  packageType: string;
  transactionId?: string;
  paymentMethod?: string;
  vin?: string;
  vehicleType?: string;
}

interface RegistrationPaymentData {
  type: 'registration';
  registrationNumber: string;
  registrationId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  vehicleTitle: string;
  transactionId?: string;
  paymentMethod?: string;
}

type PaymentData = OrderPaymentData | RegistrationPaymentData;

function generateOrderPaymentSuccessAdminEmail(data: OrderPaymentData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
        .section { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #22c55e; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 600; }
        .value { font-weight: bold; color: #22c55e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Successfully Received!</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A new payment has been successfully processed for a vehicle history report.</p>
          
          <div class="section">
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #22c55e; font-size: 16px;">💳 Payment Details</p>
            <div class="row">
              <span class="label">Order #:</span>
              <span class="value">${data.orderNumber}</span>
            </div>
            <div class="row">
              <span class="label">Amount:</span>
              <span class="value">${data.currency} ${data.amount.toFixed(2)}</span>
            </div>
            <div class="row">
              <span class="label">Package:</span>
              <span class="value">${data.packageType}</span>
            </div>
            ${data.transactionId ? `<div class="row">
              <span class="label">Transaction ID:</span>
              <span class="value">${data.transactionId}</span>
            </div>` : ''}
            ${data.paymentMethod ? `<div class="row">
              <span class="label">Payment Method:</span>
              <span class="value">${data.paymentMethod}</span>
            </div>` : ''}
          </div>
          
          <div class="section">
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #22c55e; font-size: 16px;">👤 Customer Details</p>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${data.customerName}</span>
            </div>
            <div class="row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></span>
            </div>
            ${data.vin ? `<div class="row">
              <span class="label">VIN:</span>
              <span class="value">${data.vin}</span>
            </div>` : ''}
            ${data.vehicleType ? `<div class="row">
              <span class="label">Vehicle Type:</span>
              <span class="value">${data.vehicleType}</span>
            </div>` : ''}
          </div>
          
          <p style="text-align: center; color: #666; margin-top: 30px; font-size: 14px;">
            The order has been marked as paid and the report generation process has been initiated.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderPaymentSuccessCustomerEmail(data: OrderPaymentData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
        .box { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .timeline { margin: 20px 0; }
        .timeline-item { display: flex; margin: 20px 0; }
        .timeline-num { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 50%; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .timeline-content h3 { margin: 0 0 5px 0; color: #3b82f6; }
        .timeline-content p { margin: 0; color: #666; font-size: 14px; }
        .info { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Payment Confirmed!</h1>
          <p>Your report is being processed</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          
          <p>Thank you for your purchase! Your payment has been successfully processed and your vehicle history report is now being prepared.</p>
          
          <div class="box" style="background: #f0fdf4; border-left-color: #22c55e;">
            <p style="margin: 0;"><strong>Order Confirmed:</strong> ${data.orderNumber}</p>
            <p style="margin: 8px 0 0 0; color: #666;"><strong>${data.currency} ${data.amount.toFixed(2)}</strong> for ${data.packageType} Report</p>
          </div>
          
          <div class="timeline">
            <p style="font-weight: bold; margin-bottom: 15px; color: #3b82f6;">📅 What Happens Next:</p>
            <div class="timeline-item">
              <div class="timeline-num">✓</div>
              <div class="timeline-content">
                <h3>Payment Confirmed</h3>
                <p>Your payment has been successfully processed.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-num">2</div>
              <div class="timeline-content">
                <h3>Report Generation (12-24 hours)</h3>
                <p>We're now generating your complete vehicle history report. This typically takes 12 to 24 hours.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-num">3</div>
              <div class="timeline-content">
                <h3>Report Ready</h3>
                <p>You'll receive an email with your report link and a summary of all findings.</p>
              </div>
            </div>
          </div>
          
          <div class="info">
            <p style="margin: 0;"><strong>📧 Tip:</strong> Add our email to your contacts to ensure you don't miss the report delivery email. Check your spam folder just in case!</p>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            If you have any questions, feel free to reply to this email or contact our support team. We're here to help!
          </p>
          
          <div class="footer">
            <p>Thank you for choosing CarReaders!</p>
            <p>Order Reference: ${data.orderNumber}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentData = await request.json();

    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing payment type' },
        { status: 400 }
      );
    }

    console.log(`[PAYMENT SUCCESS] Processing ${body.type} payment notification`);

    try {
      const adminEmail = getAdminEmail();

      if (body.type === 'order') {
        const orderData = body as OrderPaymentData;

        // Validate order data
        if (!orderData.orderNumber || !orderData.customerEmail || !orderData.amount) {
          return NextResponse.json(
            { success: false, error: 'Missing required order fields' },
            { status: 400 }
          );
        }

        // Send admin notification
        const adminHtml = generateOrderPaymentSuccessAdminEmail(orderData);
        const adminResult = await sendEmail({
          to: adminEmail,
          subject: `💳 Payment Received - Order ${orderData.orderNumber}`,
          html: adminHtml,
        });

        // Send customer confirmation
        const customerHtml = generateOrderPaymentSuccessCustomerEmail(orderData);
        const customerResult = await sendEmail({
          to: orderData.customerEmail,
          subject: `✓ Payment Confirmed - Order ${orderData.orderNumber}`,
          html: customerHtml,
        });

        if (!adminResult.success || !customerResult.success) {
          console.error('[PAYMENT SUCCESS] One or more emails failed', {
            admin: adminResult,
            customer: customerResult,
          });
          return NextResponse.json(
            {
              success: false,
              error: 'Payment recorded but failed to send some notifications',
            },
            { status: 500 }
          );
        }

        console.log(`[PAYMENT SUCCESS] ✓ Order payment emails sent successfully`);

        return NextResponse.json({
          success: true,
          message: 'Payment success notifications sent',
          orderNumber: orderData.orderNumber,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Unknown payment type' },
        { status: 400 }
      );
    } catch (error: any) {
      console.error('[PAYMENT SUCCESS] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (parseError: any) {
    console.error('[PAYMENT SUCCESS] Parse error:', parseError);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Payment success notification endpoint is ready',
    methods: ['POST'],
  });
}
