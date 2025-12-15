import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with your email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email with title and body
 * @param {string} recipientEmail - Recipient email address
 * @param {string} title - Email subject/title
 * @param {string} body - Email body content (HTML or plain text)
 * @returns {Promise} - Promise that resolves with email info
 */
export const sendEmail = async (recipientEmail, title, body) => {
  try {
    if (!recipientEmail || !title || !body) {
      throw new Error('Missing required parameters: recipientEmail, title, or body');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: title,
      html: body, // Use 'html' for HTML content, or 'text' for plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return {
      success: true,
      message: 'Email sent successfully',
      info,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
};

/**
 * Send HTML email with template
 * @param {string} recipientEmail - Recipient email address
 * @param {string} title - Email subject/title
 * @param {string} htmlBody - HTML content for email body
 * @returns {Promise} - Promise that resolves with email info
 */
export const sendHtmlEmail = async (recipientEmail, title, htmlBody) => {
  return sendEmail(recipientEmail, title, htmlBody);
};

/**
 * Send plain text email
 * @param {string} recipientEmail - Recipient email address
 * @param {string} title - Email subject/title
 * @param {string} textBody - Plain text content for email body
 * @returns {Promise} - Promise that resolves with email info
 */
export const sendTextEmail = async (recipientEmail, title, textBody) => {
  try {
    if (!recipientEmail || !title || !textBody) {
      throw new Error('Missing required parameters: recipientEmail, title, or textBody');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: title,
      text: textBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return {
      success: true,
      message: 'Email sent successfully',
      info,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
};

export default {
  sendEmail,
  sendHtmlEmail,
  sendTextEmail,
};
