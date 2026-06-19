# CalenDo Backend

1週間表示型 To Do アプリ「CalenDo」のバックエンドです。

## 使用技術

- Python
- Flask
- JSON
- React（フロントエンド）

---

# 起動方法

## 1. ライブラリインストール

```bash
pip install -r requirements.txt
```

---

## 2. サーバー起動

```bash
python app.py
```

起動後：

```text
http://127.0.0.1:5000
```

でアクセスできます。

---

# API一覧

## タスク一覧取得

### GET

```text
/tasks?date=2026-05-18
```

### レスポンス例

```json
[
    {
        "task_id": 1,
        "task_name": "数学",
        "start_time": "10:00",
        "end_time": "11:00",
        "completed": false
    }
]
```

---

# タスク追加

## POST

```text
/add_task
```

## リクエスト例

```json
{
    "date": "2026-05-18",
    "task_name": "英語",
    "start_time": "13:00",
    "end_time": "14:00"
}
```

---

# タスク削除

## POST

```text
/delete_task
```

## リクエスト例

```json
{
    "date": "2026-05-18",
    "task_id": 1
}
```

---

# タスク編集

## POST

```text
/edit_task
```

## リクエスト例

```json
{
    "date": "2026-05-18",
    "task_id": 1,
    "task_name": "数学演習",
    "start_time": "09:00",
    "end_time": "10:00"
}
```

---

# チェックボックス更新

## POST

```text
/check_box
```

## リクエスト例

```json
{
    "date": "2026-05-18",
    "task_id": 1
}
```

---

# 達成率取得

## GET

```text
/achievement_rate?date=2026-05-18
```

---

# 週データ取得

## POST

```text
/week_tasks
```

## リクエスト例

```json
{
    "dates": [
        "2026-05-18",
        "2026-05-19",
        "2026-05-20",
        "2026-05-21",
        "2026-05-22",
        "2026-05-23",
        "2026-05-24"
    ]
}
```

---

# データ保存

タスクデータは：

```text
tasks.json
```

へ自動保存されます。

---

# ディレクトリ構成

```text
backend/

├── app.py
├── api.py
├── tasks.py
├── storage.py
├── tasks.json
├── requirements.txt
└── README.md
```