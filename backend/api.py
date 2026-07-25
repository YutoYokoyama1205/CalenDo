import os
import secrets
import threading

from flask import Flask, jsonify, request
from flask_cors import CORS

from auth import login_required, register_auth_routes
from storage import load_tasks, save_tasks
from tasks import CalendarManager


app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get("CALENDO_SECRET_KEY", secrets.token_hex(32)),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
CORS(app, supports_credentials=True)
register_auth_routes(app)

calendar_managers = {}
manager_lock = threading.Lock()


def get_calendar_manager(user_id):
    with manager_lock:
        if user_id not in calendar_managers:
            manager = CalendarManager()
            load_tasks(manager, user_id)
            calendar_managers[user_id] = manager
        return calendar_managers[user_id]


@app.get("/tasks")
@login_required
def get_tasks(user):
    date = request.args.get("date")
    daily_task = get_calendar_manager(user["id"]).get_daily_task(date)
    return jsonify(daily_task.get_tasks_data())


@app.post("/add_task")
@login_required
def add_task(user):
    try:
        data = request.get_json() or {}
        manager = get_calendar_manager(user["id"])
        daily_task = manager.get_daily_task(data["date"])
        daily_task.add_task(
            data["task_name"],
            data["start_time"],
            data["end_time"],
        )
        save_tasks(manager, user["id"])
        return jsonify({"message": "Task added"})
    except (KeyError, TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400


@app.post("/delete_task")
@login_required
def delete_task(user):
    data = request.get_json() or {}
    manager = get_calendar_manager(user["id"])
    manager.get_daily_task(data["date"]).delete_task(data["task_id"])
    save_tasks(manager, user["id"])
    return jsonify({"message": "Task deleted"})


@app.post("/edit_task")
@login_required
def edit_task(user):
    try:
        data = request.get_json() or {}
        manager = get_calendar_manager(user["id"])
        manager.get_daily_task(data["date"]).edit_task(
            data["task_id"],
            data["task_name"],
            data["start_time"],
            data["end_time"],
        )
        save_tasks(manager, user["id"])
        return jsonify({"message": "Task edited"})
    except (KeyError, TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400


@app.post("/check_box")
@login_required
def check_box(user):
    data = request.get_json() or {}
    manager = get_calendar_manager(user["id"])
    manager.get_daily_task(data["date"]).check_box(data["task_id"])
    save_tasks(manager, user["id"])
    return jsonify({"message": "Checkbox updated"})


@app.get("/achievement_rate")
@login_required
def achievement_rate(user):
    daily_task = get_calendar_manager(user["id"]).get_daily_task(
        request.args.get("date")
    )
    return jsonify(
        {
            "achievement_rate": daily_task.achievement_rate(),
            "completed_task": daily_task.completed_count(),
            "uncompleted_task": daily_task.uncompleted_count(),
            "total_task": daily_task.count_task(),
        }
    )


@app.post("/week_tasks")
@login_required
def week_tasks(user):
    data = request.get_json() or {}
    return jsonify(
        get_calendar_manager(user["id"]).get_week_tasks(data.get("dates", []))
    )
