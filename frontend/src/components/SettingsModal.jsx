import { useRef, useState } from "react";
import {
  changePassword,
  deleteAccount,
  exportBackup,
  importBackup,
  shutdownApp,
} from "../api/client.js";
import "../styles/settings.css";


export default function SettingsModal({
  user,
  onClose,
  onDataChanged,
  onAccountDeleted,
  onAppShutdown,
}) {
  const fileInputRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action, successMessage) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      if (successMessage) setMessage(successMessage);
    } catch (actionError) {
      setError(actionError.message || "操作に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    await run(async () => {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `calendo-backup-${date}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, "バックアップを書き出しました");
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!window.confirm("現在のタスクをバックアップ内容で置き換えますか？")) {
      return;
    }
    await run(async () => {
      let backup;
      try {
        backup = JSON.parse(await file.text());
      } catch {
        throw new Error("JSONファイルを読み込めませんでした");
      }
      await importBackup(backup);
      await onDataChanged();
    }, "バックアップを復元しました");
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    await run(async () => {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
    }, "パスワードを変更しました");
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();
    if (
      !window.confirm(
        "アカウントとすべてのタスクを完全に削除します。この操作は元に戻せません。"
      )
    ) {
      return;
    }
    await run(async () => {
      await deleteAccount(deletePassword);
      onAccountDeleted();
    });
  }

  async function handleShutdown() {
    if (!window.confirm("CalenDoを終了しますか？")) return;
    await run(async () => {
      await shutdownApp();
      onAppShutdown();
    });
  }

  return (
    <div className="modal-overlay" onClick={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
      <div className="modal settings-modal" role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">settings</span>
            <h2 className="modal-title">設定</h2>
          </div>
          <button className="modal-close" onClick={onClose} disabled={busy}>
            ✕
          </button>
        </header>

        <div className="settings-body">
          <section className="settings-section">
            <h3>アカウント</h3>
            <p className="settings-description">
              ログイン中：<strong>{user.username}</strong>
            </p>
            <form className="settings-form" onSubmit={handlePasswordChange}>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="現在のパスワード"
                autoComplete="current-password"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="新しいパスワード（6文字以上）"
                minLength="6"
                autoComplete="new-password"
                required
              />
              <button className="settings-button" disabled={busy}>
                パスワードを変更
              </button>
            </form>
          </section>

          <section className="settings-section">
            <h3>バックアップ</h3>
            <p className="settings-description">
              タスクをJSONファイルに保存・復元できます。
            </p>
            <div className="settings-actions">
              <button className="settings-button" onClick={handleExport} disabled={busy}>
                データを書き出す
              </button>
              <button
                className="settings-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                データを復元
              </button>
              <input
                ref={fileInputRef}
                className="settings-file"
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
              />
            </div>
          </section>

          <section className="settings-section settings-danger-zone">
            <h3>アカウント削除</h3>
            <p className="settings-description">
              アカウントとすべてのタスクを完全に削除します。
            </p>
            <form className="settings-form" onSubmit={handleDeleteAccount}>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="確認のためパスワードを入力"
                autoComplete="current-password"
                required
              />
              <button className="settings-button danger" disabled={busy}>
                アカウントを削除
              </button>
            </form>
          </section>

          {message && <div className="settings-message success">{message}</div>}
          {error && <div className="settings-message error">⚠ {error}</div>}
        </div>

        <footer className="settings-footer">
          <button className="settings-quit" onClick={handleShutdown} disabled={busy}>
            CalenDoを終了
          </button>
          <button className="btn btn-primary" onClick={onClose} disabled={busy}>
            閉じる
          </button>
        </footer>
      </div>
    </div>
  );
}
