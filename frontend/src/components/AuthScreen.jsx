import { useState } from "react";
import { login, register } from "../api/client.js";
import "../styles/auth.css";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = isRegister
        ? await register(username, password)
        : await login(username, password);
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">C</div>
          <h1>CalenDo</h1>
          <p>一週間を、心地よいテンポで。</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            className={!isRegister ? "active" : ""}
            onClick={() => changeMode("login")}
            type="button"
          >
            ログイン
          </button>
          <button
            className={isRegister ? "active" : ""}
            onClick={() => changeMode("register")}
            type="button"
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            ユーザー名
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength="2"
              maxLength="30"
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="6"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </label>

          {isRegister && (
            <p className="auth-hint">パスワードは6文字以上にしてください。</p>
          )}
          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" disabled={submitting}>
            {submitting
              ? "処理中..."
              : isRegister
                ? "アカウントを作る"
                : "ログイン"}
          </button>
        </form>
      </section>
    </main>
  );
}
