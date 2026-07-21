# Email Configuration Guide

This guide explains how to set up Gmail SMTP for the contact form.

## Prerequisites

- Gmail account
- 2-Step Verification enabled on your Gmail account

## Setup Instructions

### Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", click on "2-Step Verification"
3. Follow the prompts to enable it

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in if prompted
3. In the "Select app" dropdown, choose "Mail"
4. In the "Select device" dropdown, choose "Other" and enter "WEB LAUNCH Website"
5. Click "Generate"
6. Copy the 16-character password (it will be shown with spaces, but you should remove them)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and update with your credentials:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-actual-gmail@gmail.com
   SMTP_PASS=abcdefghijklmnop
   ```

3. Replace:
   - `your-actual-gmail@gmail.com` with your Gmail address
   - `abcdefghijklmnop` with your 16-character app password (remove spaces)

## Email Recipients

- **Primary recipient:** dionsalihi067@gmail.com (receives all contact form submissions)
- **Client confirmation:** Sent to the email address the client provides in the form

## Email Format

The email sent to WEB LAUNCH includes:

```
======================================
CLIENT INFORMATION
======================================
Full Name, Business Name, Email, Phone, Country, Preferred Language

======================================
SELECTED SERVICES
======================================
List of all selected services

======================================
ANSWERS
======================================
All questionnaire answers grouped by service

======================================
ADDITIONAL NOTES
======================================
Any additional notes from the client

======================================
FILES
======================================
List of uploaded files (attached to email)
```

## Testing

### Development Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the contact page:
   ```
   http://localhost:3000/en/contact
   ```

3. Fill out the form completely and submit

4. Check:
   - dionsalihi067@gmail.com should receive the submission
   - Client should receive a confirmation email
   - Console should show no errors

### Production Testing

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Test the contact form as above

## Troubleshooting

### "Missing required environment variables"

- Make sure `.env.local` exists and contains all required variables
- Restart the dev server after creating/modifying `.env.local`

### "SMTP configuration error"

- Verify your Gmail credentials are correct
- Make sure 2-Step Verification is enabled
- Make sure you're using an App Password, not your regular Gmail password
- Check that the App Password has no spaces

### "Authentication failed"

- Regenerate the App Password and update `.env.local`
- Make sure the Gmail account is not locked or restricted

### Emails not arriving

- Check spam/junk folder
- Verify the recipient email address (dionsalihi067@gmail.com)
- Check Gmail account quota (not exceeded)
- Wait a few minutes (emails may be delayed)

## Security Best Practices

1. ✅ Never commit `.env.local` to version control (already in `.gitignore`)
2. ✅ Use App Passwords instead of regular Gmail passwords
3. ✅ Keep credentials secure and private
4. ✅ Rotate App Passwords periodically
5. ✅ Monitor your Gmail account for suspicious activity

## Rate Limits

Gmail SMTP has sending limits:

- **Free Gmail accounts:** 500 emails per day
- **Google Workspace accounts:** 2,000 emails per day

For high-volume needs, consider:
- Multiple Gmail accounts (rotation)
- Professional email service (e.g., AWS SES, Mailgun)
- Custom SMTP server

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Test with a simple test script (see below)
4. Contact support with error logs

### Quick Test Script

Create `test-email.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'dionsalihi067@gmail.com',
      subject: 'Test Email from WEB LAUNCH',
      text: 'This is a test email.',
    });
    
    console.log('✅ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
```

Run: `node test-email.js`
