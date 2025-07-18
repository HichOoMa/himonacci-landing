import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app-specific password for Gmail
    },
  });
};

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;

    const emailConfig: EmailConfig = {
      from: process.env.EMAIL_FROM || "noreply@himonacci.com",
      to: email,
      subject: "Verify Your Email - HiMonacci Trading Platform",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #ffffff;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.1;
            }
            
            .logo {
              font-size: 32px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              position: relative;
              z-index: 1;
            }
            
            .header h1 {
              font-size: 24px;
              font-weight: 600;
              color: #ffffff;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
              color: #e2e8f0;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 500;
              color: #ffffff;
              margin-bottom: 20px;
            }
            
            .main-text {
              font-size: 16px;
              color: #cbd5e1;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            
            .trial-info {
              background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
              border: 1px solid rgba(34, 197, 94, 0.3);
              border-radius: 15px;
              padding: 25px;
              margin: 30px 0;
              backdrop-filter: blur(10px);
            }
            
            .trial-info h3 {
              color: #22c55e;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .trial-info ul {
              list-style: none;
              padding: 0;
            }
            
            .trial-info li {
              color: #e2e8f0;
              font-size: 14px;
              margin-bottom: 8px;
              padding-left: 0;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .trial-info li::before {
              content: '✦';
              color: #22c55e;
              font-weight: bold;
              font-size: 16px;
            }
            
            .cta-section {
              text-align: center;
              margin: 40px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 16px 40px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.1);
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
            }
            
            .url-fallback {
              background: rgba(15, 23, 42, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              padding: 15px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 14px;
              color: #3b82f6;
              font-family: 'Courier New', monospace;
            }
            
            .warning {
              background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
              border: 1px solid rgba(245, 158, 11, 0.3);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              backdrop-filter: blur(10px);
            }
            
            .warning strong {
              color: #f59e0b;
              font-weight: 600;
            }
            
            .warning-text {
              color: #fbbf24;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .footer {
              background: rgba(15, 23, 42, 0.5);
              padding: 30px;
              text-align: center;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              color: #64748b;
              font-size: 12px;
              line-height: 1.6;
            }
            
            .footer p {
              margin: 5px 0;
            }
            
            .signature {
              color: #cbd5e1;
              font-size: 16px;
              margin: 30px 0;
              line-height: 1.6;
            }
            
            .signature strong {
              color: #ffffff;
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 10px;
                border-radius: 15px;
              }
              
              .header {
                padding: 30px 20px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .logo {
                font-size: 28px;
              }
              
              .header h1 {
                font-size: 20px;
              }
              
              .cta-button {
                padding: 14px 30px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">🚀 HiMonacci</div>
              <h1>Welcome to HiMonacci Trading Platform!</h1>
            </div>
            
            <div class="content">
              <div class="greeting">Hello ${firstName},</div>
              
              <div class="main-text">
                Thank you for registering with HiMonacci! To complete your registration and start your <strong style="color: #22c55e;">1-hour free trial</strong>, please verify your email address.
              </div>
              
              <div class="trial-info">
                <h3>🎉 Your Free Trial Includes:</h3>
                <ul>
                  <li>1 hour of full premium access</li>
                  <li>Real-time trading signals</li>
                  <li>Advanced trading algorithms</li>
                  <li>Risk management tools</li>
                  <li>Live market analysis</li>
                  <li>Priority dashboard access</li>
                </ul>
              </div>
              
              <div class="cta-section">
                <a href="${verificationUrl}" class="cta-button">Verify Email & Start Free Trial</a>
              </div>
              
              <div class="main-text">
                If the button above doesn't work, copy and paste this link into your browser:
              </div>
              
              <div class="url-fallback">
                ${verificationUrl}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <div class="warning-text">This verification link will expire in 24 hours. Your free trial will start immediately after verification.</div>
              </div>
              
              <div class="main-text">
                If you didn't create an account with HiMonacci, please ignore this email.
              </div>
              
              <div class="signature">
                Best regards,<br>
                <strong>The HiMonacci Team</strong>
              </div>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 HiMonacci Trading Platform. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      
        `,
    };

    const result = await transporter.sendMail(emailConfig);

    // Log for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Verification email sent:", result);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(result));
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendTrialExpirationEmail(
  email: string,
  firstName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();

    const subscribeUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/login`;

    const emailConfig: EmailConfig = {
      from: process.env.EMAIL_FROM || "noreply@himonacci.com",
      to: email,
      subject: "Your Free Trial Has Expired - Continue with HiMonacci",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Free Trial Expired</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #ffffff;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.1;
            }
            
            .logo {
              font-size: 32px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              position: relative;
              z-index: 1;
            }
            
            .header h1 {
              font-size: 24px;
              font-weight: 600;
              color: #ffffff;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
              color: #e2e8f0;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 500;
              color: #ffffff;
              margin-bottom: 20px;
            }
            
            .main-text {
              font-size: 16px;
              color: #cbd5e1;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            
            .features-section {
              background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
              border: 1px solid rgba(34, 197, 94, 0.3);
              border-radius: 15px;
              padding: 25px;
              margin: 30px 0;
              backdrop-filter: blur(10px);
            }
            
            .features-section h3 {
              color: #22c55e;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .features-section ul {
              list-style: none;
              padding: 0;
            }
            
            .features-section li {
              color: #e2e8f0;
              font-size: 14px;
              margin-bottom: 8px;
              padding-left: 0;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .features-section li::before {
              content: '✦';
              color: #22c55e;
              font-weight: bold;
              font-size: 16px;
            }
            
            .price-section {
              background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
              border: 1px solid rgba(34, 197, 94, 0.3);
              border-radius: 15px;
              padding: 25px;
              margin: 30px 0;
              text-align: center;
              backdrop-filter: blur(10px);
            }
            
            .price {
              font-size: 32px;
              font-weight: 700;
              color: #22c55e;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              margin: 10px 0;
            }
            
            .price-subtitle {
              color: #10b981;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 15px;
            }
            
            .price-features {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              margin-top: 20px;
            }
            
            .price-feature {
              color: #cbd5e1;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .price-feature::before {
              content: '✓';
              color: #22c55e;
              font-weight: bold;
            }
            
            .cta-section {
              text-align: center;
              margin: 40px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 18px 45px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.1);
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
            }
            
            .urgency-message {
              background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
              border: 1px solid rgba(168, 85, 247, 0.3);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
              backdrop-filter: blur(10px);
            }
            
            .urgency-message strong {
              color: #a855f7;
              font-weight: 600;
            }
            
            .urgency-text {
              color: #c084fc;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .footer {
              background: rgba(15, 23, 42, 0.5);
              padding: 30px;
              text-align: center;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              color: #64748b;
              font-size: 12px;
              line-height: 1.6;
            }
            
            .footer p {
              margin: 5px 0;
            }
            
            .signature {
              color: #cbd5e1;
              font-size: 16px;
              margin: 30px 0;
              line-height: 1.6;
            }
            
            .signature strong {
              color: #ffffff;
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 10px;
                border-radius: 15px;
              }
              
              .header {
                padding: 30px 20px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .logo {
                font-size: 28px;
              }
              
              .header h1 {
                font-size: 20px;
              }
              
              .cta-button {
                padding: 16px 35px;
                font-size: 15px;
              }
              
              .price {
                font-size: 28px;
              }
              
              .price-features {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">🚀 HiMonacci</div>
              <h1>Your Free Trial Has Expired</h1>
            </div>
            
            <div class="content">
              <div class="greeting">Hello ${firstName},</div>
              
              <div class="main-text">
                Thank you for trying HiMonacci! Your 1-hour free trial has expired, but don't worry - you can continue enjoying all our premium features and take your trading to the next level.
              </div>
              
              <div class="features-section">
                <h3>🎯 Continue Your Trading Success:</h3>
                <ul>
                  <li>Advanced Trading Algorithms</li>
                  <li>24/7 Automated Trading</li>
                  <li>Real-time Market Analysis</li>
                  <li>Risk Management Tools</li>
                  <li>Priority Support</li>
                  <li>Monthly Performance Reports</li>
                </ul>
              </div>
              
              <div class="price-section">
                <div class="price-subtitle">Premium Access Starting From</div>
                <div class="price">$100/month</div>
                <div class="price-features">
                  <div class="price-feature">Dashboard Access</div>
                  <div class="price-feature">Auto-Trading Available</div>
                  <div class="price-feature">Real-time Signals</div>
                  <div class="price-feature">Risk Management</div>
                </div>
              </div>
              
              <div class="cta-section">
                <a href="${subscribeUrl}" class="cta-button">Subscribe Now & Continue Trading</a>
              </div>
              
              <div class="urgency-message">
                <strong>⚡ Don't Miss Out!</strong>
                <div class="urgency-text">Join thousands of successful traders who trust HiMonacci for their trading needs. Start your subscription today and maximize your trading potential.</div>
              </div>
              
              <div class="signature">
                Best regards,<br>
                <strong>The HiMonacci Team</strong>
              </div>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 HiMonacci Trading Platform. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(emailConfig);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending trial expiration email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
