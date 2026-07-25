import json
import os
import tempfile

from tasks import Task, Daily_Task


APP_DIR = os.environ.get(
    "CALENDO_DATA_DIR",
    os.path.join(os.path.expanduser("~"), ".calendo"),
)
TASKS_DIR = os.path.join(APP_DIR, "users")


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
