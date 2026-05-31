# Email System Verification & Testing Guide

## ✅ Pre-Deployment Verification Steps

Run through this checklist before deploying to production.

---

## 1. Local Testing (Development)

### Step 1.1: Verify Configuration
```bash
# Check if npm dev starts without errors
npm run dev

# Look for in console:
# "[EMAIL DEBUG] SMTP_HOST=configured SMTP_USER=configured"
# If you see MISSING, go back and update .env.local
```

### Step 1.2: Test Form Submission Email

**Test 1: Submit form via curl**
```bash
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "subject": "Test Subject",
    "message": "This is a test message with sufficient content to pass validation",
    "formType": "contact"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you! Your message has been received."
}
```

**Check Console:**
```
[FORM SUBMISSION] New contact submission from test@example.com
[EMAIL DEBUG] SMTP_HOST=configured SMTP_USER=configured
[EMAIL] ✓ Sent via SMTP to admin@example.com
[EMAIL] ✓ Sent via SMTP to test@example.com
```

**Check Emails:**
- ✅ Admin receives form submission email with all details
- ✅ Customer receives confirmation email at test@example.com

### Step 1.3: Test Payment Success Email

**Test 2: Trigger payment success**
```bash
curl -X POST http://localhost:3000/api/payments/success \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order",
    "orderNumber": "ORD-TEST-2024-001",
    "orderId": 999,
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "amount": 29.99,
    "currency": "USD",
    "packageType": "Premium",
    "vehicleType": "Car",
    "vin": "1HGCM82633A123456",
    "transactionId": "TXN-TEST-123456",
    "paymentMethod": "Credit Card"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment notification emails sent successfully"
}
```

**Check Emails:**
- ✅ Admin receives payment notification
- ✅ Customer receives order confirmation

### Step 1.4: Check Email System Status

**Test 3: Verify email system is ready**
```bash
curl http://localhost:3000/api/payments/notification
```

**Expected Response:**
```json
{
  "status": "ready",
  "checks": {
    "email_provider": "SMTP",
    "admin_email": "configured"
  },
  "message": "Payment notification system is ready"
}
```

### Step 1.5: Verify Database Logging

**Check that emails were logged:**
```sql
-- View recent sent emails
SELECT to_address, subject, provider, status 
FROM email_outbox 
ORDER BY created_at DESC 
LIMIT 5;

-- Should show:
-- | test@example.com | Thank you email subject | smtp | sent |
-- | admin@example.com | Form submission subject | smtp | sent |
-- etc.
```

---

## 2. Enhanced Form Testing (UI)

### Step 2.1: Test Enhanced Form Component

**If using the new GetReportFormEnhanced component:**

1. Click button to open form
2. Fill in all required fields:
   - Select VIN or Plate
   - Enter VIN or plate number
   - Select vehicle type
   - Select country
   - Enter email address
   - Select package

3. Click "Continue to Payment"
4. Watch processing steps:
   - "Creating order..." ✓
   - "Sending confirmation email..." ✓
   - "Redirecting to payment..." ✓

5. Should be redirected to payment checkout

### Step 2.2: Verify Emails Arrived

- ✅ Check admin email for form notification
- ✅ Check customer email for confirmation
- ✅ Both should have professional formatting
- ✅ Links should work and not be broken

---

## 3. Mobile/Email Client Testing

### Step 3.1: Test Email Rendering

**For each email received, verify:**
- ✅ Images display correctly
- ✅ Links are clickable
- ✅ Text is readable
- ✅ Layout is not broken
- ✅ Colors display properly
- ✅ Formatting looks professional

**Test on Multiple Clients:**
- Gmail web
- Gmail mobile app
- Outlook
- Apple Mail
- Thunderbird

### Step 3.2: Check Spam Folder

**Important**: Check if emails are landing in SPAM
- ✅ Look in spam/promotions folder
- ✅ If found, add sender to contacts
- ✅ May need to configure SPF/DKIM for custom domain

---

## 4. Production Pre-Launch Checklist

### Step 4.1: Environment Variables Ready

**Verify for production:**
```bash
# Resend option
RESEND_API_KEY=re_xxxxxxxxxxxx ✓
EMAIL_FROM="CarReaders <noreply@yourdomain.com>" ✓
ADMIN_EMAIL=admin@yourdomain.com ✓

# OR Gmail option
SMTP_HOST=smtp.gmail.com ✓
SMTP_PORT=465 ✓
SMTP_SECURE=true ✓
SMTP_USER=your_email@gmail.com ✓
SMTP_PASS=your_app_password ✓
EMAIL_FROM="CarReaders <noreply@gmail.com>" ✓
ADMIN_EMAIL=admin@yourdomain.com ✓
```

### Step 4.2: Set in Hosting Provider

**For Hostinger:**
1. Login to Hostinger
2. Go to: Hosting → Environment Variables
3. Click "Add Variable"
4. Add each required variable
5. Save and deploy

### Step 4.3: Verify Production Configuration

**After deployment:**
```bash
# Test production endpoint
curl https://yourdomain.com/api/payments/notification

# Expected response:
# {"status":"ready","checks":{...}}
```

### Step 4.4: Production Email Test

**Send test email to production:**
```bash
curl -X POST https://yourdomain.com/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Test",
    "email": "youremail@example.com",
    "message": "Testing production email system with sufficient content",
    "formType": "contact"
  }'
```

**Verify:**
- ✅ Email arrives at admin email (production)
- ✅ Email arrives at customer email
- ✅ No errors in production logs
- ✅ Emails logged to database

---

## 5. Full End-to-End Flow Testing

### Step 5.1: Complete Order Flow

1. **User fills form**
   ```
   Name: John Doe
   Email: john@example.com
   VIN: 1HGCM82633A123456
   Vehicle: Car
   Country: United States
   Package: Premium ($29.99)
   ```

2. **User clicks Continue**
   - ✅ Shows "Creating order..."
   - ✅ Shows "Sending confirmation..."
   - ✅ Shows "Redirecting to payment..."
   - ✅ Redirects to payment page

3. **Admin receives email**
   - ✅ Subject: "🔔 New Form Submission: get-report from John Doe"
   - ✅ Contains all form data
   - ✅ Formatted professionally
   - ✅ Has links that work

4. **Customer receives email**
   - ✅ Subject: "We received your message - CarReaders Support"
   - ✅ Thanks them for submission
   - ✅ Tells when to expect response
   - ✅ Has support info

### Step 5.2: Payment Success Flow

1. **Payment is processed**
   ```
   Order: ORD-2024-001
   Amount: $29.99
   Customer: john@example.com
   ```

2. **Admin receives notification**
   - ✅ Subject: "💳 Payment Received - Order ORD-2024-001"
   - ✅ Payment details included
   - ✅ Customer information
   - ✅ Dashboard link works

3. **Customer receives confirmation**
   - ✅ Subject: "✓ Payment Confirmed - Order ORD-2024-001"
   - ✅ Order summary with pricing
   - ✅ Timeline showing next steps
   - ✅ Tells when report will be ready
   - ✅ Support contact information

---

## 6. Database Verification

### Step 6.1: Check Email Logs

```sql
-- View all sent emails
SELECT 
  to_address, 
  subject, 
  provider, 
  status, 
  created_at 
FROM email_outbox 
ORDER BY created_at DESC;

-- Should show successful sends
```

### Step 6.2: Check for Failures

```sql
-- View any failures
SELECT 
  to_address, 
  subject, 
  error_message, 
  created_at 
FROM email_failures 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;

-- Should be empty or show expected failures
```

### Step 6.3: Verify Email Count

```sql
-- Should match number of form submissions + payments
SELECT COUNT(*) as total_emails FROM email_outbox;
SELECT COUNT(*) as failed_emails FROM email_failures;
```

---

## 7. Error Scenarios Testing (Optional)

### Step 7.1: Test Invalid Email

```bash
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "message": "Test"
  }'
```

**Expected:** Error response with validation message

### Step 7.2: Test Missing Required Field

```bash
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com"
  }'
```

**Expected:** Error about missing message field

---

## 8. Performance Testing

### Step 8.1: Measure Email Send Time

**Observe in logs:**
```
[EMAIL] Attempting to send to test@example.com
[EMAIL] ✓ Sent via SMTP to test@example.com (should be < 2 seconds)
```

### Step 8.2: Test Multiple Submissions

```bash
# Send 5 test emails
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/forms/submit \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test $i\",\"email\":\"test$i@example.com\",\"message\":\"Test message $i with sufficient content\"}"
done
```

**Expected:** All 5 processed successfully within reasonable time

---

## 9. Production Monitoring Setup

### Step 9.1: Set Monitoring Alerts

**Monitor these tables:**
- `email_outbox` - Should have new entries
- `email_failures` - Should stay low

### Step 9.2: Daily Checks

- [ ] Check email_failures table (should be empty or few)
- [ ] Verify recent emails in email_outbox
- [ ] Check that customers received confirmations
- [ ] Verify admin received notifications
- [ ] Look for any error patterns

---

## ✅ Final Verification Checklist

- [ ] Configuration verified in dev
- [ ] Form submission emails work
- [ ] Payment success emails work
- [ ] Email system status endpoint responds
- [ ] Emails logged to database
- [ ] Emails render properly on mobile
- [ ] Production env vars configured
- [ ] Production endpoint responds
- [ ] Test email sends successfully in production
- [ ] Admin receives emails
- [ ] Customers receive emails
- [ ] No sensitive data exposed
- [ ] Database tables exist and are populated
- [ ] Error handling works properly
- [ ] Documentation is complete

---

## 🎉 You're Ready!

If all checks pass above, your email system is ready for production use.

**Next Steps:**
1. Deploy to production
2. Send test email
3. Monitor for 24-48 hours
4. Check email logs regularly
5. Set up alerts for failures

**Questions?** See `EMAIL_SYSTEM_GUIDE.md` for complete documentation.
