import os
import threading
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

from auth import login_required, register_auth_routes
from storage import (
    export_tasks,
    get_or_create_secret_key,
    import_tasks,
    load_tasks,
    save_tasks,
)
from tasks import CalendarManager


app = Flask(__name__)
app.config.update(
    SECRET_KEY=get_or_create_secret_key(),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
calendar_managers = {}
manager_lock = threading.RLock()


def remove_calendar_manager(user_id):
    with manager_lock:
        calendar_managers.pop(user_id, None)


CORS(
    app,
    supports_credentials=True,
    origins=["http://127.0.0.1:5173", "http://localhost:5173"],
)
register_auth_routes(app, on_account_deleted=remove_calendar_manager)


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
    with manager_lock:
        date = request.args.get("date")
        daily_task = get_calendar_manager(user["id"]).get_daily_task(date)
        return jsonify(daily_task.get_tasks_data())


@app.post("/add_task")
@login_required
def add_task(user):
    try:
        data = request.get_json() or {}
        with manager_lock:
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
    try:
        data = request.get_json() or {}
        with manager_lock:
            manager = get_calendar_manager(user["id"])
            manager.get_daily_task(data["date"]).delete_task(data["task_id"])
            save_tasks(manager, user["id"])
        return jsonify({"message": "Task deleted"})
    except (KeyError, TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400


@app.post("/edit_task")
@login_required
def edit_task(user):
    try:
        data = request.get_json() or {}
        with manager_lock:
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
    try:
        data = request.get_json() or {}
        with manager_lock:
            manager = get_calendar_manager(user["id"])
            manager.get_daily_task(data["date"]).check_box(data["task_id"])
            save_tasks(manager, user["id"])
        return jsonify({"message": "Checkbox updated"})
    except (KeyError, TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400


@app.get("/achievement_rate")
@login_required
def achievement_rate(user):
    with manager_lock:
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
    with manager_lock:
        return jsonify(
            get_calendar_manager(user["id"]).get_week_tasks(data.get("dates", []))
        )


@app.get("/data/export")
@login_required
def export_user_data(user):
    with manager_lock:
        backup = export_tasks(get_calendar_manager(user["id"]))
    backup["exported_at"] = datetime.now().astimezone().isoformat()
    backup["username"] = user["username"]
    return jsonify(backup)


@app.post("/data/import")
@login_required
def import_user_data(user):
    try:
        backup = request.get_json(force=True)
        with manager_lock:
            manager = get_calendar_manager(user["id"])
            import_tasks(manager, backup)
            save_tasks(manager, user["id"])
        return jsonify({"message": "バックアップを復元しました"})
    except (TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400


@app.post("/app/shutdown")
def shutdown_app():
    if request.remote_addr not in {"127.0.0.1", "::1"}:
        return jsonify({"error": "この操作はローカルからのみ実行できます"}), 403
    shutdown = app.config.get("CALENDO_SHUTDOWN")
    if not shutdown:
        return jsonify({"error": "終了処理を利用できません"}), 503
    threading.Timer(0.25, shutdown).start()
    return jsonify({"message": "CalenDoを終了します"})
