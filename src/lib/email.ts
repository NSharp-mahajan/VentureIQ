import { Resend } from 'resend';

// Only initialize if the API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendWorkspaceInviteEmail(
  toEmail: string,
  workspaceName: string,
  inviteLink: string,
  inviterName: string = "A team member"
) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Skipping email send to:", toEmail);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VentureIQ <onboarding@resend.dev>', // Update this to your verified domain in production
      to: [toEmail],
      subject: `You've been invited to join ${workspaceName} on VentureIQ`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaeb; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Join ${workspaceName} on VentureIQ</h2>
          <p style="color: #555; font-size: 16px;">Hello,</p>
          <p style="color: #555; font-size: 16px;">
            <strong>${inviterName}</strong> has invited you to collaborate in their team workspace on VentureIQ.
          </p>
          <p style="color: #555; font-size: 16px;">
            VentureIQ is a collaborative AI-powered platform for startup due diligence and research.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            If you don't have an account, you'll be prompted to create one before joining the workspace.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
    }
    
    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
