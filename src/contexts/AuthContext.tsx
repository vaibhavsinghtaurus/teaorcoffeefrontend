import {
  createContext,
  createSignal,
  useContext,
  type ParentComponent,
} from "solid-js";

const API_URL = "https://teaorcoffee.onrender.com";

export interface AuthContextValue {
  userName: () => string | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  login: (name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  const login = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || "Login failed" };
      }

      const data = await response.json();
      localStorage.setItem("userName", name);
      localStorage.setItem("authToken", data.token);
      setUserName(name);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    setUserName(null);
    setToken(null);
  };

  const value: AuthContextValue = {
    userName,
    getToken: token,
    isAuthenticated,
    login,
    logout,
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
