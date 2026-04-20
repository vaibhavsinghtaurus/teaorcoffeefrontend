import { createSignal, type Component } from "solid-js";
import { useAuth } from "../contexts/AuthContext";
import "./style/login.css";

const Login: Component = () => {
  const auth = useAuth();
  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordRequired, setPasswordRequired] = createSignal(false);
  const [isSetup, setIsSetup] = createSignal(false);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleNameSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const trimmedName = name().trim();
    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    const result = await auth.login(trimmedName);
    setLoading(false);

    if (result.success) return;

    if (result.password_required) {
      setPasswordRequired(true);
      setIsSetup(result.message === "Password setup required");
      return;
    }

    setError(result.error || "Login failed");
  };

  const handlePasswordSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!password().trim()) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    const result = await auth.login(name().trim(), password().trim());
    setLoading(false);

    if (result.success) return;

    setError(result.error || "Login failed");
  };

  return (
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">☕ Tea & Coffee Order 🍵</h1>
          <p class="login-subtitle">
            {passwordRequired()
              ? "Enter your password to continue"
              : "Please enter your name to continue"}
          </p>
        </div>

        {!passwordRequired() ? (
          <form class="login-form" onSubmit={handleNameSubmit}>
            <div class="input-group">
              <label class="input-label" for="name">
                Your Name
              </label>
              <input
                id="name"
                class="name-input"
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                placeholder="Enter your name"
                disabled={loading()}
                autofocus
              />
            </div>

            {error() && <div class="login-error">{error()}</div>}

            <button
              class="login-submit"
              type="submit"
              disabled={!name().trim() || loading()}
            >
              {loading() ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form class="login-form" onSubmit={handlePasswordSubmit}>
            {isSetup() && (
              <div class="login-warning">
                Please remember this password — there is no way to recover it.
              </div>
            )}

            <div class="input-group">
              <label class="input-label" for="password">
                Password
              </label>
              <input
                id="password"
                class="name-input"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                placeholder={isSetup() ? "Create a password" : "Enter your password"}
                disabled={loading()}
                autofocus
              />
            </div>

            {error() && <div class="login-error">{error()}</div>}

            <button
              class="login-submit"
              type="submit"
              disabled={!password().trim() || loading()}
            >
              {loading() ? "Logging in..." : isSetup() ? "Set Password & Login" : "Login"}
            </button>
          </form>
        )}

        <div class="login-footer">
          <p>Enter your authorized name to access the system</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
