# Email Templates & Form Data Pattern

This guide shows how to use the new centralized email templates when sending form data to users.

## Overview

The new `EmailTemplates` system in `lib/email-templates.ts` provides professionally formatted, reusable email templates for all form types:

- **Contact Form** - Send contact submissions to admin
- **Review Submission** - Send review notifications to admin
- **Order Notification** - Send order details to admin
- **Order Confirmation** - Send confirmation to customer
- **Vehicle Registration** - Send registration details to admin & customer
- **Payment Success** - Send payment receipts to admin & customer

---

## Quick Start

### 1. Import the Templates

```typescript
import { EmailTemplates } from '@/lib/email-templates'
```

### 2. Generate HTML for a Form Type

```typescript
// Contact Form
const contactHtml = EmailTemplates.contactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry',
  message: 'I have a question about your services.',
  submittedAt: new Date().toLocaleString()
})

// Review Submission
const reviewHtml = EmailTemplates.reviewSubmission({
  name: 'Jane Smith',
  email: 'jane@example.com',
  rating: 5,
  comment: 'Excellent service!',
  submittedAt: new Date().toLocaleString()
})
```

### 3. Send the Email

```typescript
import { sendEmail } from '@/lib/send-email' // or use existing sendEmail function

const result = await sendEmail(
  recipientEmail,
  'Email Subject',
  contactHtml
)
```

---

## Implementation Examples

### Example 1: Contact Form (app/api/contact/route.ts)

**Before:**
```typescript
const resp = await fetch(`${baseUrl}/api/send-email`, {
  method: 'POST',
  body: JSON.stringify({ type: 'contact_form', name, email, subject, message }),
})
```

**After (using new templates):**
```typescript
import { EmailTemplates } from '@/lib/email-templates'

// Generate formatted email
const emailHtml = EmailTemplates.contactForm({
  name,
  email,
  subject,
  message,
  submittedAt: new Date().toLocaleString()
})

// Send to admin
const resp = await fetch(`${baseUrl}/api/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom_html',
    to: ADMIN_EMAIL,
    subject: `Contact Form: ${subject}`,
    html: emailHtml
  })
})
```

### Example 2: Review Submission (app/api/reviews/route.ts)

**After (using new templates):**
```typescript
import { EmailTemplates } from '@/lib/email-templates'

const emailHtml = EmailTemplates.reviewSubmission({
  name: review.name,
  email: review.email,
  rating: review.rating,
  comment: review.comment,
  submittedAt: review.created_at
})

const resp = await fetch(`${baseUrl}/api/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom_html',
    to: ADMIN_EMAIL,
    subject: `New Review from ${review.name}`,
    html: emailHtml
  })
})
```

### Example 3: Order Notification (Admin + Customer)

**After (using new templates):**
```typescript
import { EmailTemplates } from '@/lib/email-templates'

// Admin notification
const adminHtml = EmailTemplates.orderNotificationAdmin({
  orderNumber: order.order_number,
  orderId: order.id,
  customerName: order.customer_name,
  customerEmail: order.customer_email,
  packageType: order.package_type,
  amount: order.amount,
  currency: 'USD',
  paymentStatus: order.payment_status,
  vinNumber: order.vin,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL
})

// Customer confirmation
const customerHtml = EmailTemplates.orderConfirmationCustomer({
  orderNumber: order.order_number,
  orderId: order.id,
  customerName: order.customer_name,
  packageType: order.package_type,
  amount: order.amount,
  currency: 'USD',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL
})

// Send both emails
const adminResp = await sendEmail(ADMIN_EMAIL, `New Order: ${order.order_number}`, adminHtml)
const customerResp = await sendEmail(order.customer_email, 'Order Confirmation', customerHtml)
```

### Example 4: Payment Success Notification

**After (using new templates):**
```typescript
import { EmailTemplates } from '@/lib/email-templates'

// Admin notification
const adminHtml = EmailTemplates.paymentSuccessAdmin({
  orderNumber: order.order_number,
  transactionId: payment.transaction_id,
  packageType: order.package_type,
  amount: payment.amount,
  currency: 'USD',
  customerName: order.customer_name,
  customerEmail: order.customer_email,
  vinNumber: order.vin
})

// Customer confirmation
const customerHtml = EmailTemplates.paymentSuccessCustomer({
  orderNumber: order.order_number,
  packageType: order.package_type,
  amount: payment.amount,
  currency: 'USD',
  customerName: order.customer_name,
  processingTimeHours: 12
})

await sendEmail(ADMIN_EMAIL, `Payment Successful - ${order.order_number}`, adminHtml)
await sendEmail(order.customer_email, 'Payment Received - Report Processing', customerHtml)
```

---

## Template Data Reference

### contactForm(data)
```typescript
{
  name: string           // Sender's name
  email: string          // Sender's email
  subject: string        // Form subject
  message: string        // Form message body
  submittedAt?: string   // ISO timestamp or formatted date
}
```

### reviewSubmission(data)
```typescript
{
  name: string           // Reviewer name
  email: string          // Reviewer email
  rating: number         // 1-5 star rating
  comment: string        // Review comment
  submittedAt?: string   // Submission date
}
```

### orderNotificationAdmin(data)
```typescript
{
  orderNumber: string    // Order reference number
  orderId: number        // Database order ID
  customerName?: string  // Customer full name
  customerEmail: string  // Customer email
  packageType: string    // Product name (e.g., "Premium Report")
  amount: number         // Order amount
  currency?: string      // Currency code (default: 'USD')
  paymentStatus?: string // e.g., 'pending', 'completed'
  vinNumber?: string     // Vehicle VIN (if applicable)
  createdAt?: string     // Creation timestamp
  baseUrl?: string       // Admin dashboard URL
}
```

### orderConfirmationCustomer(data)
```typescript
{
  orderNumber: string    // Order reference number
  orderId: number        // Database order ID
  customerName?: string  // Customer full name
  packageType: string    // Product name
  amount: number         // Order amount
  currency?: string      // Currency code (default: 'USD')
  baseUrl?: string       // Checkout/tracking URL
}
```

### vehicleRegistrationNotificationAdmin(data)
```typescript
{
  registrationNumber: string  // Registration ID
  registrationId: number      // Database registration ID
  ownerName?: string          // Vehicle owner
  ownerEmail: string          // Owner email
  ownerPhone?: string         // Contact phone
  vehicleMake?: string        // Vehicle make (e.g., 'Toyota')
  vehicleModel?: string       // Vehicle model (e.g., 'Camry')
  vehicleYear?: number        // Model year
  vin?: string                // VIN number
  licensePlate?: string       // License plate
  description?: string        // Listing description
  price?: number              // Asking price
  currency?: string           // Currency code (default: 'USD')
  paymentStatus?: string      // Payment status
  baseUrl?: string            // Admin dashboard URL
}
```

### paymentSuccessAdmin(data)
```typescript
{
  orderNumber: string    // Order reference
  transactionId?: string // Payment transaction ID
  packageType: string    // Product name
  amount: number         // Amount paid
  currency?: string      // Currency code
  customerName?: string  // Customer name
  customerEmail: string  // Customer email
  vinNumber?: string     // Vehicle VIN (if applicable)
}
```

### paymentSuccessCustomer(data)
```typescript
{
  orderNumber: string        // Order reference
  packageType: string        // Product name
  amount: number             // Amount paid
  currency?: string          // Currency code
  customerName?: string      // Customer name (for greeting)
  processingTimeHours?: number // Expected processing time
}
```

---

## Best Practices

### ✅ DO:
- Use templates for consistency across all emails
- Pass all available data to templates (they handle missing values gracefully)
- Include `baseUrl` for dashboard/checkout links
- Add timestamps (`createdAt`, `submittedAt`) for audit trails
- Include both admin AND customer emails for transactions

### ❌ DON'T:
- Manually construct HTML email strings
- Forget to pass `baseUrl` if you need dashboard links
- Mix old email functions with new templates (pick one approach)
- Use HTML directly without the template system

---

## Adding New Email Templates

To add a new email template, follow this pattern in `lib/email-templates.ts`:

```typescript
/**
 * Description of what this email is for
 */
customTemplate(data: {
  // Define your data structure
  field1: string;
  field2: number;
}): string {
  const content = `
    <p>Your email content here</p>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
      ${formatFieldRow('Label 1', data.field1, true)}
      ${formatFieldRow('Label 2', data.field2)}
    </table>
  `;
  return baseTemplate('📧 Email Title', content, '#3b82f6');
}
```

Then use it:
```typescript
const html = EmailTemplates.customTemplate({ field1: 'value', field2: 123 })
```

---

## Migration Guide

To gradually migrate existing emails to use the new template system:

1. **Identify the email type** (contact, review, order, etc.)
2. **Find the handler** in `app/api/send-email/route.ts`
3. **Replace with template call** in the form's route handler
4. **Test the email** locally with `scripts/test-smtp.js`
5. **Remove old function** from `send-email/route.ts` once migrated

Example:
```typescript
// OLD:
if (data.type === 'contact_form') {
  const html = generateContactFormEmail(data, lang)
  // ... send
}

// NEW:
if (data.type === 'contact_form') {
  const html = EmailTemplates.contactForm(data)
  // ... send
}
```

---

## Testing

Run the SMTP test script to verify emails render correctly:

```bash
node scripts/test-smtp.js
```

Or test a specific form submission locally by submitting through the UI and checking terminal logs.

---

## Support

For questions or issues with email templates, check:
- `lib/email-templates.ts` - Template definitions
- `app/api/send-email/route.ts` - Email sending logic
- `scripts/test-smtp.js` - Local testing

