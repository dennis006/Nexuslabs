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

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

async function jsonOrThrow<T = unknown>(res: Response): Promise<T> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const data = payload as { message?: unknown; error?: unknown } | null;
    const message =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      `HTTP ${res.status}`;
    const error = new Error(message);
    (error as Error & { status?: number }).status = res.status;
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
  return jsonOrThrow<AuthResponse>(response);
}

export async function login(data: { emailOrUsername: string; password: string }) {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return jsonOrThrow<AuthResponse>(response);
}

export async function me(accessToken: string) {
  const response = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include"
  });
  return jsonOrThrow<MeResponse>(response);
}

export async function refresh() {
  const response = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });
  if (response.status === 401) {
    return null;
  }
  return jsonOrThrow<RefreshResponse>(response);
}

export async function logout() {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
}

export async function fetchWithAuth(input: FetchInput, init: FetchInit = {}) {
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
      if (!data?.accessToken) {
        clear();
        throw new Error("refresh_failed");
      }
      setAccessToken(data.accessToken);
      response = await execute(data.accessToken);
    } catch (error) {
      clear();
      throw error instanceof Error ? error : new Error("refresh_failed");
    }
  }

  return jsonOrThrow(response);
}
