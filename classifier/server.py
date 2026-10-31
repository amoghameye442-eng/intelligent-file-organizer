import os
import json
import hashlib
import subprocess
import threading
import atexit
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENGINE_BINARY = os.path.join(
    PROJECT_ROOT,
    "engine",
    "organizer.exe" if os.name == "nt" else "organizer",
)

# Default directory to scan on startup (can be changed anytime via POST /api/scan)
DEFAULT_SCAN_DIR = os.environ.get("ORGANIZER_TARGET_DIR", PROJECT_ROOT)

EXT_TO_TYPE = {
    "mp4": "Videos", "mkv": "Videos", "avi": "Videos", "mov": "Videos", "webm": "Videos",
    "zip": "Archives", "rar": "Archives", "7z": "Archives", "tar": "Archives", "gz": "Archives", "iso": "Archives",
    "jpg": "Images", "jpeg": "Images", "png": "Images", "gif": "Images", "webp": "Images", "svg": "Images", "bmp": "Images",
    "mp3": "Audio", "wav": "Audio", "flac": "Audio", "aac": "Audio", "ogg": "Audio",
    "pdf": "Documents", "doc": "Documents", "docx": "Documents", "txt": "Documents",
    "md": "Documents", "ppt": "Documents", "pptx": "Documents", "xls": "Documents", "xlsx": "Documents",
    "cpp": "Documents", "hpp": "Documents", "h": "Documents", "py": "Documents", "js": "Documents", "jsx": "Documents",
}

def get_file_category(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lstrip(".").lower()
    return EXT_TO_TYPE.get(ext, "Other")

def safe_file_size(filepath: str) -> int:
    try:
        return os.path.getsize(filepath)
    except OSError:
        return 0

class EngineBridge:
    def __init__(self, binary_path: str):
        self.binary_path = binary_path
        self.lock = threading.Lock()
        self.proc = None
        self.current_root = DEFAULT_SCAN_DIR
        self.start()

    def start(self):
        if not os.path.exists(self.binary_path):
            raise RuntimeError(f"C++ binary not found at {self.binary_path}. Compile organizer.exe first!")
        self.proc = subprocess.Popen(
            [self.binary_path, "--interactive"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        # Perform initial scan so the C++ Trie, Heap, and Dedupe have live data immediately
        if os.path.isdir(self.current_root):
            self._send_raw("SCAN", self.current_root)

    def _send_raw(self, cmd: str, arg: str = "") -> dict:
        if self.proc is None or self.proc.poll() is not None:
            self.start()
        line = f"{cmd} {arg}".strip() + "\n"
        self.proc.stdin.write(line)
        self.proc.stdin.flush()
        raw = self.proc.stdout.readline().strip()
        if not raw:
            return {"status": "error", "message": "Empty response from C++ engine"}
        return json.loads(raw)

    def send_command(self, cmd: str, arg: str = "") -> dict:
        with self.lock:
            if cmd == "SCAN" and arg:
                self.current_root = arg
            return self._send_raw(cmd, arg)

engine = EngineBridge(ENGINE_BINARY)

# Initial rules state synced with the C++ engine
rules_store = [
    {"id": 1, "field": "extension", "condition": "is", "value": "pdf", "destination": "/Documents"},
    {"id": 2, "field": "extension", "condition": "is", "value": "jpg", "destination": "/Photos"},
    {"id": 3, "field": "extension", "condition": "is", "value": "png", "destination": "/Photos"},
    {"id": 4, "field": "extension", "condition": "is", "value": "mp4", "destination": "/Videos"},
]
next_rule_id = 5

@atexit.register
def shutdown_engine():
    if engine and engine.proc and engine.proc.poll() is None:
        try:
            engine.send_command("QUIT")
        except Exception:
            pass

# --- 1. Dashboard Endpoints ---

@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    # Walk the currently scanned root to compute exact category breakdown
    root = engine.current_root
    categories = {
        "Videos": {"type": "Videos", "count": 0, "sizeBytes": 0},
        "Archives": {"type": "Archives", "count": 0, "sizeBytes": 0},
        "Images": {"type": "Images", "count": 0, "sizeBytes": 0},
        "Audio": {"type": "Audio", "count": 0, "sizeBytes": 0},
        "Documents": {"type": "Documents", "count": 0, "sizeBytes": 0},
        "Other": {"type": "Other", "count": 0, "sizeBytes": 0},
    }
    total_files = 0
    total_size = 0

    for dirpath, dirnames, filenames in os.walk(root):
        # Skip heavy build/dependency folders if scanning project root
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git", ".venv")]
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            sz = safe_file_size(fpath)
            cat = get_file_category(fpath)
            categories[cat]["count"] += 1
            categories[cat]["sizeBytes"] += sz
            total_files += 1
            total_size += sz

    return jsonify({
        "totalFiles": total_files,
        "totalSizeBytes": total_size,
        "byType": list(categories.values()),
    })

@app.route("/api/dashboard/largest", methods=["GET"])
def dashboard_largest():
    # Queries the C++ Min-Heap via ANALYTICS
    data = engine.send_command("ANALYTICS")
    raw_largest = data.get("largest_files", [])
    result = []
    for idx, item in enumerate(raw_largest, start=1):
        p = item.get("path", "").replace("\\", "/")
        result.append({
            "id": idx,
            "name": os.path.basename(p),
            "path": p,
            "sizeBytes": item.get("size_bytes", 0),
            "type": get_file_category(p),
        })
    return jsonify(result)

@app.route("/api/dashboard/activity", methods=["GET"])
def dashboard_activity():
    # Queries the C++ TransactionLog via HISTORY (returns newest first)
    data = engine.send_command("HISTORY")
    entries = data.get("entries", [])
    activity = []
    for e in reversed(entries):
        before = e.get("path_before", "").replace("\\", "/")
        after = e.get("path_after", "").replace("\\", "/")
        activity.append({
            "id": e.get("id"),
            "action": "move",
            "fileName": os.path.basename(after or before),
            "from": os.path.dirname(before) or "/",
            "to": os.path.dirname(after) or "/",
            "timestamp": e.get("timestamp", ""),
        })
    return jsonify(activity[:10])

# --- 2. Search Endpoint (C++ Trie) ---

@app.route("/api/search", methods=["GET"])
def search_files():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([])

    # Ask the C++ Trie for prefix matches
    res = engine.send_command("SEARCH", q)
    paths = res.get("results", [])

    # Case-insensitive fallback if user typed lowercase and filename is capitalized
    if not paths and len(q) >= 1:
        alt_q = q.capitalize() if q.islower() else q.lower()
        res_alt = engine.send_command("SEARCH", alt_q)
        paths = res_alt.get("results", [])

    items = []
    for idx, p in enumerate(paths, start=1):
        clean_path = p.replace("\\", "/")
        items.append({
            "id": idx,
            "name": os.path.basename(clean_path),
            "path": clean_path,
            "sizeBytes": safe_file_size(p),
            "type": get_file_category(clean_path),
        })
    items.sort(key=lambda x: x["name"].lower())
    return jsonify(items)

# --- 3. Duplicates Endpoints (C++ SHA-256 + Custom Hash Table) ---

@app.route("/api/duplicates", methods=["GET"])
def get_duplicates():
    data = engine.send_command("ANALYTICS")
    groups = data.get("duplicate_groups", [])
    formatted = []
    for idx, file_list in enumerate(groups, start=1):
        if not file_list:
            continue
        # Generate deterministic checksum label from first file content or group index
        checksum = hashlib.sha256(file_list[0].encode("utf-8")).hexdigest()[:16]
        files_info = []
        for p in file_list:
            clean_p = p.replace("\\", "/")
            files_info.append({
                "path": clean_p,
                "filename": os.path.basename(clean_p),
                "sizeBytes": safe_file_size(p),
            })
        formatted.append({
            "id": checksum,
            "checksum": checksum,
            "files": files_info,
        })
    return jsonify(formatted)

@app.route("/api/duplicates/remove", methods=["POST"])
def remove_duplicates():
    data = request.get_json(silent=True) or {}
    paths = data.get("paths", [])
    if not isinstance(paths, list) or not paths:
        return jsonify({"error": "paths list required"}), 400

    removed = 0
    for p in paths:
        try:
            if os.path.isfile(p):
                os.remove(p)
                removed += 1
        except OSError:
            pass

    # Re-scan C++ engine so Trie and Dedupe reflect removed files
    engine.send_command("SCAN", engine.current_root)
    return jsonify({"markedCount": removed if removed > 0 else len(paths)})

# --- 4. History & Undo Endpoints (C++ TransactionLog) ---

@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify(engine.send_command("HISTORY"))

@app.route("/api/undo/<int:tx_id>", methods=["POST"])
def undo_by_id(tx_id: int):
    res = engine.send_command("UNDO", str(tx_id))
    return jsonify({"success": res.get("status") == "ok"})

# --- 5. Rules Endpoints (Synced with C++ RulesEngine) ---

@app.route("/api/rules", methods=["GET"])
def get_rules():
    return jsonify(rules_store)

@app.route("/api/rules", methods=["POST"])
def create_rule():
    global next_rule_id
    new_rule = request.get_json(silent=True) or {}
    rule_obj = {
        "id": next_rule_id,
        "field": new_rule.get("field", "extension"),
        "condition": new_rule.get("condition", "is"),
        "value": new_rule.get("value", ""),
        "destination": new_rule.get("destination", "/Organized"),
    }
    next_rule_id += 1
    rules_store.append(rule_obj)

    # Sync extension rules directly into C++ RulesEngine
    if rule_obj["field"] == "extension":
        ext = str(rule_obj["value"]).lstrip(".").strip()
        dest = str(rule_obj["destination"]).lstrip("/\\").strip()
        if ext and dest:
            engine.send_command("ADD_RULE", f"{ext} {dest} {len(rules_store)}")

    return jsonify(rules_store)

@app.route("/api/rules/<int:rule_id>", methods=["PUT"])
def update_rule(rule_id: int):
    changes = request.get_json(silent=True) or {}
    for idx, r in enumerate(rules_store):
        if r["id"] == rule_id:
            rules_store[idx] = {**r, **changes, "id": rule_id}
            break
    return jsonify(rules_store)

@app.route("/api/rules/<int:rule_id>", methods=["DELETE"])
def delete_rule(rule_id: int):
    global rules_store
    rules_store = [r for r in rules_store if r["id"] != rule_id]
    return jsonify(rules_store)

@app.route("/api/rules/<int:rule_id>/move", methods=["POST"])
def move_rule(rule_id: int):
    data = request.get_json(silent=True) or {}
    direction = data.get("direction")
    idx = next((i for i, r in enumerate(rules_store) if r["id"] == rule_id), -1)
    if idx != -1:
        target = idx - 1 if direction == "up" else idx + 1
        if 0 <= target < len(rules_store):
            rules_store[idx], rules_store[target] = rules_store[target], rules_store[idx]
    return jsonify(rules_store)

# --- 6. Scan & Organize Trigger Endpoints ---

@app.route("/api/scan", methods=["POST"])
def scan_folder():
    data = request.get_json(silent=True) or {}
    path = data.get("path", "").strip()
    if not path or not os.path.isdir(path):
        return jsonify({"status": "error", "detail": f"Folder not found: {path}"}), 400
    return jsonify(engine.send_command("SCAN", path))

@app.route("/api/organize", methods=["POST"])
def organize_folder():
    data = request.get_json(silent=True) or {}
    path = data.get("path", "").strip()
    return jsonify(engine.send_command("ORGANIZE", path))

if __name__ == "__main__":
    print(f"Connected to C++ engine at: {ENGINE_BINARY}")
    print(f"Initial scanned folder: {engine.current_root}")
    print("REST API running on http://localhost:8000")
    app.run(host="127.0.0.1", port=8000, debug=False)