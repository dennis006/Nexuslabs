import { useUserStore } from "@/store/userStore";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: "MEMBER" | "ADMIN";
  createdAt: string;
};

type AuthResponse = {
  user: SessionUser;
  accessToken: string;
};

type MeResponse = {
  user: SessionUser;
};

type RefreshResponse = {
  accessToken: string;
};

async function parseJson<T>(response: Response, errorKey: string): Promise<T> {
  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: unknown }).error)
        : errorKey;
    const error = new Error(detail);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return payload as T;
}

export async function register(data: { email: string; username: string; password: string }) {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return parseJson<AuthResponse>(response, "register_failed");
}

export async function login(data: { emailOrUsername: string; password: string }) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return parseJson<AuthResponse>(response, "login_failed");
}

export async function me(accessToken: string) {
  const response = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include"
  });
  return parseJson<MeResponse>(response, "me_failed");
}

export async function refresh() {
  const response = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });
  return parseJson<RefreshResponse>(response, "refresh_failed");
}

export async function logout() {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const { accessToken, setAccessToken, clear } = useUserStore.getState();

  const execute = async (token?: string | null) => {
    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, {
      ...init,
      headers,
      credentials: "include"
    });
  };

  let response = await execute(accessToken);

  if (response.status === 401) {
    try {
      const data = await refresh();
      setAccessToken(data.accessToken);
      response = await execute(data.accessToken);
    } catch (error) {
      clear();
      throw error instanceof Error ? error : new Error("refresh_failed");
    }
  }

  return parseJson(response, "request_failed");
}
