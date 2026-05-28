/**
 * Email Template Test Script
 * Sends sample emails with real form data
 * 
 * Usage:
 *   node scripts/test-email-templates.js
 * 
 * This tests all email template types with realistic form data
 */

const nodemailer = require('nodemailer');

// Configuration from environment or defaults
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || 'your-email@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-app-password';
const TEST_EMAIL = process.env.TO || 'test@example.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// ============================================================================
// UTILITY: Format data fields as HTML rows
// ============================================================================
function formatFieldRow(label, value, bold = false) {
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
function baseTemplate(title, content, accentColor = '#3b82f6') {
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

const EmailTemplates = {
  /**
   * Contact Form Submission
   */
  contactForm(data) {
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
  reviewSubmission(data) {
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
  orderNotificationAdmin(data) {
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
  orderConfirmationCustomer(data) {
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
  vehicleRegistrationNotificationAdmin(data) {
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
  paymentSuccessAdmin(data) {
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
  paymentSuccessCustomer(data) {
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

// Sample form data
const sampleData = {
  contact: {
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    subject: 'I need help with vehicle history reports',
    message: 'Hello,\n\nI am interested in getting a detailed vehicle history report for my upcoming purchase. Can you provide information about:\n\n1. What information is included in the Premium Report?\n2. How long does it take to receive the report?\n3. Do you offer a satisfaction guarantee?\n\nThank you for your time.\n\nBest regards,\nAhmed'
  },
  review: {
    name: 'Fatima Ahmed',
    email: 'fatima@example.com',
    rating: 5,
    comment: 'Excellent service! The vehicle history report was incredibly detailed and helped me make an informed decision about my purchase. The team was very responsive to my questions. Highly recommended!'
  },
  order: {
    orderNumber: 'ORD-2026-0524-001',
    orderId: 42,
    customerName: 'Muhammad Hassan',
    customerEmail: 'hassan@example.com',
    packageType: 'Premium Report',
    amount: 89.99,
    currency: 'USD',
    paymentStatus: 'pending',
    vinNumber: '1HGBH41JXMN109186',
    baseUrl: 'http://localhost:3000'
  },
  vehicleReg: {
    registrationNumber: 'VR-2026-0524-001',
    registrationId: 15,
    ownerName: 'Zahra Khan',
    ownerEmail: 'zahra@example.com',
    ownerPhone: '+92 300 1234567',
    vehicleYear: 2019,
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    vin: '2HGFC2F52LH123456',
    licensePlate: 'ABC-123',
    description: 'Well-maintained 2019 Honda Civic with full service history. One owner, no accidents. Fresh battery and tires.',
    price: 15000,
    currency: 'USD',
    paymentStatus: 'pending',
    baseUrl: 'http://localhost:3000'
  },
  payment: {
    orderNumber: 'ORD-2026-0524-001',
    transactionId: 'TXN-2026-052400123456',
    packageType: 'Premium Report',
    amount: 89.99,
    currency: 'USD',
    customerName: 'Muhammad Hassan',
    customerEmail: 'hassan@example.com',
    vinNumber: '1HGBH41JXMN109186'
  }
};

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Test email templates
async function testEmailTemplates() {
  console.log('\n📧 Email Template Test Suite\n');
  console.log('=' .repeat(60));
  console.log(`SMTP Configuration:`);
  console.log(`  Host: ${SMTP_HOST}`);
  console.log(`  Port: ${SMTP_PORT}`);
  console.log(`  Secure: ${SMTP_SECURE}`);
  console.log(`  User: ${SMTP_USER}`);
  console.log(`  Test Email: ${TEST_EMAIL}`);
  console.log(`  Admin Email: ${ADMIN_EMAIL}`);
  console.log('=' .repeat(60) + '\n');

  try {
    // Test 1: Contact Form Email
    console.log('1️⃣ Testing Contact Form Email...');
    const contactHtml = EmailTemplates.contactForm({
      ...sampleData.contact,
      submittedAt: new Date().toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      })
    });

    const contactResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `Contact Form: ${sampleData.contact.subject}`,
      html: contactHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${contactResult.messageId}\n`);

    // Test 2: Review Submission Email
    console.log('2️⃣ Testing Review Submission Email...');
    const reviewHtml = EmailTemplates.reviewSubmission({
      ...sampleData.review,
      submittedAt: new Date().toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      })
    });

    const reviewResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Review from ${sampleData.review.name}`,
      html: reviewHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${reviewResult.messageId}\n`);

    // Test 3: Order Notification (Admin)
    console.log('3️⃣ Testing Order Notification Email (Admin)...');
    const orderAdminHtml = EmailTemplates.orderNotificationAdmin(sampleData.order);

    const orderAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Order: ${sampleData.order.orderNumber}`,
      html: orderAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${orderAdminResult.messageId}\n`);

    // Test 4: Order Confirmation (Customer)
    console.log('4️⃣ Testing Order Confirmation Email (Customer)...');
    const orderCustomerHtml = EmailTemplates.orderConfirmationCustomer(sampleData.order);

    const orderCustomerResult = await transporter.sendMail({
      from: SMTP_USER,
      to: sampleData.order.customerEmail,
      subject: `Order Confirmation - ${sampleData.order.orderNumber}`,
      html: orderCustomerHtml
    });
    console.log(`   ✅ Sent to ${sampleData.order.customerEmail}`);
    console.log(`   Message ID: ${orderCustomerResult.messageId}\n`);

    // Test 5: Vehicle Registration (Admin)
    console.log('5️⃣ Testing Vehicle Registration Email (Admin)...');
    const regAdminHtml = EmailTemplates.vehicleRegistrationNotificationAdmin(sampleData.vehicleReg);

    const regAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Vehicle Registration: ${sampleData.vehicleReg.registrationNumber}`,
      html: regAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${regAdminResult.messageId}\n`);

    // Test 6: Payment Success (Admin)
    console.log('6️⃣ Testing Payment Success Email (Admin)...');
    const paymentAdminHtml = EmailTemplates.paymentSuccessAdmin(sampleData.payment);

    const paymentAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `Payment Successful - ${sampleData.payment.orderNumber}`,
      html: paymentAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${paymentAdminResult.messageId}\n`);

    // Test 7: Payment Success (Customer)
    console.log('7️⃣ Testing Payment Success Email (Customer)...');
    const paymentCustomerHtml = EmailTemplates.paymentSuccessCustomer({
      orderNumber: sampleData.payment.orderNumber,
      packageType: sampleData.payment.packageType,
      amount: sampleData.payment.amount,
      currency: sampleData.payment.currency,
      customerName: sampleData.payment.customerName,
      processingTimeHours: 12
    });

    const paymentCustomerResult = await transporter.sendMail({
      from: SMTP_USER,
      to: sampleData.payment.customerEmail,
      subject: `Payment Received - Report Processing! [${sampleData.payment.orderNumber}]`,
      html: paymentCustomerHtml
    });
    console.log(`   ✅ Sent to ${sampleData.payment.customerEmail}`);
    console.log(`   Message ID: ${paymentCustomerResult.messageId}\n`);

    console.log('=' .repeat(60));
    console.log('✅ ALL EMAIL TEMPLATE TESTS PASSED!\n');
    console.log('📧 Sent 7 test emails with real form data:');
    console.log('   • Contact form submission');
    console.log('   • Review notification');
    console.log('   • Order notification (admin)');
    console.log('   • Order confirmation (customer)');
    console.log('   • Vehicle registration (admin)');
    console.log('   • Payment success (admin)');
    console.log('   • Payment success (customer)');
    console.log('\n🔗 Check your email inbox for the test messages!\n');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testEmailTemplates().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { testEmailTemplates, sampleData };

// Configuration from environment or defaults
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || 'your-email@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-app-password';
const TEST_EMAIL = process.env.TO || 'test@example.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// Sample form data
const sampleData = {
  contact: {
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    subject: 'I need help with vehicle history reports',
    message: 'Hello,\n\nI am interested in getting a detailed vehicle history report for my upcoming purchase. Can you provide information about:\n\n1. What information is included in the Premium Report?\n2. How long does it take to receive the report?\n3. Do you offer a satisfaction guarantee?\n\nThank you for your time.\n\nBest regards,\nAhmed'
  },
  review: {
    name: 'Fatima Ahmed',
    email: 'fatima@example.com',
    rating: 5,
    comment: 'Excellent service! The vehicle history report was incredibly detailed and helped me make an informed decision about my purchase. The team was very responsive to my questions. Highly recommended!'
  },
  order: {
    orderNumber: 'ORD-2026-0524-001',
    orderId: 42,
    customerName: 'Muhammad Hassan',
    customerEmail: 'hassan@example.com',
    packageType: 'Premium Report',
    amount: 89.99,
    currency: 'USD',
    paymentStatus: 'pending',
    vinNumber: '1HGBH41JXMN109186',
    baseUrl: 'http://localhost:3000'
  },
  vehicleReg: {
    registrationNumber: 'VR-2026-0524-001',
    registrationId: 15,
    ownerName: 'Zahra Khan',
    ownerEmail: 'zahra@example.com',
    ownerPhone: '+92 300 1234567',
    vehicleYear: 2019,
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    vin: '2HGFC2F52LH123456',
    licensePlate: 'ABC-123',
    description: 'Well-maintained 2019 Honda Civic with full service history. One owner, no accidents. Fresh battery and tires.',
    price: 15000,
    currency: 'USD',
    paymentStatus: 'pending',
    baseUrl: 'http://localhost:3000'
  },
  payment: {
    orderNumber: 'ORD-2026-0524-001',
    transactionId: 'TXN-2026-052400123456',
    packageType: 'Premium Report',
    amount: 89.99,
    currency: 'USD',
    customerName: 'Muhammad Hassan',
    customerEmail: 'hassan@example.com',
    vinNumber: '1HGBH41JXMN109186'
  }
};

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Test email templates
async function testEmailTemplates() {
  console.log('\n📧 Email Template Test Suite\n');
  console.log('=' .repeat(60));
  console.log(`SMTP Configuration:`);
  console.log(`  Host: ${SMTP_HOST}`);
  console.log(`  Port: ${SMTP_PORT}`);
  console.log(`  Secure: ${SMTP_SECURE}`);
  console.log(`  User: ${SMTP_USER}`);
  console.log(`  Test Email: ${TEST_EMAIL}`);
  console.log(`  Admin Email: ${ADMIN_EMAIL}`);
  console.log('=' .repeat(60) + '\n');

  try {
    // Test 1: Contact Form Email
    console.log('1️⃣ Testing Contact Form Email...');
    const contactHtml = EmailTemplates.contactForm({
      ...sampleData.contact,
      submittedAt: new Date().toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      })
    });

    const contactResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `Contact Form: ${sampleData.contact.subject}`,
      html: contactHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${contactResult.messageId}\n`);

    // Test 2: Review Submission Email
    console.log('2️⃣ Testing Review Submission Email...');
    const reviewHtml = EmailTemplates.reviewSubmission({
      ...sampleData.review,
      submittedAt: new Date().toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      })
    });

    const reviewResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Review from ${sampleData.review.name}`,
      html: reviewHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${reviewResult.messageId}\n`);

    // Test 3: Order Notification (Admin)
    console.log('3️⃣ Testing Order Notification Email (Admin)...');
    const orderAdminHtml = EmailTemplates.orderNotificationAdmin(sampleData.order);

    const orderAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Order: ${sampleData.order.orderNumber}`,
      html: orderAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${orderAdminResult.messageId}\n`);

    // Test 4: Order Confirmation (Customer)
    console.log('4️⃣ Testing Order Confirmation Email (Customer)...');
    const orderCustomerHtml = EmailTemplates.orderConfirmationCustomer(sampleData.order);

    const orderCustomerResult = await transporter.sendMail({
      from: SMTP_USER,
      to: sampleData.order.customerEmail,
      subject: `Order Confirmation - ${sampleData.order.orderNumber}`,
      html: orderCustomerHtml
    });
    console.log(`   ✅ Sent to ${sampleData.order.customerEmail}`);
    console.log(`   Message ID: ${orderCustomerResult.messageId}\n`);

    // Test 5: Vehicle Registration (Admin)
    console.log('5️⃣ Testing Vehicle Registration Email (Admin)...');
    const regAdminHtml = EmailTemplates.vehicleRegistrationNotificationAdmin(sampleData.vehicleReg);

    const regAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Vehicle Registration: ${sampleData.vehicleReg.registrationNumber}`,
      html: regAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${regAdminResult.messageId}\n`);

    // Test 6: Payment Success (Admin)
    console.log('6️⃣ Testing Payment Success Email (Admin)...');
    const paymentAdminHtml = EmailTemplates.paymentSuccessAdmin(sampleData.payment);

    const paymentAdminResult = await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `Payment Successful - ${sampleData.payment.orderNumber}`,
      html: paymentAdminHtml
    });
    console.log(`   ✅ Sent to ${ADMIN_EMAIL}`);
    console.log(`   Message ID: ${paymentAdminResult.messageId}\n`);

    // Test 7: Payment Success (Customer)
    console.log('7️⃣ Testing Payment Success Email (Customer)...');
    const paymentCustomerHtml = EmailTemplates.paymentSuccessCustomer({
      orderNumber: sampleData.payment.orderNumber,
      packageType: sampleData.payment.packageType,
      amount: sampleData.payment.amount,
      currency: sampleData.payment.currency,
      customerName: sampleData.payment.customerName,
      processingTimeHours: 12
    });

    const paymentCustomerResult = await transporter.sendMail({
      from: SMTP_USER,
      to: sampleData.payment.customerEmail,
      subject: `Payment Received - Report Processing! [${sampleData.payment.orderNumber}]`,
      html: paymentCustomerHtml
    });
    console.log(`   ✅ Sent to ${sampleData.payment.customerEmail}`);
    console.log(`   Message ID: ${paymentCustomerResult.messageId}\n`);

    console.log('=' .repeat(60));
    console.log('✅ ALL EMAIL TEMPLATE TESTS PASSED!\n');
    console.log('📧 Sent 7 test emails with real form data:');
    console.log('   • Contact form submission');
    console.log('   • Review notification');
    console.log('   • Order notification (admin)');
    console.log('   • Order confirmation (customer)');
    console.log('   • Vehicle registration (admin)');
    console.log('   • Payment success (admin)');
    console.log('   • Payment success (customer)');
    console.log('\n🔗 Check your email inbox for the test messages!\n');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testEmailTemplates().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { testEmailTemplates, sampleData };
