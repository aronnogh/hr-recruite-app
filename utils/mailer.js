// utils/mailer.js
import nodemailer from 'nodemailer';

const { GMAIL_EMAIL, GMAIL_APP_PASSWORD } = process.env;

// Verify that the environment variables are loaded
if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials are not set in the environment variables. Please check your .env file.");
}

// Create a transporter object using Gmail and an App Password
const transporter = nodemailer.createTransport({
    service: 'gmail', // Using 'gmail' service automatically sets host, port, and security
    auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_APP_PASSWORD, // Use the 16-digit App Password here
    },
});

/**
 * A reusable function to send emails using Nodemailer.
 * @param {object} mailOptions
 * @param {string} mailOptions.to The recipient's email address.
 * @param {string} mailOptions.subject The subject of the email.
 * @param {string} mailOptions.html The HTML content of the email.
 */
export async function sendEmail(mailOptions) {
    try {
        // Verify the transporter is ready to send emails
        await transporter.verify();

        const info = await transporter.sendMail({
            from: `AI-Recruiter <${GMAIL_EMAIL}>`, // The sender's display name and email
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
        });

        console.log("Email sent successfully: ", info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error("Failed to send email with Nodemailer:", error);
        return { success: false, error: error.message || 'An unknown error occurred during email sending.' };
    }
}