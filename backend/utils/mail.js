import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user.model.js';

// Initialize SendGrid
console.log('🔧 Initializing SendGrid...');
console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is missing in environment variables');
} else {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized successfully');
}

export const sendOtpMail = async (to, otp) => {
    try {
        const msg = {
            to: to,
            from: 'forceproject077@gmail.com', // Use your verified sender email
            subject: "Your OTP for Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">OTP for Password Reset</h2>
                    <p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                    <p style="color: #666; font-size: 0.9em;">Please enter this OTP in the app to reset your password. If you didn't request this, please ignore it.</p>
                </div>
            `
        };

        console.log(`📧 Attempting to send OTP to: ${to}`);
        await sgMail.send(msg);
        console.log(`✅ OTP email sent successfully to: ${to}`);
        
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
        
        if (error.response) {
            console.error('SendGrid API Error:', error.response.body);
        }
        
        throw new Error(`Failed to send OTP email to ${to}: ${error.message}`);
    }
}

export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        const msg = {
            to: user.email,
            from: 'forceproject077@gmail.com', // Use your verified sender email
            subject: "Delivery OTP Confirmation",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Delivery OTP Confirmation</h2>
                    <p>Your delivery OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>
                    <p style="color: #666; font-size: 0.9em;">This OTP is required to confirm your delivery address. Please enter it in the app.</p>
                </div>
            `
        };

        console.log(`📧 Attempting to send delivery OTP to: ${user.email}`);
        await sgMail.send(msg);
        console.log(`✅ Delivery OTP email sent successfully to: ${user.email}`);
        
    } catch (error) {
        console.error(`❌ Failed to send delivery OTP email to ${user.email}:`, error.message);
        
        if (error.response) {
            console.error('SendGrid API Error:', error.response.body);
        }
        
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
                const msg = {
                    to: user.email,
                    from: 'forceproject077@gmail.com',
                    subject: "Ample Food Available at Nearby Restaurant",
                    html: `
                        <p>Hello,</p>
                        <p>Ample food is available at <strong>${shopName}</strong> in your city ${city}.</p>
                        <p>Visit now to claim your food!</p>
                        <p>Best regards,<br>ViperUnit3</p>
                    `
                };

                await sgMail.send(msg);
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
                const msg = {
                    to: user.email,
                    from: 'forceproject077@gmail.com',
                    subject: "Ample Food Available at Restaurant",
                    html: `
                        <p>Hello,</p>
                        <p>Ample food is available at <strong>${shopName}</strong>.</p>
                        <p>Visit now to claim your food!</p>
                        <p>Best regards,<br>ViperUnit3</p>
                    `
                };

                await sgMail.send(msg);
                sentEmails.push(user.email);
                console.log(`✅ Email sent to: ${user.email}`);
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

// Test function
export const testSendGridConnection = async () => {
    try {
        const msg = {
            to: 'forceproject077@gmail.com', // Your email
            from: 'forceproject077@gmail.com',
            subject: 'SendGrid Test - Food Delivery',
            html: '<p>SendGrid is working correctly with your Food Delivery app!</p>'
        };

        await sgMail.send(msg);
        console.log('✅ SendGrid test email sent successfully!');
        return true;
    } catch (error) {
        console.error('❌ SendGrid test failed:', error.message);
        if (error.response) {
            console.error('SendGrid API Error:', error.response.body);
        }
        return false;
    }
}