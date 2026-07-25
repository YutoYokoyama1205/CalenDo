import os
import socket
import sys
import threading
import webbrowser

from flask import send_from_directory
from waitress import create_server

from api import app


if getattr(sys, "frozen", False):
    FRONTEND_FOLDER = os.path.join(sys._MEIPASS, "dist")
else:
    FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), "../frontend/dist")


@app.route("/")
def serve():
    return send_from_directory(FRONTEND_FOLDER, "index.html")


@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, "assets"), filename)


@app.route("/<path:filename>")
def serve_other_files(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)


def find_available_port():
    preferred_port = int(os.environ.get("CALENDO_PORT", "5050"))
    for port in range(preferred_port, preferred_port + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            try:
                probe.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("CalenDoで使用できるポートが見つかりません")


def main():
    port = find_available_port()
    url = f"http://127.0.0.1:{port}"
    server = create_server(app, host="127.0.0.1", port=port, threads=4)
    app.config["CALENDO_SHUTDOWN"] = server.close
    threading.Timer(0.8, lambda: webbrowser.open_new(url)).start()
    print(f"CalenDo is running at {url}")
    try:
        server.run()
    except KeyboardInterrupt:
        server.close()
    except OSError as error:
        # 設定画面からserver.close()を呼んだ場合、Waitressのpoll中に
        # クローズ済みソケットが通知されることがある。
        if error.errno != 9:
            raise


if __name__ == "__main__":
    main()
