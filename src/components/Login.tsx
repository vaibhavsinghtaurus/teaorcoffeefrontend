import { createSignal, type Component } from "solid-js";
import { useAuth } from "../contexts/AuthContext";
import "./style/login.css";

const Login: Component = () => {
  const auth = useAuth();
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
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

    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">☕ Tea & Coffee Order 🍵</h1>
          <p class="login-subtitle">Please enter your name to continue</p>
        </div>

        <form class="login-form" onSubmit={handleLogin}>
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
            {loading() ? "Logging in..." : "Continue"}
          </button>
        </form>

        <div class="login-footer">
          <p>Enter your authorized name to access the system</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
