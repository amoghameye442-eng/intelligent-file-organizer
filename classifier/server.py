import os
import json
import subprocess
import threading
import atexit
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Allow Sampan's React + Vite dev server (port 5173) to call the API
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}})

ENGINE_BINARY = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "engine",
        "organizer.exe" if os.name == "nt" else "organizer",
    )
)

class EngineBridge:
    def __init__(self, binary_path: str):
        self.binary_path = binary_path
        self.lock = threading.Lock()
        self.proc = None
        self.start()

    def start(self):
        if not os.path.exists(self.binary_path):
            raise RuntimeError(
                f"C++ binary not found at {self.binary_path}. Compile organizer.exe first!"
            )
        self.proc = subprocess.Popen(
            [self.binary_path, "--interactive"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

    def send_command(self, cmd: str, arg: str = "") -> dict:
        with self.lock:
            if self.proc is None or self.proc.poll() is not None:
                self.start()

            line = f"{cmd} {arg}".strip() + "\n"
            self.proc.stdin.write(line)
            self.proc.stdin.flush()

            raw = self.proc.stdout.readline().strip()
            if not raw:
                return {"status": "error", "message": "Empty response from C++ engine"}
            return json.loads(raw)

engine = EngineBridge(ENGINE_BINARY)

@atexit.register
def shutdown_engine():
    if engine and engine.proc and engine.proc.poll() is None:
        try:
            engine.send_command("QUIT")
        except Exception:
            pass

# --- Health Check ---
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "engine_binary": ENGINE_BINARY})

# --- REST Endpoints ---

@app.route("/api/scan", methods=["POST"])
def scan_directory():
    data = request.get_json(silent=True) or {}
    path = data.get("path", "").strip()
    if not path or not os.path.isdir(path):
        return jsonify({"status": "error", "detail": f"Folder not found: {path}"}), 400
    return jsonify(engine.send_command("SCAN", path))

@app.route("/api/search", methods=["GET"])
def search_prefix():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"status": "ok", "query": "", "results": []})
    return jsonify(engine.send_command("SEARCH", q))

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    return jsonify(engine.send_command("ANALYTICS"))

@app.route("/api/organize", methods=["POST"])
def organize_files():
    data = request.get_json(silent=True) or {}
    path = data.get("path", "").strip()
    return jsonify(engine.send_command("ORGANIZE", path))

@app.route("/api/history", methods=["GET"])
def get_undo_history():
    return jsonify(engine.send_command("HISTORY"))

@app.route("/api/undo", methods=["POST"])
def undo_action():
    data = request.get_json(silent=True) or {}
    tx_id = data.get("id")
    arg = str(tx_id) if tx_id is not None else ""
    return jsonify(engine.send_command("UNDO", arg))

@app.route("/api/rules", methods=["POST"])
def add_sorting_rule():
    data = request.get_json(silent=True) or {}
    ext = data.get("extension", "").lstrip(".").strip()
    dest = data.get("destination", "").strip()
    priority = data.get("priority", 1)
    if not ext or not dest:
        return jsonify({"status": "error", "detail": "extension and destination required"}), 400
    return jsonify(engine.send_command("ADD_RULE", f"{ext} {dest} {priority}"))

if __name__ == "__main__":
    print(f"Connected to C++ engine at: {ENGINE_BINARY}")
    print("REST API running on http://localhost:8000")
    app.run(host="127.0.0.1", port=8000, debug=False)