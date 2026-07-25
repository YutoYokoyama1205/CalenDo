# CalenDo

CalenDoは、1週間単位で予定とタスクを管理できるTo Doアプリです。
日ごとのタスク登録・編集・完了管理に加えて、1週間の達成率をグラフで確認できます。

## 主な機能

- ユーザー登録、ログイン、ログアウト
- パスワード変更、アカウント削除
- ユーザーごとに独立したタスクデータ
- タスクデータのバックアップと復元
- 1週間分のタスクを一覧表示
- タスクの追加、編集、削除
- タスクの完了チェック
- 日別・週全体の達成率表示
- 前週・翌週・指定日への移動

## 使用技術

### フロントエンド

- React 18
- Vite
- Recharts

### バックエンド

- Python
- Flask
- Flask-CORS
- JSONファイルによるローカルデータ保存
- Flaskセッションによるログイン管理
- Werkzeugによるパスワードのハッシュ化

## ディレクトリ構成

```text
CalenDo/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── WeekGrid.jsx
│   │   │   └── ...
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app.py
│   ├── api.py
│   ├── auth.py
│   ├── storage.py
│   ├── tasks.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

## ローカル環境での起動

### 必要なもの

- Python 3
- Node.js
- npm

### 1. リポジトリを取得

```bash
git clone https://github.com/YutoYokoyama1205/CalenDo.git
cd CalenDo
```

### 2. フロントエンドをビルド

```bash
cd frontend
npm install
npm run build
cd ..
```

ビルド結果は`frontend/dist/`へ出力されます。

### 3. Pythonライブラリをインストール

```bash
cd backend
python3 -m pip install -r requirements.txt
```

### 4. アプリを起動

macOS・Linux：

```bash
export CALENDO_SECRET_KEY="任意の十分長い文字列"
python3 app.py
```

Windows PowerShell：

```powershell
$env:CALENDO_SECRET_KEY="任意の十分長い文字列"
python app.py
```

起動後、ブラウザで次のURLを開きます。

```text
http://127.0.0.1:5050
```

`5050`番が使用中の場合は、空いているポートを自動的に選択します。

## 開発モード

バックエンドを起動した状態で、別のターミナルからViteを起動します。

```bash
cd frontend
npm run dev
```

開発画面：

```text
http://127.0.0.1:5173
```

Viteは`/auth`やタスク関連APIをバックエンドへ転送します。開発時にViteを使う場合は、バックエンドを`CALENDO_PORT=5000`で起動してください。

## ユーザーデータ

ユーザー情報とタスクは、ソースコードの外にある`.calendo`フォルダへ保存されます。

```text
~/.calendo/
├── users.json
└── users/
    ├── <ユーザーID>.json
    └── <ユーザーID>.json
```

- `users.json`：ユーザーID、ユーザー名、ハッシュ化されたパスワード
- `users/<ユーザーID>.json`：各ユーザーのタスク
- パスワードそのものは保存されません

保存場所を変更する場合は、起動前に`CALENDO_DATA_DIR`を設定してください。

```bash
export CALENDO_DATA_DIR="/任意の保存先"
```

## API

### 認証

| Method | Endpoint | 説明 |
| --- | --- | --- |
| `POST` | `/auth/register` | ユーザー登録 |
| `POST` | `/auth/login` | ログイン |
| `POST` | `/auth/logout` | ログアウト |
| `GET` | `/auth/me` | ログイン中のユーザーを取得 |
| `POST` | `/auth/change_password` | パスワード変更 |
| `POST` | `/auth/delete_account` | アカウント削除 |

登録・ログインのリクエスト例：

```json
{
  "username": "calendo-user",
  "password": "password123"
}
```

ユーザー名は2〜30文字、パスワードは6文字以上です。

### タスク

以下のAPIはログインが必要です。

| Method | Endpoint | 説明 |
| --- | --- | --- |
| `GET` | `/tasks?date=YYYY-MM-DD` | 指定日のタスクを取得 |
| `POST` | `/add_task` | タスクを追加 |
| `POST` | `/edit_task` | タスクを編集 |
| `POST` | `/delete_task` | タスクを削除 |
| `POST` | `/check_box` | 完了状態を切り替え |
| `GET` | `/achievement_rate?date=YYYY-MM-DD` | 指定日の達成率を取得 |
| `POST` | `/week_tasks` | 1週間分のタスクを取得 |
| `GET` | `/data/export` | バックアップを書き出す |
| `POST` | `/data/import` | バックアップを復元 |

## Mac・Windows版のビルド

Mac：

```bash
./scripts/build-mac.sh
```

生成物：

```text
dist/CalenDo.app
```

Windows PowerShell：

```powershell
.\scripts\build-windows.ps1
```

生成物：

```text
dist\CalenDo.exe
```

`.app`はMac上、`.exe`はWindows上でビルドしてください。GitHub Actionsの「Build desktop apps」を手動実行すると、両OS版を自動ビルドできます。

## 現在の利用範囲

現在はローカル環境での利用を想定しています。友人など複数人が別々の端末からアクセスするには、Flaskバックエンドとフロントエンドをサーバーへ配置し、HTTPS、公開用データベース、環境変数管理などを追加する必要があります。

## 共同開発

1. `main`から作業用ブランチを作成
2. 変更をコミット
3. 自分のブランチをGitHubへプッシュ
4. `main`向けのプルリクエストを作成
5. レビュー後にマージ

```bash
git switch main
git pull
git switch -c feature/変更内容
```
