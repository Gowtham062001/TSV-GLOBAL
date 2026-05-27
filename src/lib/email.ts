import nodemailer from "nodemailer";

export async function sendLeadNotification(data: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  company?: string | null;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const notifyEmail = process.env.NOTIFY_EMAIL || "media@tsvhomes.in";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #c1000a; border-bottom: 2px solid #c1000a; pb: 10px;">New Lead: ${data.type}</h2>
      <table style="width: 100%; border-collapse: collapse; mt: 20px;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone || "—"}</td></tr>
        ${data.company ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.company}</td></tr>` : ""}
        ${data.subject ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.subject}</td></tr>` : ""}
      </table>

      ${data.message ? `
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; border-left: 4px solid #ccc;">
          <strong>Message:</strong><br/>
          ${data.message.replace(/\n/g, '<br/>')}
        </div>
      ` : ""}
      <p style="font-size: 10px; color: #999; margin-top: 30px; text-align: center;">TSV Global Solutions — Admin Notification System</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"TSV Leads" <${process.env.SMTP_USER}>`,
    to: notifyEmail,
    subject: `New Lead: ${data.type} (${data.name})`,
    html,
  });
}
