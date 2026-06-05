import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
function createTransporter() {
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env.local');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

/**
 * Generate verification email HTML template
 */
function getVerificationEmailTemplate({ name, verificationCode }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to eShop!</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px;">Verify your email to get started</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; margin: 0 0 20px 0;">Hi ${name},</p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for registering with eShop! To complete your registration and access all features, please verify your email address using the code below:
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; display: inline-block;">
                      <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                      <p style="color: #ffffff; font-size: 42px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${verificationCode}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                This code will expire in <strong>10 minutes</strong>
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>Security Note:</strong> If you didn't create an account with eShop, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated email. Please do not reply.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} eShop. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail({ email, name, verificationCode }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email not configured - skipping verification email to:', email);
    return Promise.resolve();
  }

  const htmlContent = getVerificationEmailTemplate({ name, verificationCode });
  const textContent = `
Welcome to eShop, ${name}!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you didn't create an account with eShop, please ignore this email.
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"eShop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Verify Your Email - eShop',
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send verification email to:', email);
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Generate newsletter welcome email HTML template
 */
function getNewsletterWelcomeEmailTemplate({ discountCode, discountPercentage, unsubscribeUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to eShop Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Welcome to eShop!</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We're thrilled to have you join our community! As a thank you for subscribing, here's your exclusive discount code:
              </p>
              
              <!-- Discount Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                      <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Discount Code</p>
                      <p style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 4px; font-family: 'Courier New', monospace;">${discountCode}</p>
                      <p style="color: #ffffff; font-size: 18px; margin: 10px 0 0 0;">Save ${discountPercentage}% on your first order!</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Simply enter this code at checkout to enjoy your discount. Start shopping now and discover amazing deals!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">Start Shopping</a>
                  </td>
                </tr>
              </table>

              <!-- Benefits -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="color: #333333; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">As a subscriber, you'll receive:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #666666; font-size: 14px;">Exclusive deals and promotions</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #666666; font-size: 14px;">Early access to new arrivals</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #666666; font-size: 14px;">Special offers just for subscribers</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #666666; font-size: 14px;">Tips and trends in your inbox</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> from our newsletter
              </p>
              <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} eShop. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send newsletter welcome email with discount code
 */
export async function sendNewsletterWelcomeEmail({ email, discountCode, discountPercentage, unsubscribeToken }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email not configured - skipping newsletter email to:', email);
    return Promise.resolve();
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const htmlContent = getNewsletterWelcomeEmailTemplate({
    discountCode,
    discountPercentage,
    unsubscribeUrl,
  });

  const textContent = `
Welcome to eShop Newsletter!

Thank you for subscribing! Here's your exclusive discount code:

${discountCode}

Save ${discountPercentage}% on your first order!

Simply enter this code at checkout to enjoy your discount.

As a subscriber, you'll receive:
✓ Exclusive deals and promotions
✓ Early access to new arrivals
✓ Special offers just for subscribers
✓ Tips and trends in your inbox

Start shopping: ${baseUrl}

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"eShop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Welcome to eShop! Here's Your ${discountPercentage}% Discount Code`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter welcome email sent to:', email);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send newsletter email to:', email);
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Generate back in stock email HTML template
 */
function getBackInStockEmailTemplate({ product, unsubscribeUrl, productUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Back in Stock</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Great News!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">The product you wanted is back in stock</p>
            </td>
          </tr>

          <!-- Product Info -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 300px; height: auto; border-radius: 8px; border: 1px solid #e0e0e0;" />
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px;">${product.name}</h2>
                    <p style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 10px 0;">$${product.price}</p>
                    <p style="color: #666666; font-size: 14px; margin: 10px 0;">Hurry! Limited stock available.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="${productUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">Shop Now</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                You received this email because you requested to be notified when this product is back in stock.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> from these notifications
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text version of email
 */
function getBackInStockEmailText({ product, productUrl, unsubscribeUrl }) {
  return `
Great News! ${product.name} is Back in Stock!

The product you were waiting for is now available:

${product.name}
Price: $${product.price}

Shop now: ${productUrl}

Hurry! Limited stock available.

---
You received this email because you requested to be notified when this product is back in stock.
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

/**
 * Send back in stock email notification
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email
 * @param {Object} params.product - Product details (name, slug, price, image)
 * @param {string} params.unsubscribeToken - Unsubscribe token
 */
export async function sendBackInStockEmail({ email, product, unsubscribeToken }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email not configured - skipping email to:', email);
    return Promise.resolve(); // Don't fail if email is not configured
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const unsubscribeUrl = `${baseUrl}/api/stock-notifications/unsubscribe?token=${unsubscribeToken}`;

  const htmlContent = getBackInStockEmailTemplate({
    product,
    productUrl,
    unsubscribeUrl,
  });

  const textContent = getBackInStockEmailText({
    product,
    productUrl,
    unsubscribeUrl,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Your Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 ${product.name} is Back in Stock!`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email to:', email);
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      message: 'Email not configured',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: 'Email configuration is valid',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
