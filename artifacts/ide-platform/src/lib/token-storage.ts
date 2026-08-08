// Penyimpanan token auth terpusat.
//
// Token bisa berada di dua tempat:
//   - localStorage   → "Ingat saya" dicentang (bertahan setelah tab ditutup)
//   - sessionStorage → login biasa (hilang saat tab ditutup)
//
// Semua pembaca token WAJIB lewat helper ini. Kalau ada yang membaca
// localStorage saja, sesi tanpa "Ingat saya" akan mengirim request tanpa
// header Authorization dan user langsung dipantulkan kembali ke halaman login.

export const TOKEN_KEY = "ide_token";

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    // Storage bisa dilempar SecurityError di mode privat / iframe tertentu.
    return null;
  }
}

function safeRemove(storage: Storage | undefined, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    /* abaikan */
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return safeGet(window.localStorage, TOKEN_KEY) ?? safeGet(window.sessionStorage, TOKEN_KEY);
}

export function storeToken(token: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (rememberMe) {
      window.localStorage.setItem(TOKEN_KEY, token);
      safeRemove(window.sessionStorage, TOKEN_KEY);
    } else {
      window.sessionStorage.setItem(TOKEN_KEY, token);
      safeRemove(window.localStorage, TOKEN_KEY);
    }
  } catch {
    /* abaikan */
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  safeRemove(window.localStorage, TOKEN_KEY);
  safeRemove(window.sessionStorage, TOKEN_KEY);
}
