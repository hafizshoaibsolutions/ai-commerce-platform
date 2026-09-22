/**
 * HTML email templates.
 *
 * Email HTML is not web HTML. Outlook renders through Word, Gmail drops an
 * external stylesheet, and flex/grid are unusable — so everything here is
 * nested tables with inline styles in a fixed 600px column. Three deliberate
 * choices:
 *
 *   - The button carries a VML fallback (`v:roundrect`), because Outlook
 *     ignores padding on an `<a>` and would otherwise show bare text.
 *   - There are no images at all. Most clients block remote images by default,
 *     and a broken logo reads worse than a wordmark that always renders.
 *   - Colours are the sRGB equivalents of the oklch tokens in
 *     frontend/src/app/globals.css, because email clients don't support oklch.
 */

const BRAND = {
  name: "AI Commerce",
  primary: "#4F46E5", // --primary, indigo-600
  ink: "#18181B", // headings
  body: "#52525B", // paragraphs
  muted: "#71717A", // captions and footer
  border: "#E4E4E7",
  surface: "#FAFAFA", // inset panels
  canvas: "#F4F4F5", // page behind the card
  panel: "#18181B", // header band, mirroring the app's dark brand panel
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const MONO =
  "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

/** A complete email, ready to hand to `sendEmail` alongside its recipient. */
export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/**
 * The address is user-supplied, so it is escaped before it can reach an HTML
 * body — a name containing markup should render as text, not as markup.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** "Ada Lovelace" → "Ada", so the greeting doesn't repeat a full legal name. */
const firstName = (name: string): string | null => {
  const first = name.trim().split(/\s+/)[0];
  return first || null;
};

interface LayoutOptions {
  /** Inbox preview line, hidden inside the body. */
  preheader: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  actionLabel: string;
  actionUrl: string;
  /** Bolded lead-in of the inset notice box. */
  noticeLead: string;
  noticeBody: string;
  /** Small print under the divider. */
  footerNote: string;
}

/**
 * Renders the shared shell. Both transactional emails use it so the brand,
 * spacing and button treatment can't drift apart between them.
 */
const renderLayout = ({
  preheader,
  heading,
  greeting,
  paragraphs,
  actionLabel,
  actionUrl,
  noticeLead,
  noticeBody,
  footerNote,
}: LayoutOptions): string => {
  const url = escapeHtml(actionUrl);

  const body = paragraphs
    .map(
      (paragraph, index) =>
        `<p style="margin:0 0 ${index === paragraphs.length - 1 ? "28px" : "14px"};font-size:15px;line-height:1.65;color:${BRAND.body};">${paragraph}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(heading)}</title>
<style>
  /* Inline styles carry the desktop layout; these only tighten the gutters and
     stretch the button on a phone. Clients that drop the style block fall back
     to the inline values, which are already readable at that width. */
  @media only screen and (max-width:600px) {
    .px { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:20px !important; }
    .btn-cell { text-align:center !important; }
    .btn { display:block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${BRAND.canvas};-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;">

<!-- Inbox preview text. The zero-width joiners after it stop the client pulling
     the first line of the body up into the preview. -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${BRAND.canvas};">
  ${escapeHtml(preheader)}&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;&#65279;&#8199;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.canvas};">
  <tr>
    <td align="center" style="padding:32px 12px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">

        <!-- Header: the app's dark brand panel, with a text wordmark so nothing
             depends on an image loading. -->
        <tr>
          <td class="px" bgcolor="${BRAND.panel}" style="background-color:${BRAND.panel};padding:26px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="34" style="width:34px;">
                  <div style="width:34px;height:34px;background-color:${BRAND.primary};border-radius:9px;color:#FFFFFF;font-family:${FONT};font-size:16px;font-weight:700;line-height:34px;text-align:center;">A</div>
                </td>
                <td style="padding-left:12px;font-family:${FONT};font-size:16px;font-weight:600;letter-spacing:-0.2px;color:#FFFFFF;">
                  ${BRAND.name}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="px" style="padding:36px 32px 32px;font-family:${FONT};">

            <h1 class="h1" style="margin:0 0 18px;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.3px;color:${BRAND.ink};">
              ${escapeHtml(heading)}
            </h1>

            <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${BRAND.ink};font-weight:600;">
              ${escapeHtml(greeting)}
            </p>

            ${body}

            <!-- Button. Outlook gets the VML rectangle; every other client gets
                 the padded anchor. -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
              <tr>
                <td class="btn-cell" align="left" bgcolor="${BRAND.primary}" style="background-color:${BRAND.primary};border-radius:8px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:210px;" arcsize="17%" stroke="f" fillcolor="${BRAND.primary}">
                    <w:anchorlock/>
                    <center style="color:#FFFFFF;font-family:${FONT};font-size:15px;font-weight:600;">${escapeHtml(actionLabel)}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a class="btn" href="${url}" style="display:inline-block;padding:15px 34px;font-family:${FONT};font-size:15px;font-weight:600;line-height:1.2;color:#FFFFFF;text-decoration:none;border-radius:8px;">${escapeHtml(actionLabel)}</a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>

            <!-- The raw link, for clients that strip anchors and for anyone who
                 would rather see where a button points before tapping it. -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
              <tr>
                <td style="font-family:${FONT};font-size:13px;line-height:1.5;color:${BRAND.muted};padding-bottom:8px;">
                  Button not working? Paste this link into your browser:
                </td>
              </tr>
              <tr>
                <td bgcolor="${BRAND.surface}" style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;padding:12px 14px;font-family:${MONO};font-size:12px;line-height:1.55;word-break:break-all;">
                  <a href="${url}" style="color:${BRAND.primary};text-decoration:none;word-break:break-all;">${url}</a>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
              <tr>
                <td bgcolor="${BRAND.surface}" style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;padding:14px 16px;font-family:${FONT};font-size:13px;line-height:1.6;color:${BRAND.body};">
                  <strong style="color:${BRAND.ink};font-weight:600;">${escapeHtml(noticeLead)}</strong><br />
                  ${escapeHtml(noticeBody)}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <tr>
          <td class="px" bgcolor="${BRAND.surface}" style="background-color:${BRAND.surface};border-top:1px solid ${BRAND.border};padding:20px 32px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND.muted};">
            <strong style="color:${BRAND.body};font-weight:600;">${BRAND.name}</strong><br />
            ${escapeHtml(footerNote)}
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
};

export interface VerificationEmailInput {
  /** Used only for the greeting; omitted falls back to a neutral one. */
  name?: string;
  url: string;
  expiresInMinutes: number;
}

/** Asks a new account to confirm its address. */
export const verificationEmail = ({
  name,
  url,
  expiresInMinutes,
}: VerificationEmailInput): EmailContent => {
  const first = name ? firstName(name) : null;
  const greeting = first ? `Hi ${first},` : "Hi there,";
  const expiry = `This link expires in ${expiresInMinutes} minutes.`;
  const dismiss =
    "If you didn't create an account, you can safely ignore this email.";

  return {
    subject: "Verify your email address",
    text: `${greeting}

Welcome to ${BRAND.name}! Please confirm this email address to finish setting up your account.

Verify your email address:
${url}

${expiry}
${dismiss}

— ${BRAND.name}`,
    html: renderLayout({
      preheader: `Confirm your email address to activate your ${BRAND.name} account.`,
      heading: "Confirm your email address",
      greeting,
      paragraphs: [
        `Welcome to ${BRAND.name}! You're one click away from finishing your account — we just need to check this address is really yours.`,
        "Confirming it keeps your account recoverable and lets us reach you about orders.",
      ],
      actionLabel: "Verify email address",
      actionUrl: url,
      noticeLead: expiry,
      noticeBody: dismiss,
      footerNote:
        "You received this because someone signed up with this address. If that wasn't you, no action is needed.",
    }),
  };
};

export interface PasswordResetEmailInput {
  name?: string;
  url: string;
  expiresInMinutes: number;
}

/** Lets a locked-out user choose a new password. */
export const passwordResetEmail = ({
  name,
  url,
  expiresInMinutes,
}: PasswordResetEmailInput): EmailContent => {
  const first = name ? firstName(name) : null;
  const greeting = first ? `Hi ${first},` : "Hi there,";
  const expiry = `This link expires in ${expiresInMinutes} minutes.`;
  const dismiss =
    "If you didn't request this, you can ignore this email — your password won't change.";

  return {
    subject: "Reset your password",
    text: `${greeting}

We received a request to reset the password for your ${BRAND.name} account. Choose a new one here:

${url}

${expiry}
${dismiss}

— ${BRAND.name}`,
    html: renderLayout({
      preheader: `Choose a new password for your ${BRAND.name} account.`,
      heading: "Reset your password",
      greeting,
      paragraphs: [
        `We received a request to reset the password for your ${BRAND.name} account. Choose a new one below and you'll be back to shopping in seconds.`,
        "For your security, signing in anywhere else will be required again once the password changes.",
      ],
      actionLabel: "Choose a new password",
      actionUrl: url,
      noticeLead: expiry,
      noticeBody: dismiss,
      footerNote:
        "You received this because a password reset was requested for this address. If that wasn't you, no action is needed.",
    }),
  };
};
