import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
import User from "../models/user.model.js"

// Create transporter with Render-compatible settings
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    // Crucial for Render.com
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
    secure: true,
    tls: {
      rejectUnauthorized: false
    },
    // Additional settings for better reliability
    pool: true,
    maxConnections: 1,
    maxMessages: 5
  });
};

let transporter = createTransporter();

// Function to verify and recreate transporter if needed
const getVerifiedTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection is active');
    return transporter;
  } catch (error) {
    console.log('🔄 Recreating SMTP transporter...');
    transporter = createTransporter();
    await transporter.verify();
    console.log('✅ New SMTP connection established');
    return transporter;
  }
};

// Helper function to send email with timeout
const sendEmailWithTimeout = async (mailOptions, emailType) => {
  try {
    console.log(`📧 Attempting to send ${emailType} to: ${mailOptions.to}`);
    
    // Get verified transporter
    const currentTransporter = await getVerifiedTransporter();
    
    // Send email with timeout
    const sendPromise = currentTransporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 25000);
    });
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`✅ ${emailType} sent successfully:`, info.messageId);
    return info;
    
  } catch (error) {
    console.error(`❌ Failed to send ${emailType} to ${mailOptions.to}:`, error.message);
    
    // More specific error messages
    if (error.message.includes('Invalid login')) {
      throw new Error('Gmail authentication failed. Check your app password.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Connection timeout. Please try again.');
    } else {
      throw new Error(`${emailType} error: ${error.message}`);
    }
  }
};

export const sendOtpMail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject: "Your OTP for Password Reset",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">OTP for Password Reset</h2>
                <p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                <p style="color: #666; font-size: 0.9em;">Please enter this OTP in the app to reset your password. If you didn't request this, please ignore it.</p>
            </div>
        `
    };
    
    await sendEmailWithTimeout(mailOptions, "OTP email");
}

export const sendDeliveryOtpMail = async (user, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Delivery OTP Confirmation",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Delivery OTP Confirmation</h2>
                <p>Your delivery OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                <p style="color: #666; font-size: 0.9em;">This OTP is required to confirm your delivery address. Please enter it in the app.</p>
            </div>
        `
    };
    
    await sendEmailWithTimeout(mailOptions, "delivery OTP email");
}

export const sendFoodAvailableNotification = async (shopName, city) => {
  const users = await User.find({
    role: 'user',
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    email: { $ne: null }
  }).select('email');

  console.log(`Sending notifications to ${users.length} users in ${city} for shop: ${shopName}`);

  for (const user of users) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Ample Food Available at Nearby Restaurant",
      html: `
        <p>Hello,</p>
        <p>Ample food is available at <strong>${shopName}</strong> in your city ${city}.</p>
        <p>Visit now to claim your food!</p>
        <p>Best regards,<br>ViperUnit3</p>
      `
    };

    try {
      await sendEmailWithTimeout(mailOptions, "food availability notification");
      console.log(`✅ Food availability email sent to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send food availability email to ${user.email}: ${error.message}`);
      // Continue with other users even if one fails
    }
  }

  console.log(`✅ Completed sending food availability notifications for ${shopName} in ${city}`);
}

export const sendFoodAvailableNotificationToAll = async (shopName) => {
  const users = await User.find({
    role: 'user',
    email: { $ne: null }
  }).select('email');

  const sentEmails = [];
  console.log(`Sending notifications to ${users.length} users for shop: ${shopName}`);

  for (const user of users) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Ample Food Available at Restaurant",
      html: `
        <p>Hello,</p>
        <p>Ample food is available at <strong>${shopName}</strong>.</p>
        <p>Visit now to claim your food!</p>
        <p>Best regards,<br>ViperUnit3</p>
      `
    };

    try {
      await sendEmailWithTimeout(mailOptions, "food availability notification to all");
      sentEmails.push(user.email);
      console.log(`✅ Email sent to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}: ${error.message}`);
    }
  }

  console.log(`✅ Total emails sent: ${sentEmails.length}`);
  return { sentEmails, total: users.length };
};

// Test function to verify email setup
export const testEmailConnection = async () => {
  try {
    const currentTransporter = await getVerifiedTransporter();
    console.log('✅ Email service is properly configured');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};
