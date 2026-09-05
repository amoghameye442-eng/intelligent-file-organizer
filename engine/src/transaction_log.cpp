
#include "transaction_log.hpp"
#include <fstream>
#include <sstream>
#include <cstdio>
#include <ctime>

// Portable rename: returns true on success. Uses the C standard library's
// rename() instead of std::filesystem::rename, so this compiles even on
// older compilers that predate full C++17 filesystem support.
static bool portable_rename(const std::string& from, const std::string& to) {
    return std::rename(from.c_str(), to.c_str()) == 0;
}

std::string TransactionLog::action_to_string(ActionType a) {
    switch (a) {
        case ActionType::MOVE: return "MOVE";
        case ActionType::RENAME: return "RENAME";
        case ActionType::DELETE: return "DELETE";
    }
    return "UNKNOWN";
}

ActionType TransactionLog::string_to_action(const std::string& s) {
    if (s == "MOVE") return ActionType::MOVE;
    if (s == "RENAME") return ActionType::RENAME;
    return ActionType::DELETE;
}

TransactionLog::TransactionLog(const std::string& log_file_path) : file_path(log_file_path) {
    load();
}

static std::string current_timestamp() {
    std::time_t t = std::time(nullptr);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&t));
    return std::string(buf);
}

int TransactionLog::record(ActionType action, const std::string& path_before, const std::string& path_after) {
    LogEntry entry{next_id++, action, path_before, path_after, current_timestamp(), false};
    log.push_back(entry);
    persist();
    return entry.id;
}

bool TransactionLog::undo(int id) {
    for (auto& entry : log) {
        if (entry.id != id || entry.undone) continue;

        bool success = false;
        switch (entry.action) {
            case ActionType::MOVE:
            case ActionType::RENAME:
                // Reverse direction: move/rename it back to where it was.
                success = portable_rename(entry.path_after, entry.path_before);
                break;
            case ActionType::DELETE:
                // "Delete" was really a move to trash — undo = move it back.
                success = portable_rename(entry.path_after, entry.path_before);
                break;
        }

        if (!success) return false;  // filesystem operation failed, leave state as-is

        entry.undone = true;
        persist();
        return true;
    }
    return false;  // id not found or already undone
}

// Log file format: one entry per line, pipe-delimited.
// id|action|path_before|path_after|timestamp|undone
void TransactionLog::persist() {
    std::ofstream out(file_path, std::ios::trunc);
    for (const auto& e : log) {
        out << e.id << "|" << action_to_string(e.action) << "|"
            << e.path_before << "|" << e.path_after << "|"
            << e.timestamp << "|" << (e.undone ? "1" : "0") << "\n";
    }
}

static std::vector<std::string> split_pipe(const std::string& line) {
    std::vector<std::string> parts;
    std::stringstream ss(line);
    std::string field;
    while (std::getline(ss, field, '|')) {
        parts.push_back(field);
    }
    return parts;
}

void TransactionLog::load() {
    log.clear();
    std::ifstream in(file_path);
    if (!in) return;  // no existing log yet — that's fine, start empty

    std::string line;
    int max_id = 0;
    while (std::getline(in, line)) {
        if (line.empty()) continue;
        auto parts = split_pipe(line);
        if (parts.size() != 6) continue;  // skip malformed lines defensively

        LogEntry e;
        e.id = std::stoi(parts[0]);
        e.action = string_to_action(parts[1]);
        e.path_before = parts[2];
        e.path_after = parts[3];
        e.timestamp = parts[4];
        e.undone = (parts[5] == "1");
        log.push_back(e);
        max_id = std::max(max_id, e.id);
    }
    next_id = max_id + 1;
}