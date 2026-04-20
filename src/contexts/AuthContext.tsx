import {
  createContext,
  createSignal,
  useContext,
  type ParentComponent,
} from "solid-js";

const API_URL = "https://teaorcoffee.onrender.com";

export interface LoginResult {
  success: boolean;
  error?: string;
  password_required?: boolean;
  message?: string;
}

export interface AuthContextValue {
  userName: () => string | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  login: (name: string, password?: string) => Promise<LoginResult>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const [userName, setUserName] = createSignal<string | null>(
    localStorage.getItem("userName"),
  );
  const [token, setToken] = createSignal<string | null>(
    localStorage.getItem("authToken"),
  );

  const isAuthenticated = () => userName() !== null && token() !== null;

  const login = async (name: string, password?: string): Promise<LoginResult> => {
    try {
      const body: Record<string, string> = { name };
      if (password !== undefined) body.password = password;

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        const error = await response.json();
        return { success: false, error: error.detail || "Incorrect password" };
      }

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || "Login failed" };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          password_required: data.password_required,
          message: data.message,
        };
      }

      localStorage.setItem("userName", name);
      localStorage.setItem("authToken", data.token);
      setUserName(name);
      setToken(data.token);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    setUserName(null);
    setToken(null);
  };

  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token()}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      logout();
      return null;
    }

    if (response.status === 403) {
      try {
        const data = await response.clone().json();
        if (data.detail === "password_setup_required") {
          logout();
          return null;
        }
      } catch {}
    }

    return response;
  };

  const value: AuthContextValue = {
    userName,
    getToken: token,
    isAuthenticated,
    login,
    logout,
    apiFetch,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
