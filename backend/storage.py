import json
import os

from tasks import Task, Daily_Task

# OSのユーザーディレクトリ内に専用の保存フォルダを作成
USER_DIR = os.path.expanduser("~")
APP_DIR = os.path.join(USER_DIR, ".calendo")

if not os.path.exists(APP_DIR):
    os.makedirs(APP_DIR)

FILE_NAME = os.path.join(APP_DIR, "tasks.json")

# JSON保存
def save_tasks(calendar_manager):

    data = {}

    for date, daily_task in calendar_manager.daily_tasks.items():

        data[date] = {
            "tasks": daily_task.get_tasks_data()
        }

    with open(
        FILE_NAME,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=4
        )


# JSON読み込み
def load_tasks(calendar_manager):

    if not os.path.exists(FILE_NAME):
        return

    try:

        with open(
            FILE_NAME,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

    except json.JSONDecodeError:

        print("tasks.json is broken")
        return

    for date, value in data.items():

        daily_task = Daily_Task(date)

        for task_data in value["tasks"]:

            task = Task(
                task_data["task_id"],
                task_data["task_name"],
                task_data["start_time"],
                task_data["end_time"],
                task_data["completed"]
            )

            daily_task.tasks.append(task)

        daily_task.sort_tasks()

        calendar_manager.daily_tasks[date] = daily_task