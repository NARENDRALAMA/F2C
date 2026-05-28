import nodemailer from 'nodemailer';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return null;
}

export async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"F2C Marketplace" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send:', err.message);
  }
}

export function orderConfirmationEmail(order, consumer) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.productName}</td><td style="padding:6px 0;text-align:right">${i.quantity} × $${i.price.toFixed(2)}</td></tr>`
    )
    .join('');

  return {
    to: consumer.email,
    subject: `Order Confirmed — F2C #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#16a34a">Your order is confirmed!</h2>
        <p>Hi ${consumer.name}, thanks for your order on F2C Marketplace.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>
        <hr/>
        <p><strong>Total: $${order.totalAmount.toFixed(2)}</strong> (incl. $5 delivery)</p>
        <p>Delivery address: ${order.deliveryAddress}</p>
        <p style="color:#6b7280;font-size:13px">You can track your order status in the F2C app.</p>
      </div>`,
  };
}

export function orderStatusEmail(order, consumer, status) {
  const statusLabels = {
    confirmed: 'confirmed',
    processing: 'being prepared',
    shipped: 'on its way to you',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };
  const label = statusLabels[status] || status;
  return {
    to: consumer.email,
    subject: `Order Update — Your order is ${label}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#16a34a">Order Update</h2>
        <p>Hi ${consumer.name}, your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> is now <strong>${label}</strong>.</p>
        <p style="color:#6b7280;font-size:13px">Log in to F2C to view full order details.</p>
      </div>`,
  };
}
