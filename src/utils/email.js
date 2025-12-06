const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});
console.log("Email host:", process.env.EMAIL_HOST);
console.log("Email user:", process.env.EMAIL_USER);
console.log("From email:", process.env.FROM_EMAIL);

transporter
  .verify()
  .then(() => console.log("SMTP ready"))
  .catch((err) => console.error("SMTP error", err));

function generateEmailTemplate({ recipientName = "User", subject, message }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
          .container { max-width:600px; margin:30px auto; background:#fff; padding:20px; border-radius:8px; }
          .header { text-align:center; padding-bottom:20px; border-bottom:1px solid #ddd; }
          .header h1 { margin:0; color:#333; }
          .content { padding:20px 0; color:#555; }
          .footer { text-align:center; font-size:12px; color:#999; padding-top:20px; border-top:1px solid #ddd; }
          .btn { display:inline-block; padding:10px 20px; background:#007bff; color:#fff !important; text-decoration:none; border-radius:5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>${process.env.FROM_NAME}</h1></div>
          <div class="content">
            <p>Hi ${recipientName},</p>
            <p>${message}</p>
            <p>Thank you,<br/>The ${process.env.FROM_NAME} Team</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} ${
    process.env.FROM_NAME
  }. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;
}

async function sendEmail({ to, subject, text, html, retries = 2 }) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed for ${to}: ${err.message}`);
      if (attempt === retries) throw err;
    }
  }
}

module.exports = { sendEmail, generateEmailTemplate };
