import json
import os
import secrets
import tempfile

from tasks import Task, Daily_Task


APP_DIR = os.environ.get(
    "CALENDO_DATA_DIR",
    os.path.join(os.path.expanduser("~"), ".calendo"),
)
TASKS_DIR = os.path.join(APP_DIR, "users")
SECRET_FILE = os.path.join(APP_DIR, "session.key")


def _ensure_storage():
    os.makedirs(TASKS_DIR, exist_ok=True)


def _task_file(user_id):
    # user_id はサーバーで生成した16進UUIDのみを受け取る。
    if not user_id or any(char not in "0123456789abcdef" for char in user_id):
        raise ValueError("Invalid user id")
    return os.path.join(TASKS_DIR, f"{user_id}.json")


def _write_json_atomic(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, temporary_path = tempfile.mkstemp(
        dir=os.path.dirname(path),
        prefix=".calendo-",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
        os.replace(temporary_path, path)
    except Exception:
        if os.path.exists(temporary_path):
            os.unlink(temporary_path)
        raise


def get_or_create_secret_key():
    configured_secret = os.environ.get("CALENDO_SECRET_KEY")
    if configured_secret:
        return configured_secret

    os.makedirs(APP_DIR, exist_ok=True)
    if os.path.exists(SECRET_FILE):
        with open(SECRET_FILE, "r", encoding="utf-8") as file:
            secret = file.read().strip()
            if secret:
                return secret

    secret = secrets.token_hex(32)
    fd, temporary_path = tempfile.mkstemp(
        dir=APP_DIR,
        prefix=".session-",
        suffix=".tmp",
        text=True,
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file:
            file.write(secret)
        os.chmod(temporary_path, 0o600)
        os.replace(temporary_path, SECRET_FILE)
    except Exception:
        if os.path.exists(temporary_path):
            os.unlink(temporary_path)
        raise
    return secret


def save_tasks(calendar_manager, user_id):
    _ensure_storage()
    data = {}

    for date, daily_task in calendar_manager.daily_tasks.items():
        data[date] = {"tasks": daily_task.get_tasks_data()}

    _write_json_atomic(_task_file(user_id), data)


def load_tasks(calendar_manager, user_id):
    _ensure_storage()
    file_name = _task_file(user_id)

    if not os.path.exists(file_name):
        return

    try:
        with open(file_name, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError):
        print(f"Could not read task data for user {user_id}")
        return

    for date, value in data.items():
        daily_task = Daily_Task(date)

        for task_data in value.get("tasks", []):
            task = Task(
                task_data["task_id"],
                task_data["task_name"],
                task_data["start_time"],
                task_data["end_time"],
                task_data.get("completed", False),
            )
            daily_task.tasks.append(task)

        daily_task.sort_tasks()
        calendar_manager.daily_tasks[date] = daily_task


def export_tasks(calendar_manager):
    return {
        "format": "calendo-backup",
        "version": 1,
        "tasks": {
            date: {"tasks": daily_task.get_tasks_data()}
            for date, daily_task in calendar_manager.daily_tasks.items()
        },
    }


def import_tasks(calendar_manager, backup):
    if not isinstance(backup, dict):
        raise ValueError("バックアップファイルの形式が正しくありません")
    if backup.get("format") != "calendo-backup" or backup.get("version") != 1:
        raise ValueError("対応していないバックアップ形式です")

    task_data = backup.get("tasks")
    if not isinstance(task_data, dict):
        raise ValueError("タスクデータが見つかりません")

    imported_manager = type(calendar_manager)()
    for date, value in task_data.items():
        if not isinstance(date, str) or not isinstance(value, dict):
            raise ValueError("バックアップ内の日付データが正しくありません")
        daily_task = Daily_Task(date)
        raw_tasks = value.get("tasks", [])
        if not isinstance(raw_tasks, list):
            raise ValueError("バックアップ内のタスクが正しくありません")

        for raw_task in raw_tasks:
            try:
                task = Task(
                    int(raw_task["task_id"]),
                    str(raw_task["task_name"]),
                    str(raw_task["start_time"]),
                    str(raw_task["end_time"]),
                    bool(raw_task.get("completed", False)),
                )
                # 時刻形式と順序を既存ロジックで検証する。
                if task.start_time >= task.end_time:
                    raise ValueError
                daily_task.tasks.append(task)
            except (KeyError, TypeError, ValueError):
                raise ValueError("バックアップ内に不正なタスクがあります")

        daily_task.sort_tasks()
        imported_manager.daily_tasks[date] = daily_task

    calendar_manager.daily_tasks = imported_manager.daily_tasks


def delete_tasks(user_id):
    file_name = _task_file(user_id)
    if os.path.exists(file_name):
        os.unlink(file_name)
