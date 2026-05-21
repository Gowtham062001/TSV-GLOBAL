import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtppro.zoho.in",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    cid: string;
  }>;
}

export async function sendMail({ to, subject, html, attachments }: SendMailOptions) {
  return transporter.sendMail({
    from: `"TSV Global Solutions" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

/** Welcome email template for new admin users */
export function buildWelcomeEmail(params: {
  name: string;
  email: string;
  password: string;
  role: string;
  loginUrl: string;
}): string {
  const { name, email, password, role, loginUrl } = params;
  const year = new Date().getFullYear();
  const logoUrl = "https://tsvglobal.com/img/logo.png"; // fallback public logo

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TSV Global Admin</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">

          <!-- Header with Logo -->
          <tr>
            <td style="background:#ffffff;padding:32px 48px 24px;text-align:center;border-bottom:3px solid #c1000a;">
              <img
                src="cid:tsvlogo"
                alt="TSV Global Solutions"
                style="height:56px;max-width:220px;object-fit:contain;"
                onerror="this.style.display='none'"
              />
              <p style="margin:12px 0 0;color:#c1000a;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Admin Panel Access</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1e293b;">Welcome aboard, ${name}! 👋</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">
                Your admin account for the <strong>TSV Global Solutions</strong> content management system has been created successfully.
                Here are your login credentials — please keep them safe.
              </p>

              <!-- Credentials Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;">Your Login Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Email</span>
                          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1e293b;">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Password</span>
                          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1e293b;font-family:monospace;background:#fff;border:1px solid #e2e8f0;padding:6px 12px;border-radius:8px;display:inline-block;">${password}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 0;">
                          <span style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Role</span>
                          <p style="margin:4px 0 0;">
                            <span style="font-size:13px;font-weight:700;color:${role === "ADMIN" ? "#7c3aed" : "#2563eb"};background:${role === "ADMIN" ? "#f5f3ff" : "#eff6ff"};padding:4px 12px;border-radius:100px;border:1px solid ${role === "ADMIN" ? "#ddd6fe" : "#bfdbfe"};">${role}</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#c1000a,#8b0000);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:100px;box-shadow:0 8px 24px rgba(193,0,10,0.3);">
                      Login to Admin Panel →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
                      🔒 Security Notice: Please change your password immediately after your first login. Never share your credentials with anyone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                This email was sent automatically by TSV Global Admin System.
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                © ${year} TSV Global Solutions Pvt. Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
