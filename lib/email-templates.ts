/**
 * Email Template System
 * Centralized, reusable email templates for all form types
 * 
 * Usage:
 *   import { EmailTemplates } from '@/lib/email-templates'
 *   const html = EmailTemplates.contactForm({ name, email, subject, message })
 */

interface BaseEmailData {
  baseUrl?: string;
  lang?: string;
}

// ============================================================================
// UTILITY: Format data fields as HTML rows
// ============================================================================
export function formatFieldRow(label: string, value: string | number | undefined, bold = false): string {
  const val = value === undefined || value === null ? 'N/A' : String(value);
  const weight = bold ? 'bold' : 'normal';
  return `
    <tr style="border-bottom: 1px solid #f0f0f0;">
      <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 30%; text-align: right; padding-right: 20px;">${label}:</td>
      <td style="padding: 8px 12px; color: #333; font-weight: ${weight};">${val}</td>
    </tr>
  `;
}

// ============================================================================
// BASE TEMPLATE: HTML wrapper with styling
// ============================================================================
function baseTemplate(title: string, content: string, accentColor = '#3b82f6'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%); padding: 30px 20px; color: white; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 20px; background: #fafafa;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">This is an automated email from Carreaders. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EmailTemplates = {
  /**
   * Contact Form Submission
   */
  contactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    submittedAt?: string;
  }, baseUrl = ''): string {
    const content = `
      <p>A new contact form submission has been received:</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        ${formatFieldRow('Name', data.name, true)}
        ${formatFieldRow('Email', data.email)}
        ${formatFieldRow('Subject', data.subject, true)}
      </table>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin-top: 0; font-weight: bold; color: #1e40af;">Message:</p>
        <p style="white-space: pre-wrap; word-wrap: break-word; background: #f9fafb; padding: 10px; border-radius: 4px; color: #555;">${data.message}</p>
      </div>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        Submitted: ${data.submittedAt || new Date().toLocaleString()}
      </p>
    `;
    return baseTemplate('📧 New Contact Form Submission', content, '#3b82f6');
  },

  /**
   * Review Submission
   */
  reviewSubmission(data: {
    name: string;
    email: string;
    rating: number;
    comment: string;
    submittedAt?: string;
  }, baseUrl = ''): string {
    const stars = '⭐'.repeat(Math.min(data.rating, 5));
    const content = `
      <p>A new review has been submitted to your site:</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        ${formatFieldRow('Reviewer Name', data.name, true)}
        ${formatFieldRow('Email', data.email)}
        ${formatFieldRow('Rating', `${stars} (${data.rating}/5)`, true)}
      </table>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin-top: 0; font-weight: bold; color: #92400e;">Review Comment:</p>
        <p style="white-space: pre-wrap; word-wrap: break-word; background: #fffbf0; padding: 10px; border-radius: 4px; color: #555;">${data.comment || '(No comment provided)'}</p>
      </div>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        Submitted: ${data.submittedAt || new Date().toLocaleString()}
      </p>
    `;
    return baseTemplate('⭐ New Review Submitted', content, '#f59e0b');
  },

  /**
   * Order Notification (Admin)
   */
  orderNotificationAdmin(data: {
    orderNumber: string;
    orderId: number | string;
    customerEmail: string;
    customerName?: string;
    packageType: string;
    amount: number;
    currency?: string;
    paymentStatus?: string;
    vinNumber?: string;
    createdAt?: string;
    baseUrl?: string;
  }): string {
    const currency = data.currency || 'USD';
    const orderLink = `${data.baseUrl || ''}/admin/dashboard/orders/${data.orderId}`;
    
    const content = `
      <p>✅ A new order has been created in your system:</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        ${formatFieldRow('Order Number', data.orderNumber, true)}
        ${formatFieldRow('Order ID', data.orderId)}
        ${formatFieldRow('Customer', data.customerName || data.customerEmail, true)}
        ${formatFieldRow('Email', data.customerEmail)}
        ${formatFieldRow('Package', data.packageType, true)}
        ${formatFieldRow('Amount', \`\${currency} \${Number(data.amount).toFixed(2)}\`, true)}
        ${formatFieldRow('Payment Status', data.paymentStatus || 'pending')}
        ${data.vinNumber ? formatFieldRow('VIN', data.vinNumber) : ''}
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${orderLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.2s;">
          View Order in Dashboard
        </a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        Created: ${data.createdAt || new Date().toLocaleString()}
      </p>
    `;
    return baseTemplate('🛒 New Order Received', content, '#10b981');
  },

  /**
   * Order Confirmation (Customer)
   */
  orderConfirmationCustomer(data: {
    orderNumber: string;
    orderId: number | string;
    customerName?: string;
    packageType: string;
    amount: number;
    currency?: string;
    baseUrl?: string;
  }): string {
    const currency = data.currency || 'USD';
    const checkoutLink = `${data.baseUrl || ''}/checkout/${data.orderId}`;
    
    const content = `
      <p>Thank you for your order! ${data.customerName ? 'Hello ' + data.customerName + '!' : ''}</p>
      
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">Order Confirmation</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${formatFieldRow('Order Number', data.orderNumber, true)}
          ${formatFieldRow('Package', data.packageType, true)}
          ${formatFieldRow('Amount', \`\${currency} \${Number(data.amount).toFixed(2)}\`, true)}
        </table>
      </div>
      
      <p>We have received your order and it is being processed. You can view your order details and proceed to payment below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkoutLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.2s;">
          View Your Order
        </a>
      </div>
      
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best Regards,<br/><strong>Carreaders Team</strong></p>
    `;
    return baseTemplate('✅ Order Confirmation', content, '#10b981');
  },

  /**
   * Vehicle Registration Notification (Admin)
   */
  vehicleRegistrationNotificationAdmin(data: {
    registrationNumber: string;
    registrationId: number | string;
    ownerName?: string;
    ownerEmail: string;
    ownerPhone?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vin?: string;
    licensePlate?: string;
    description?: string;
    price?: number;
    currency?: string;
    paymentStatus?: string;
    baseUrl?: string;
  }): string {
    const currency = data.currency || 'USD';
    const regLink = `${data.baseUrl || ''}/admin/dashboard/vehicle-registrations/${data.registrationId}`;
    
    const content = `
      <p>✅ A new vehicle has been registered for listing:</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        ${formatFieldRow('Registration Number', data.registrationNumber, true)}
        ${formatFieldRow('Owner', data.ownerName || data.ownerEmail, true)}
        ${formatFieldRow('Email', data.ownerEmail)}
        ${data.ownerPhone ? formatFieldRow('Phone', data.ownerPhone) : ''}
        ${data.vehicleYear ? formatFieldRow('Year', data.vehicleYear) : ''}
        ${formatFieldRow('Make', data.vehicleMake || 'N/A')}
        ${formatFieldRow('Model', data.vehicleModel || 'N/A')}
        ${data.vin ? formatFieldRow('VIN', data.vin) : ''}
        ${data.licensePlate ? formatFieldRow('License Plate', data.licensePlate) : ''}
        ${data.price ? formatFieldRow('Asking Price', \`\${currency} \${Number(data.price).toFixed(2)}\`) : ''}
      </table>
      
      ${data.description ? \`
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin-top: 0; font-weight: bold; color: #1e40af;">Description:</p>
          <p style="white-space: pre-wrap; word-wrap: break-word; background: #f9fafb; padding: 10px; border-radius: 4px; color: #555;">\${data.description}</p>
        </div>
      \` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${regLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.2s;">
          Review Registration
        </a>
      </div>
    `;
    return baseTemplate('🚗 New Vehicle Registration', content, '#3b82f6');
  },

  /**
   * Payment Success (Admin)
   */
  paymentSuccessAdmin(data: {
    orderNumber: string;
    transactionId?: string;
    packageType: string;
    amount: number;
    currency?: string;
    customerName?: string;
    customerEmail: string;
    vinNumber?: string;
  }): string {
    const currency = data.currency || 'USD';
    const content = `
      <p>🎉 A payment has been successfully processed!</p>
      
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        ${formatFieldRow('Order Number', data.orderNumber, true)}
        ${data.transactionId ? formatFieldRow('Transaction ID', data.transactionId) : ''}
        ${formatFieldRow('Customer', data.customerName || data.customerEmail, true)}
        ${formatFieldRow('Email', data.customerEmail)}
        ${formatFieldRow('Package', data.packageType, true)}
        ${formatFieldRow('Amount', \`\${currency} \${Number(data.amount).toFixed(2)}\`, true)}
        ${data.vinNumber ? formatFieldRow('VIN', data.vinNumber) : ''}
      </table>
      
      <p style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; color: #065f46;">
        <strong>Status:</strong> Payment received and processed. Order is marked as completed.
      </p>
    `;
    return baseTemplate('💰 Payment Successful', content, '#10b981');
  },

  /**
   * Payment Success (Customer)
   */
  paymentSuccessCustomer(data: {
    orderNumber: string;
    packageType: string;
    amount: number;
    currency?: string;
    customerName?: string;
    processingTimeHours?: number;
  }): string {
    const currency = data.currency || 'USD';
    const hours = data.processingTimeHours || 12;
    
    const content = `
      <p>${data.customerName ? 'Hello ' + data.customerName + '!' : 'Hello!'}</p>
      
      <p>Thank you for your purchase! We have received your payment of <strong>${currency} ${Number(data.amount).toFixed(2)}</strong> for your ${data.packageType} report.</p>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e;">
        <p style="margin-top: 0; font-weight: bold;">⏱️ Wait Time Notice</p>
        <p style="margin: 5px 0 0 0;">Your report will be ready in approximately <strong>${hours}-${hours + 1} hours</strong>. We will send you a separate email with your complete report once it has been generated.</p>
      </div>
      
      <p>In the meantime, you can track your order status by logging into your account.</p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
      
      <p>Best Regards,<br/><strong>Carreaders Team</strong></p>
    `;
    return baseTemplate('✅ Payment Received - Report Processing', content, '#10b981');
  },
};

// ============================================================================
// USAGE EXAMPLE (for reference)
// ============================================================================
/*
import { EmailTemplates } from '@/lib/email-templates'

// Contact form email
const contactHtml = EmailTemplates.contactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry about reports',
  message: 'I would like to know more about your services.'
})

// Review submission email
const reviewHtml = EmailTemplates.reviewSubmission({
  name: 'Jane Smith',
  email: 'jane@example.com',
  rating: 5,
  comment: 'Great service! Very detailed report.'
})

// Order notification (admin)
const orderAdminHtml = EmailTemplates.orderNotificationAdmin({
  orderNumber: 'ORD-2024-001',
  orderId: 123,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  packageType: 'Premium Report',
  amount: 89.99,
  currency: 'USD',
  baseUrl: 'https://carreaders.com'
})

// Payment success (customer)
const paymentCustomerHtml = EmailTemplates.paymentSuccessCustomer({
  orderNumber: 'ORD-2024-001',
  packageType: 'Premium Report',
  amount: 89.99,
  currency: 'USD',
  customerName: 'John Doe',
  processingTimeHours: 12
})
*/
