import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
import User from "../models/user.model.js"
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
    try {
        await transporter.sendMail({
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
        });
    } catch (error) {
        console.error(`Failed to send OTP email to ${to}: ${error.message}`);
        throw new Error(`Failed to send OTP email to ${to}: ${error.message}`);
    }
}


export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        await transporter.sendMail({
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
        });
    } catch (error) {
        console.error(`Failed to send delivery OTP email to ${user.email}: ${error.message}`);
        throw new Error(`Failed to send delivery OTP email to ${user.email}: ${error.message}`);
    }
}

export const sendFoodAvailableNotification = async (shopName, city) => {
  const users = await User.find({
    role: 'user',
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    email: { $ne: null }
  }).select('email');

  for (const user of users) {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Ample Food Available at Nearby Restaurant",
      html: `
        <p>Hello,</p>
        <p>Ample food is available at <strong>${shopName}</strong> in your city ${city}.</p>
        <p>Visit now to claim your food!</p>
        <p>Best regards,<br>ViperUnit3</p>
      `
    });
  }
};

export const sendFoodAvailableNotificationToAll = async (shopName) => {
  const users = await User.find({
    role: 'user',
    email: { $ne: null }
  }).select('email');

  const sentEmails = [];
  console.log(`Sending notifications to ${users.length} users for shop: ${shopName}`);

  for (const user of users) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Ample Food Available at Restaurant",
        html: `
          <p>Hello,</p>
          <p>Ample food is available at <strong>${shopName}</strong>.</p>
          <p>Visit now to claim your food!</p>
          <p>Best regards,<br>ViperUnit3</p>
        `
      });
      sentEmails.push(user.email);
      console.log(`Email sent to: ${user.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}: ${error.message}`);
    }
  }

  console.log(`Total emails sent: ${sentEmails.length}`);
  return { sentEmails, total: users.length };
};
