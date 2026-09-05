#pragma once
#include <string>
#include <vector>

enum class ActionType { MOVE, RENAME, DELETE };

struct LogEntry {
    int id;
    ActionType action;
    std::string path_before;
    std::string path_after;   // for DELETE, this is the trash location
    std::string timestamp;
    bool undone = false;
};

class TransactionLog {
public:
    explicit TransactionLog(const std::string& log_file_path);

    // Record an action and persist it to disk immediately.
    int record(ActionType action, const std::string& path_before, const std::string& path_after);

    // Reverse a specific action by id. Returns false if the id doesn't
    // exist or was already undone.
    bool undo(int id);

    // All entries currently in the log (most recent last).
    const std::vector<LogEntry>& entries() const { return log; }

    // Load existing entries from disk (called automatically by the
    // constructor, exposed here in case a caller wants to reload).
    void load();

private:
    std::string file_path;
    std::vector<LogEntry> log;
    int next_id = 1;

    void persist();  // rewrite the whole log file from `log`
    static std::string action_to_string(ActionType a);
    static ActionType string_to_action(const std::string& s);
};