# Email System - Quick Reference Card

## 🚀 Getting Started (Development)

```bash
# 1. Get Gmail App Password
# Go to: https://myaccount.google.com/apppasswords
# Select: Mail + Windows Computer
# Copy: 16-character password with spaces

# 2. Update .env.local
ADMIN_EMAIL=your_email@gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_password_with_spaces

# 3. Restart server
npm run dev

# 4. Test - Fill out any form and check email
```

---

## 📧 Email Endpoints

### POST /api/forms/submit
**When**: User submits a form (contact, get report, etc.)
**Who gets email**: Admin + Customer

```bash
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Help me find a vehicle report",
    "formType": "contact",
    "phone": "+1234567890"
  }'
```

### POST /api/payments/success
**When**: Payment is successfully processed
**Who gets email**: Admin + Customer

```bash
curl -X POST http://localhost:3000/api/payments/success \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order",
    "orderNumber": "ORD-2024-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "amount": 29.99,
    "currency": "USD",
    "packageType": "Premium"
  }'
```

### GET /api/payments/notification
**Check**: Is email system configured?

```bash
curl http://localhost:3000/api/payments/notification
```

---

## 📊 Email Database

### View Sent Emails
```sql
SELECT * FROM email_outbox ORDER BY created_at DESC LIMIT 10;
```

### View Failed Emails
```sql
SELECT * FROM email_failures ORDER BY created_at DESC LIMIT 10;
```

### Check Specific Recipient
```sql
SELECT * FROM email_outbox WHERE to_address = 'john@example.com';
```

---

## 🔧 Production Setup

### Option 1: Resend (Recommended)
```
1. Go to https://resend.com
2. Sign up for free account
3. Get API key from: https://resend.com/api-keys
4. In Hostinger:
   - Hosting → Environment Variables
   - Add: RESEND_API_KEY=re_xxxxxxxxxxxx
   - Add: ADMIN_EMAIL=admin@yourdomain.com
   - Add: EMAIL_FROM="CarReaders <noreply@yourdomain.com>"
5. Deploy and test
```

### Option 2: Gmail SMTP
```
1. Same setup as development
2. In Hostinger:
   - Add: SMTP_USER=your_email@gmail.com
   - Add: SMTP_PASS=your_app_password
   - Add: ADMIN_EMAIL=admin@yourdomain.com
   - Add: EMAIL_FROM="CarReaders <noreply@gmail.com>"
3. Deploy and test
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| No emails sent | Check `.env.local` has ADMIN_EMAIL and SMTP_* vars |
| "Auth failed" with Gmail | Use App Password (not Gmail password), verify 16 chars |
| Emails in spam folder | Check domain SPF/DKIM records |
| Can't find sent emails | Check `email_outbox` table in database |
| See email errors in logs | Check `[EMAIL]` messages in console output |
| Resend API failing | Check API key at https://resend.com/api-keys |

---

## 📧 What Gets Emailed

| Event | To | Template |
|-------|-----|----------|
| Form Submitted | Admin | formSubmissionToAdmin() |
| Form Submitted | Customer | Customer confirmation |
| Payment Success | Admin | paymentConfirmationToAdmin() |
| Payment Success | Customer | paymentConfirmationToCustomer() |

---

## 🔐 Files & Security

### Never Commit
- `.env.local` with real credentials
- `.env.production.local` with real credentials
- API keys
- Database passwords

### Keep Secure
- Gmail App Password (in .env only)
- Resend API key (in .env only)
- ADMIN_SECRET (strong password)
- Database credentials

### Safe to Share
- `.env.production` template
- `lib/email-service.ts`
- `lib/email-templates-professional.ts`
- All API files
- Documentation files

---

## 🎯 Customizing Emails

### Edit Templates
```
File: lib/email-templates-professional.ts

Functions to edit:
- formSubmissionToAdmin() - Contact form to admin
- orderConfirmationToCustomer() - Order to customer
- paymentConfirmationToAdmin() - Payment to admin
- paymentConfirmationToCustomer() - Order to customer
```

### Add Logo
```html
<img src="https://yourdomain.com/logo.png" alt="Logo" width="200" />
```

### Change Colors
```css
color: #c0392b;  /* Red brand */
background: linear-gradient(135deg, #780000, #a01515);
```

### Add Footer
```html
<footer>
  <p>© 2024 CarReaders. All rights reserved.</p>
</footer>
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Development secrets |
| `.env.production` | Production template |
| `lib/email-service.ts` | Email sending logic |
| `lib/email-templates-professional.ts` | Email HTML |
| `app/api/forms/submit/route.ts` | Form handler |
| `app/api/payments/success/route.ts` | Payment handler |
| `components/GetReportFormEnhanced.tsx` | Enhanced form UI |
| `EMAIL_SYSTEM_GUIDE.md` | Full documentation |
| `EMAIL_INTEGRATION_CHECKLIST.md` | Integration guide |

---

## ✅ Deployment Checklist

- [ ] Get Gmail App Password or Resend API key
- [ ] Set environment variables in Hostinger
- [ ] Test endpoint: `curl https://yourdomain.com/api/payments/notification`
- [ ] Submit test form
- [ ] Check both admin and customer emails received
- [ ] Verify no errors in logs
- [ ] Check customer email for spam folder
- [ ] Test payment flow end-to-end

---

## 📞 Quick Links

- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Resend API**: https://resend.com/api-keys
- **Resend Dashboard**: https://resend.com/dashboard
- **Email Documentation**: EMAIL_SYSTEM_GUIDE.md
- **Integration Guide**: EMAIL_INTEGRATION_CHECKLIST.md

---

## 🎓 Common Tasks

### View Recent Sent Emails
```sql
SELECT to_address, subject, created_at 
FROM email_outbox 
ORDER BY created_at DESC 
LIMIT 20;
```

### Find Emails for Specific User
```sql
SELECT * FROM email_outbox 
WHERE to_address LIKE '%john%' 
ORDER BY created_at DESC;
```

### Check for Send Failures
```sql
SELECT * FROM email_failures 
ORDER BY created_at DESC 
LIMIT 10;
```

### Test Email System
```bash
# 1. Form submission
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# 2. Payment success
curl -X POST http://localhost:3000/api/payments/success \
  -H "Content-Type: application/json" \
  -d '{"type":"order","orderNumber":"TEST-001","customerEmail":"test@example.com","amount":29.99,"currency":"USD","packageType":"Premium"}'

# 3. Check status
curl http://localhost:3000/api/payments/notification
```

---

**Your email system is ready! 🚀**

See `EMAIL_SYSTEM_GUIDE.md` for complete documentation.
