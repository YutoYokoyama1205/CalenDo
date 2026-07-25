import json
import os
import threading
import uuid
from functools import wraps

from flask import jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from storage import APP_DIR, _write_json_atomic, delete_tasks


USERS_FILE = os.path.join(APP_DIR, "users.json")
users_lock = threading.Lock()


def _load_users():
    if not os.path.exists(USERS_FILE):
        return []

    try:
        with open(USERS_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _public_user(user):
    return {"id": user["id"], "username": user["username"]}


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return next((user for user in _load_users() if user["id"] == user_id), None)


def login_required(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "ログインが必要です"}), 401
        return handler(user, *args, **kwargs)

    return wrapped


def register_auth_routes(app, on_account_deleted=None):
    @app.post("/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", ""))

        if len(username) < 2 or len(username) > 30:
            return jsonify({"error": "ユーザー名は2〜30文字で入力してください"}), 400
        if len(password) < 6:
            return jsonify({"error": "パスワードは6文字以上にしてください"}), 400

        with users_lock:
            users = _load_users()
            if any(user["username"].casefold() == username.casefold() for user in users):
                return jsonify({"error": "そのユーザー名は既に使われています"}), 409

            user = {
                "id": uuid.uuid4().hex,
                "username": username,
                "password_hash": generate_password_hash(password),
            }
            users.append(user)
            _write_json_atomic(USERS_FILE, users)

        session.clear()
        session["user_id"] = user["id"]
        return jsonify({"user": _public_user(user)}), 201

    @app.post("/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", ""))

        user = next(
            (
                item
                for item in _load_users()
                if item["username"].casefold() == username.casefold()
            ),
            None,
        )
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "ユーザー名またはパスワードが違います"}), 401

        session.clear()
        session["user_id"] = user["id"]
        return jsonify({"user": _public_user(user)})

    @app.post("/auth/logout")
    def logout():
        session.clear()
        return jsonify({"message": "ログアウトしました"})

    @app.get("/auth/me")
    def me():
        user = current_user()
        if not user:
            return jsonify({"user": None}), 401
        return jsonify({"user": _public_user(user)})

    @app.post("/auth/change_password")
    @login_required
    def change_password(user):
        data = request.get_json(silent=True) or {}
        current_password = str(data.get("current_password", ""))
        new_password = str(data.get("new_password", ""))

        if not check_password_hash(user["password_hash"], current_password):
            return jsonify({"error": "現在のパスワードが違います"}), 401
        if len(new_password) < 6:
            return jsonify({"error": "新しいパスワードは6文字以上にしてください"}), 400

        with users_lock:
            users = _load_users()
            target = next((item for item in users if item["id"] == user["id"]), None)
            if not target:
                return jsonify({"error": "ユーザーが見つかりません"}), 404
            target["password_hash"] = generate_password_hash(new_password)
            _write_json_atomic(USERS_FILE, users)

        return jsonify({"message": "パスワードを変更しました"})

    @app.post("/auth/delete_account")
    @login_required
    def delete_account(user):
        data = request.get_json(silent=True) or {}
        password = str(data.get("password", ""))
        if not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "パスワードが違います"}), 401

        with users_lock:
            users = _load_users()
            remaining_users = [item for item in users if item["id"] != user["id"]]
            _write_json_atomic(USERS_FILE, remaining_users)
            delete_tasks(user["id"])

        if on_account_deleted:
            on_account_deleted(user["id"])
        session.clear()
        return jsonify({"message": "アカウントとタスクを削除しました"})
