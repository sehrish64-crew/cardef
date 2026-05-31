const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
    console.log('📧 Testing SMTP connection...');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || 'carreaders@gmail.com',
            pass: process.env.SMTP_PASS
        }
    });

    try {
        // Test connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"CarReaders" <carreaders@gmail.com>',
            to: 'carreaders@gmail.com', // Send to yourself
            subject: 'Test Email - SMTP Working',
            text: 'If you receive this, your email system is working properly!',
            html: '<h2>✅ Success!</h2><p>Your email system is configured correctly.</p>'
        });
        
        console.log('✅ Email sent! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.command) console.error('Command:', error.command);
    }
}

sendTestEmail();