// utils/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// FROM_EMAIL should be an email from your verified Resend domain
const FROM_EMAIL = 'koushik.647433@gmail.com';

/**
 * Sends an email using the Resend API.
 * @param {string} to The recipient's email address.
 * @param {string} subject The subject of the email.
 * @param {React.ReactElement} reactElement The React component to render as the email body.
 */
export async function sendEmail({ to, subject, reactElement }) {
  try {
    const { data, error } = await resend.emails.send({
      from: `AI Recruiter <${FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      react: reactElement,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}