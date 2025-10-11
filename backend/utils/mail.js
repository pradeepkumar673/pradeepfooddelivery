import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMail = async (to, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Food Delivery <onboarding@resend.dev>',
            to: [to],
            subject: "Your OTP for Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">OTP for Password Reset</h2>
                    <p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                    <p style="color: #666; font-size: 0.9em;">Please enter this OTP in the app to reset your password. If you didn't request this, please ignore it.</p>
                </div>
            `
        });

        if (error) {
            console.error(`OTP POI SERALA ${to}:`, error);
            throw new Error(`OTP poi serala ${to}: ${error.message}`);
        }

        console.log(`OTP poidichi: ${to}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
        throw new Error(`Failed to send OTP email to ${to}: ${error.message}`);
    }
}

export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Food Delivery <onboarding@resend.dev>',
            to: [user.email],
            subject: "Delivery OTP Confirmation",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Delivery OTP Confirmation</h2>
                    <p>hello ${user.name}, i m pradeepkumar, i m 19 yrs old thanks a lot for trying my web app, this is an completely indipendent project made by me and tool me around 2 and half weeks, if u like drop a connect on my linkedin and make sure u foolow me on insta, thanks a lot,</p>
                    <p>Your delivery OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                    <p style="color: #666; font-size: 0.9em;">This OTP is required to confirm your delivery address. Please enter it in the app.</p>
                </div>
            `
        });

        if (error) {
            console.error(`❌ Failed to send delivery OTP email to ${user.email}:`, error);
            throw new Error(`Failed to send delivery OTP email to ${user.email}: ${error.message}`);
        }

        console.log(`✅ Delivery OTP email sent successfully to: ${user.email}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to send delivery OTP email to ${user.email}:`, error.message);
        throw new Error(`Failed to send delivery OTP email to ${user.email}: ${error.message}`);
    }
}

export const sendFoodAvailableNotification = async (shopName, city) => {
    try {
        const users = await User.find({
            role: 'user',
            city: { $regex: new RegExp(`^${city}$`, 'i') },
            email: { $ne: null }
        }).select('email');

        console.log(`📧 Sending notifications to ${users.length} users in ${city} for shop: ${shopName}`);

        const emailPromises = users.map(async (user) => {
            try {
                const { data, error } = await resend.emails.send({
                    from: 'Food Delivery <onboarding@resend.dev>',
                    to: [user.email],
                    subject: "Ample Food Available at Nearby Restaurant",
                    html: `
                        <p>Hello,</p>
                        <p>Ample food is available at <strong>${shopName}</strong> in your city ${city}.</p>
                        <p>Visit now to claim your food!</p>
                        <p>Best regards,<br>ViperUnit3</p>
                    `
                });

                if (error) {
                    console.error(`❌ Failed to send to ${user.email}:`, error.message);
                    return { success: false, email: user.email, error: error.message };
                }

                console.log(`✅ Food availability email sent to: ${user.email}`);
                return { success: true, email: user.email };
            } catch (error) {
                console.error(`❌ Failed to send to ${user.email}:`, error.message);
                return { success: false, email: user.email, error: error.message };
            }
        });

        const results = await Promise.all(emailPromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ Completed: ${successful} successful, ${failed} failed for ${shopName} in ${city}`);
        return { successful, failed, total: users.length };

    } catch (error) {
        console.error('❌ Error in sendFoodAvailableNotification:', error.message);
        throw error;
    }
}

export const sendFoodAvailableNotificationToAll = async (shopName) => {
    try {
        const users = await User.find({
            role: 'user',
            email: { $ne: null }
        }).select('email');

        console.log(`📧 Sending notifications to ${users.length} users for shop: ${shopName}`);

        const sentEmails = [];
        const emailPromises = users.map(async (user) => {
            try {
                const { data, error } = await resend.emails.send({
                    from: 'Food Delivery <onboarding@resend.dev>',
                    to: [user.email],
                    subject: "Ample Food Available at Restaurant",
                    html: `
                        <p>Hello,</p>
                        <p>Ample food is available at <strong>${shopName}</strong>.</p>
                        <p>Visit now to claim your food!</p>
                        <p>Best regards,<br>lt.col.pradeep</p>
                    `
                });

                if (error) {
                    console.error(`❌ Failed to send to ${user.email}:`, error.message);
                    return null;
                }

                console.log(`✅ Email sent to: ${user.email}`);
                sentEmails.push(user.email);
                return user.email;
            } catch (error) {
                console.error(`❌ Failed to send to ${user.email}:`, error.message);
                return null;
            }
        });

        await Promise.all(emailPromises);
        console.log(`✅ Total emails sent: ${sentEmails.length}`);
        return { sentEmails, total: users.length };

    } catch (error) {
        console.error('❌ Error in sendFoodAvailableNotificationToAll:', error.message);
        throw error;
    }
}

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
