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
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail account
    pass: process.env.GMAIL_APP_PASSWORD // Gmail app-specific password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// POST /send endpoint
router.post('/send', async (ctx) => {
  try {
    const { name, email, phone, remark } = ctx.request.body;

    // Validate required fields
    if (!name || !email || !phone) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Missing required fields: name, email, phone'
      };
      return;
    }

    // Configure email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECEIVER_EMAIL, // Fixed recipient email
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

    // Send email
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

// Use middleware
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test endpoint: POST http://localhost:${PORT}/send`);
});

