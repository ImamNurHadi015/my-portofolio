import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_API_SECRET;
const COOKIE_NAME = "admin_session";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function sign(value) {
  if (!SECRET) return null;
  const hmac = createHmac("sha256", SECRET);
  hmac.update(value);
  return hmac.digest("hex");
}

/**
 * Create signed cookie value for admin session.
 * @returns {string|null} Cookie value or null if ADMIN_SECRET not set
 */
export function createAdminCookie() {
  if (!SECRET) return null;
  const timestamp = Date.now().toString();
  const signature = sign(timestamp);
  return `${timestamp}.${signature}`;
}

/**
 * Verify admin cookie from request. Use in API routes.
 * @param {string|undefined} cookieHeader - req.headers.get('cookie')
 * @returns {boolean}
 */
export function verifyAdminCookie(cookieHeader) {
  if (!SECRET) return false;
  if (!cookieHeader) return false;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((s) => {
      const [k, v] = s.trim().split("=");
      return [k, v];
    })
  );
  const raw = cookies[COOKIE_NAME];
  if (!raw) return false;
  const [timestamp, signature] = raw.split(".");
  if (!timestamp || !signature) return false;
  const expected = sign(timestamp);
  if (!expected || expected.length !== signature.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) return false;
  } catch {
    return false;
  }
  const t = parseInt(timestamp, 10);
  if (Number.isNaN(t) || Date.now() - t > TTL_MS) return false;
  return true;
}

export { COOKIE_NAME };
