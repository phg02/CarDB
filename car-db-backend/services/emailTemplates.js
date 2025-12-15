import { sendEmail } from './emailService.js';

/**
 * Send OTP email for email verification during registration
 */
export const sendOTPEmail = async (recipientEmail, otp) => {
  const subject = "Email Verification - OTP Code";
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
          margin: 0;
        }
        .content {
          color: #555;
          line-height: 1.6;
        }
        .otp-box {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 5px;
          border: 2px solid #007bff;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 5px;
        }
        .expiry {
          color: #d9534f;
          font-weight: bold;
          margin-top: 15px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for signing up! To verify your email address and complete your registration, please use the following verification code:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">Valid for 10 minutes</div>
          </div>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Best regards,<br>CarDB Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 CarDB. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(recipientEmail, subject, htmlBody);
};

/**
 * Send password reset email with reset link
 */
export const sendPasswordResetEmail = async (recipientEmail, resetLink) => {
  const subject = "Password Reset Request";
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
          margin: 0;
        }
        .content {
          color: #555;
          line-height: 1.6;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .reset-button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
        }
        .reset-button:hover {
          background-color: #0056b3;
        }
        .link-text {
          word-break: break-all;
          color: #007bff;
          font-size: 12px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 5px;
          color: #856404;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset your password:</p>
          <div class="button-container">
            <a href="${resetLink}" class="reset-button">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p class="link-text">${resetLink}</p>
          <div class="warning">
            <strong>Security Note:</strong> This password reset link is valid for only 1 hour. If you didn't request this, please ignore this email.
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>CarDB Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 CarDB. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(recipientEmail, subject, htmlBody);
};

/**
 * Send welcome email after successful registration
 */
export const sendWelcomeEmail = async (recipientEmail, userName) => {
  const subject = "Welcome to CarDB!";
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
          margin: 0;
        }
        .content {
          color: #555;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CarDB!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Welcome to CarDB! Your account has been successfully created and verified.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse and search for cars</li>
            <li>Add cars to your watchlist</li>
            <li>Post cars for sale</li>
            <li>View order history</li>
          </ul>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <p>Happy car hunting!<br>CarDB Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 CarDB. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(recipientEmail, subject, htmlBody);
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (recipientEmail, orderDetails) => {
  const { orderId, carTitle, price, buyerName, sellerName } = orderDetails;
  
  const subject = `Order Confirmation - Order #${orderId}`;
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #333;
          margin: 0;
        }
        .order-details {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: bold;
          color: #333;
        }
        .detail-value {
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello ${buyerName},</p>
          <p>Thank you for your purchase! Your order has been confirmed. Here are the details:</p>
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order ID:</span>
              <span class="detail-value">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Car:</span>
              <span class="detail-value">${carTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value">$${price}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Seller:</span>
              <span class="detail-value">${sellerName}</span>
            </div>
          </div>
          <p>Our team will be in touch with you soon to finalize the transaction details.</p>
          <p>Best regards,<br>CarDB Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 CarDB. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(recipientEmail, subject, htmlBody);
};
