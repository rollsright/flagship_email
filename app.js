const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = new Koa();
const router = new Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  // Port 465 is often more stable for Gmail in cloud environments
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.GMAIL_USER,
    // Use .replace to ensure no accidental spaces break the login
    pass: process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') : ''
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  // CRITICAL: Forces IPv4 to prevent cloud network resolution timeouts
  family: 4 
});

// POST /send endpoint
router.post('/send', async (ctx) => {
  try {
    const { name, email, phone, remark } = ctx.request.body;

    if (!name || !email || !phone) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Missing required fields: name, email, phone'
      };
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Form Submission - ${name}`,
      html: `
        <h2>New Form Submission Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Remark:</strong> ${remark || 'None'}</p>
        <hr>
        <p><small>Sent at: ${new Date().toLocaleString('en-US')}</small></p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email sending failed:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Email sending failed',
      error: error.message
    };
  }
});

// Health check endpoint
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    message: 'Service is running'
  };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// START SERVER
const PORT = process.env.PORT || 3000;
// CRITICAL: Binds to 0.0.0.0 so Railway can perform health checks
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});