'use strict';

const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { formatPrice } = require('../../utils/formatPrice');

let transporter;
const getTransport = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.email.host, port: env.email.port, secure: env.email.secure,
    auth: { user: env.email.user, pass: env.email.pass },
  });
  if (!env.isTest) transporter.verify().then(
    () => logger.info('SMTP ready'),
    (err) => logger.warn('SMTP verify failed', { error: err.message })
  );
  return transporter;
};

const send = async ({ to, subject, html, text }) => {
  const t = getTransport();
  const info = await t.sendMail({
    from: env.email.from, to, subject, html,
    text: text || html?.replace(/<[^>]+>/g, ''),
  });
  logger.info('Email sent', { to, subject, messageId: info.messageId });
  return info;
};

const template = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#FBF7F1;">
    <div style="background:#7B1E2B;color:#fff;padding:18px 24px;border-radius:6px 6px 0 0;text-align:center;">
      <h2 style="margin:0;font-family:Georgia,serif;letter-spacing:2px;">SAREE SHOWROOM</h2>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 6px 6px;">
      <h3 style="color:#7B1E2B;">${title}</h3>
      ${body}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#888;">If you didn't request this, please ignore.</p>
    </div>
  </div>`;

exports.send = send;

exports.sendVerificationEmail = (to, name, url) =>
  send({
    to, subject: 'Verify your email',
    html: template('Verify your email', `
      <p>Hi ${name},</p>
      <p>Click below to verify your email address:</p>
      <p><a href="${url}" style="display:inline-block;background:#C9A14A;color:#fff;padding:12px 24px;text-decoration:none;">Verify Email</a></p>
      <p>Or open this link: ${url}</p>
    `),
  });

exports.sendPasswordResetEmail = (to, name, url) =>
  send({
    to, subject: 'Reset your password',
    html: template('Reset your password', `
      <p>Hi ${name},</p>
      <p>You asked to reset your password. The link is valid for 15 minutes.</p>
      <p><a href="${url}" style="display:inline-block;background:#C9A14A;color:#fff;padding:12px 24px;text-decoration:none;">Reset Password</a></p>
      <p>Or open: ${url}</p>
    `),
  });

exports.sendOrderConfirmationEmail = (to, name, order) =>
  send({
    to, subject: `Order Confirmed · #${order._id}`,
    html: template('Thank you for your order!', `
      <p>Hi ${name},</p>
      <p>Your order has been placed successfully.</p>
      <p><b>Order ID:</b> ${order._id}<br>
         <b>Total:</b> ${formatPrice(order.total)}<br>
         <b>Payment:</b> ${order.paymentMethod.toUpperCase()}</p>
      <p>We'll send another email when it ships.</p>
    `),
  });
