// Builds the Supabase auth email templates (pasted into Authentication > Emails).
// Run: node build.mjs  -> writes confirm-signup.html, reset-password.html, invite.html
import { writeFileSync } from 'node:fs';

const wrap = ({ preheader, heading, intro, action, after, why }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<tr><td style="padding:28px 32px 0 32px;font-size:15px;font-weight:bold;letter-spacing:1px;color:#475569;">THE ZINN APP</td></tr>
<tr><td style="padding:16px 32px 0 32px;">
<h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#0f172a;">${heading}</h1>
<p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;">${intro}</p>
${action}
<p style="margin:20px 0 0 0;font-size:14px;line-height:1.6;color:#475569;">${after}</p>
</td></tr>
<tr><td style="padding:24px 32px 28px 32px;">
<hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px 0;">
<p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#6b7280;">${why}</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">Questions? Reply to this email or write to <a href="mailto:support@thezinnapp.com" style="color:#475569;">support@thezinnapp.com</a>.<br>The ZINN App &middot; <a href="https://thezinnapp.com" style="color:#475569;">thezinnapp.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;

const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background-color:#0f172a;">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
</td></tr></table>
<p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#6b7280;">If the button doesn't work, copy this link into your browser:<br><a href="${href}" style="color:#475569;word-break:break-all;">${href}</a></p>`;

const templates = {
  'confirm-signup.html': wrap({
    preheader: 'Your verification code for The ZINN App',
    heading: 'Confirm your email',
    intro: 'Welcome to The ZINN App! Enter this 6-digit code in the app to finish creating your account:',
    action: `<p style="margin:0;padding:16px 0;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0f172a;text-align:center;background-color:#f1f5f9;border-radius:8px;">{{ .Token }}</p>`,
    after: 'This code expires in 1 hour. For your security, never share it with anyone.',
    why: 'You received this email because someone signed up for The ZINN App with {{ .Email }}. If that wasn\'t you, you can ignore this email and no account will be created.',
  }),
  'reset-password.html': wrap({
    preheader: 'Choose a new password for The ZINN App',
    heading: 'Reset your password',
    intro: 'We received a request to reset the password for your ZINN App account. Click the button below to choose a new one.',
    action: button('{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery', 'Choose a new password'),
    after: 'This link works once and expires in 1 hour.',
    why: 'You received this email because a password reset was requested for {{ .Email }} on The ZINN App. If you didn\'t ask for this, you can ignore this email and your password will stay the same.',
  }),
  'invite.html': wrap({
    preheader: 'Set your password to join The ZINN App',
    heading: "You're invited to The ZINN App",
    intro: "You've been invited to join The ZINN App. Click the button below to set your password and finish creating your account.",
    action: button('{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=invite', 'Set your password'),
    after: 'This link works once and expires soon, so please use it today.',
    why: "You received this email because an administrator of The ZINN App invited {{ .Email }}. If you weren't expecting this invitation, you can ignore this email.",
  }),
};

for (const [name, html] of Object.entries(templates)) writeFileSync(new URL(name, import.meta.url), html);
console.log('built', Object.keys(templates).join(', '));
