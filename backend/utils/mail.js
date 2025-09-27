import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
import User from "../models/user.model.js"
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail=async (to,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject:"Reset Your Password",
        html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
}


export const sendDeliveryOtpMail=async (user,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to:user.email,
        subject:"Delivery OTP",
        html:`<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
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
