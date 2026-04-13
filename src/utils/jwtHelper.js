// ── Decode JWT payload (no library needed) ────────────────────────────────────
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ── Check if token is expired ─────────────────────────────────────────────────
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // exp is in seconds, Date.now() in ms
  return decoded.exp * 1000 < Date.now();
};

// ── Get role from token ───────────────────────────────────────────────────────
export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

// ── Check if user is authenticated ───────────────────────────────────────────
export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  return !isTokenExpired(token);
};

// ── Get stored user info ──────────────────────────────────────────────────────
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};
