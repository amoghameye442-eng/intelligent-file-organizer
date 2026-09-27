#pragma once
#include <string>
#include <vector>

enum class ActionType { MOVE, RENAME, DELETE_ACTION };

struct LogEntry {
    int id;
    ActionType action;
    std::string path_before;
    std::string path_after;
    std::string timestamp;
    bool undone = false;
};

class TransactionLog {
public:
    explicit TransactionLog(const std::string& log_file_path);
    int record(ActionType action, const std::string& path_before, const std::string& path_after);
    bool undo(int id);
    const std::vector<LogEntry>& entries() const { return log; }
    void load();

private:
    std::string file_path;
    std::vector<LogEntry> log;
    int next_id = 1;
    void persist();
    static std::string action_to_string(ActionType a);
    static ActionType string_to_action(const std::string& s);
};