import "./App.css";
import { createSignal, createEffect } from "solid-js";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import TeaCoffeeVote from "./components/TeaCoffeVote";

function AppContent() {
  const auth = useAuth();

  return <>{auth.isAuthenticated() ? <TeaCoffeeVote /> : <Login />}</>;
}

function App() {
  const [dark, setDark] = createSignal(
    localStorage.getItem("theme") === "dark"
  );

  createEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark() ? "dark" : "light"
    );
    localStorage.setItem("theme", dark() ? "dark" : "light");
  });

  return (
    <AuthProvider>
      <button
        class="theme-toggle"
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {dark() ? "☀️" : "🌙"}
      </button>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
