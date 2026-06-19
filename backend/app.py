from flask import Flask, send_from_directory
from api import app
import os
import sys
import webbrowser
import threading

# PyInstallerで実行ファイル化された場合のパス解決
if getattr(sys, 'frozen', False):
    FRONTEND_FOLDER = os.path.join(sys._MEIPASS, "dist")
else:
    FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# ① ルート（http://127.0.0.1:5000/）にアクセスしたときにindex.htmlを返す
@app.route("/")
def serve():
    return send_from_directory(FRONTEND_FOLDER, "index.html")

# ② /assets/～ のJavaScriptやCSSファイルを返すための設定
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, "assets"), filename)

# ③ /favicon.svg などの直下にあるその他のファイルを返すための設定
@app.route("/<path:filename>")
def serve_other_files(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

def open_browser():
    # 起動時に自動でブラウザを開く
    webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == "__main__":
    # サーバー起動の1秒後にブラウザを開く
    threading.Timer(1.0, open_browser).start()
    app.run(host="0.0.0.0", port=5000, debug=False)