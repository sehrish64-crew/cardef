#!/usr/bin/env node
/**
 * Email Form Data Test Script
 * Sends realistic form data via email to verify template rendering
 */

const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false';
const SMTP_USER = process.env.SMTP_USER || 'your-email@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-app-password';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

async function sendTestEmails() {
  console.log('\n📧 Email Form Data Test\n');
  console.log('Config: ' + SMTP_HOST + ':' + SMTP_PORT + ' (secure=' + SMTP_SECURE + ')\n');

  try {
    // 1. Contact Form
    console.log('1️⃣ Contact Form Email');
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'Contact Form: Question about reports',
      html: '<h2>New Contact Submission</h2><p><strong>Name:</strong> Ahmed Khan</p><p><strong>Email:</strong> ahmed@example.com</p><p><strong>Subject:</strong> Question about reports</p><p><strong>Message:</strong></p><pre>Hello,\n\nI am interested in getting a detailed vehicle history report. Can you tell me:\n1. What is included in Premium Report?\n2. How long does it take?\n3. Do you offer guarantees?\n\nThank you,\nAhmed</pre>'
    });
    console.log('   ✅ Sent\n');

    // 2. Review
    console.log('2️⃣ Review Submission Email');
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'New Review: 5 Stars from Fatima Ahmed',
      html: '<h2>New Review Submitted</h2><p><strong>Name:</strong> Fatima Ahmed</p><p><strong>Email:</strong> fatima@example.com</p><p><strong>Rating:</strong> ⭐⭐⭐⭐⭐ (5/5)</p><p><strong>Comment:</strong></p><pre>Excellent service! The vehicle history report was very detailed and helped me make an informed decision. Highly recommended!</pre>'
    });
    console.log('   ✅ Sent\n');

    // 3. Order (Admin)
    console.log('3️⃣ Order Notification (Admin)');
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'New Order: ORD-2026-0524-001',
      html: '<h2>New Order Received</h2><table><tr><td><strong>Order #:</strong></td><td>ORD-2026-0524-001</td></tr><tr><td><strong>Customer:</strong></td><td>Muhammad Hassan</td></tr><tr><td><strong>Email:</strong></td><td>hassan@example.com</td></tr><tr><td><strong>Package:</strong></td><td>Premium Report</td></tr><tr><td><strong>Amount:</strong></td><td>USD 89.99</td></tr><tr><td><strong>VIN:</strong></td><td>1HGBH41JXMN109186</td></tr><tr><td><strong>Status:</strong></td><td>Pending Payment</td></tr></table>'
    });
    console.log('   ✅ Sent\n');

    // 4. Order Confirmation (Customer)
    console.log('4️⃣ Order Confirmation (Customer)');
    await transporter.sendMail({
      from: SMTP_USER,
      to: 'hassan@example.com',
      subject: 'Order Confirmed - ORD-2026-0524-001',
      html: '<h2>Order Confirmation</h2><p>Hello Muhammad,</p><p>Thank you for your order!</p><table><tr><td><strong>Order #:</strong></td><td>ORD-2026-0524-001</td></tr><tr><td><strong>Package:</strong></td><td>Premium Report</td></tr><tr><td><strong>Amount:</strong></td><td>USD 89.99</td></tr></table><p>Please proceed to checkout to complete your payment.</p>'
    });
    console.log('   ✅ Sent\n');

    // 5. Vehicle Registration (Admin)
    console.log('5️⃣ Vehicle Registration (Admin)');
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'New Vehicle Registration: VR-2026-0524-001',
      html: '<h2>New Vehicle Registration</h2><table><tr><td><strong>Registration #:</strong></td><td>VR-2026-0524-001</td></tr><tr><td><strong>Owner:</strong></td><td>Zahra Khan</td></tr><tr><td><strong>Email:</strong></td><td>zahra@example.com</td></tr><tr><td><strong>Phone:</strong></td><td>+92 300 1234567</td></tr><tr><td><strong>Vehicle:</strong></td><td>2019 Honda Civic</td></tr><tr><td><strong>VIN:</strong></td><td>2HGFC2F52LH123456</td></tr><tr><td><strong>License Plate:</strong></td><td>ABC-123</td></tr><tr><td><strong>Price:</strong></td><td>USD 15,000</td></tr></table><p><strong>Description:</strong> Well-maintained with full service history. One owner, no accidents.</p>'
    });
    console.log('   ✅ Sent\n');

    // 6. Payment Success (Admin)
    console.log('6️⃣ Payment Success (Admin)');
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: 'Payment Successful - ORD-2026-0524-001',
      html: '<h2>Payment Received</h2><table><tr><td><strong>Order #:</strong></td><td>ORD-2026-0524-001</td></tr><tr><td><strong>Transaction ID:</strong></td><td>TXN-2026-052400123456</td></tr><tr><td><strong>Customer:</strong></td><td>Muhammad Hassan</td></tr><tr><td><strong>Package:</strong></td><td>Premium Report</td></tr><tr><td><strong>Amount:</strong></td><td>USD 89.99</td></tr></table><p style="background: #d1fae5; padding: 10px;">Status: Payment received and order marked complete.</p>'
    });
    console.log('   ✅ Sent\n');

    // 7. Payment Success (Customer)
    console.log('7️⃣ Payment Success (Customer)');
    await transporter.sendMail({
      from: SMTP_USER,
      to: 'hassan@example.com',
      subject: 'Payment Received - Report Processing [ORD-2026-0524-001]',
      html: '<h2>Payment Received</h2><p>Hello Muhammad,</p><p>Thank you for your payment! We received USD 89.99 for your Premium Report.</p><p style="background: #fef3c7; padding: 10px; border-left: 3px solid #f59e0b;"><strong>⏱️ Your report will be ready in 12-13 hours.</strong> We will email you when it is complete.</p><p>You can track your order in your account.</p>'
    });
    console.log('   ✅ Sent\n');

    console.log('=' .repeat(50));
    console.log('✅ ALL 7 TEST EMAILS SENT WITH FORM DATA!\n');
    console.log('📧 Check your inbox for:\n');
    console.log('   Admin inbox: Contact, Review, Order, Registration, 3x Payment emails');
    console.log('   Customer emails: 2 order/payment confirmations\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

sendTestEmails().catch(e => { console.error(e); process.exit(1); });
