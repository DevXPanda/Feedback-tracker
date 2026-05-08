export const setSession = (user) => {
  if (typeof window === 'undefined' || !user) return;
  
  // Security check: Admins must have a ulbId (except super_admin)
  if (user.role === 'admin' && !user.ulbId) {
    console.error("Attempted to set admin session without ulbId");
  }

  // Persist in localStorage
  localStorage.setItem("user", JSON.stringify(user));
  
  // Persist in Cookie
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `user_session=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
};

export const getSession = () => {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith('user_session='));
  
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));
      return user;
    } catch (e) {
      console.error("Failed to parse session cookie", e);
    }
  }
  
  // Fallback to localStorage
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("user");
  document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};
