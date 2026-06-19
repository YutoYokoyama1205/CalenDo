from flask import Flask, request, jsonify
from flask_cors import CORS

from tasks import CalendarManager
from storage import save_tasks, load_tasks


app = Flask(__name__)

# React接続用
CORS(app)

calendar_manager = CalendarManager()

# 起動時読み込み
load_tasks(calendar_manager)


# タスク一覧取得
@app.route("/tasks", methods=["GET"])
def get_tasks():

    date = request.args.get("date")

    daily_task = calendar_manager.get_daily_task(date)

    return jsonify(
        daily_task.get_tasks_data()
    )


# タスク追加
@app.route("/add_task", methods=["POST"])
def add_task():

    try:

        data = request.json

        date = data["date"]

        daily_task = calendar_manager.get_daily_task(date)

        daily_task.add_task(
            data["task_name"],
            data["start_time"],
            data["end_time"]
        )

        save_tasks(calendar_manager)

        return jsonify({
            "message": "Task added"
        })

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 400


# タスク削除
@app.route("/delete_task", methods=["POST"])
def delete_task():

    data = request.json

    date = data["date"]

    daily_task = calendar_manager.get_daily_task(date)

    daily_task.delete_task(
        data["task_id"]
    )

    save_tasks(calendar_manager)

    return jsonify({
        "message": "Task deleted"
    })


# タスク編集
@app.route("/edit_task", methods=["POST"])
def edit_task():

    try:

        data = request.json

        date = data["date"]

        daily_task = calendar_manager.get_daily_task(date)

        daily_task.edit_task(
            data["task_id"],
            data["task_name"],
            data["start_time"],
            data["end_time"]
        )

        save_tasks(calendar_manager)

        return jsonify({
            "message": "Task edited"
        })

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 400


# チェックボックス更新
@app.route("/check_box", methods=["POST"])
def check_box():

    data = request.json

    date = data["date"]

    daily_task = calendar_manager.get_daily_task(date)

    daily_task.check_box(
        data["task_id"]
    )

    save_tasks(calendar_manager)

    return jsonify({
        "message": "Checkbox updated"
    })


# 達成率取得
@app.route("/achievement_rate", methods=["GET"])
def achievement_rate():

    date = request.args.get("date")

    daily_task = calendar_manager.get_daily_task(date)

    return jsonify({

        "achievement_rate":
            daily_task.achievement_rate(),

        "completed_task":
            daily_task.completed_count(),

        "uncompleted_task":
            daily_task.uncompleted_count(),

        "total_task":
            daily_task.count_task()
    })


# 週データ取得
@app.route("/week_tasks", methods=["POST"])
def week_tasks():

    data = request.json

    dates = data["dates"]

    return jsonify(
        calendar_manager.get_week_tasks(dates)
    )