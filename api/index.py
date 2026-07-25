import importlib.util
import os
import sys


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

spec = importlib.util.spec_from_file_location(
    "calendo_backend",
    os.path.join(BACKEND_DIR, "api.py"),
)
backend_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend_module)
flask_app = backend_module.app


class StripApiPrefix:
    def __init__(self, wrapped_app):
        self.wrapped_app = wrapped_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if path == "/api":
            environ["PATH_INFO"] = "/"
        elif path.startswith("/api/"):
            environ["PATH_INFO"] = path[4:]
        return self.wrapped_app(environ, start_response)


flask_app.wsgi_app = StripApiPrefix(flask_app.wsgi_app)
app = flask_app
