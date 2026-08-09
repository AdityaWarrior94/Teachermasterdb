// Helper for Google Workspace Gmail API integration and mail dispatch

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

// In-memory access token cache (never stored in localStorage as per security guidelines)
let cachedAccessToken: string | null = null;
let cachedUser: GoogleUser | null = null;

export const setGoogleAuthSession = (token: string, user: GoogleUser) => {
  cachedAccessToken = token;
  cachedUser = user;
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleUser = (): GoogleUser | null => {
  return cachedUser;
};

export const clearGoogleAuthSession = () => {
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * Fetches profile info of the authenticated Google user
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Userinfo request failed with status ${res.status}`);
    }
    const data = await res.json();
    return {
      email: data.email || 'Admin User',
      name: data.name || data.email || 'Admin User',
      picture: data.picture,
    };
  } catch (err) {
    console.error('Error fetching Google user info:', err);
    throw err;
  }
}

/**
 * Encodes string to base64url format for Gmail API
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email directly using Google Gmail REST API
 */
export async function sendEmailViaGmailApi({
  to,
  subject,
  bodyHtml,
  accessToken,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  accessToken: string;
}): Promise<boolean> {
  try {
    const rawMessage = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyHtml,
    ].join('\r\n');

    const encodedMessage = base64UrlEncode(rawMessage);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      console.error('Gmail API Error Response:', errJson);
      throw new Error(errJson.error?.message || `Gmail API failed with status ${response.status}`);
    }

    return true;
  } catch (err) {
    console.error('Error sending email via Gmail API:', err);
    throw err;
  }
}

/**
 * Generates and triggers mailto fallback link in browser
 */
export function openMailtoClient({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}
