#include "scanner.hpp"
#include "trie.hpp"
#include "dedupe.hpp"
#include "heap.hpp"
#include "rules_engine.hpp"
#include "transaction_log.hpp"
#include <iostream>
#include <sstream>
#include <cstdio>
#include <cstdlib>
#include <memory>
#include <direct.h>

// Automatically deduces the exact vector type returned by scan_directory()
using FileList = decltype(scan_directory(""));

// Creates every folder along `path`, one segment at a time, so nested
// destinations like "root/Documents" work even if neither exists yet.
static void make_dirs_recursive(const std::string& path) {
    std::string accumulated;
    size_t pos = 0;
    while (pos < path.size()) {
        size_t next = path.find_first_of("/\\", pos);
        if (next == std::string::npos) next = path.size();
        accumulated += path.substr(pos, next - pos);
        if (!accumulated.empty()) {
            _mkdir(accumulated.c_str());  // harmless if it already exists
        }
        accumulated += "/";
        pos = next + 1;
    }
}

// Escapes backslashes and quotes so Windows file paths are valid JSON strings
static std::string escape_json(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '\\') out += "\\\\";
        else if (c == '"') out += "\\\"";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else out += c;
    }
    return out;
}

// Rebuilds the in-memory index (files list + Trie) for the current root folder
static void rebuild_index(const std::string& root,
                          FileList& files,
                          std::unique_ptr<Trie>& search_index) {
    files = scan_directory(root);
    search_index.reset(new Trie());
    for (const auto& f : files) {
        search_index->insert(f.filename, f.full_path);
    }
}

// Persistent stdin/stdout JSON loop for the Python FastAPI server
static int run_interactive_mode() {
    std::string current_root;
    FileList current_files;
    std::unique_ptr<Trie> search_index(new Trie());
    std::unique_ptr<TransactionLog> tx_log;

    RulesEngine rules;
    rules.add_rule({RuleField::EXTENSION, "pdf", "Documents", 1});
    rules.add_rule({RuleField::EXTENSION, "jpg", "Photos", 1});
    rules.add_rule({RuleField::EXTENSION, "png", "Photos", 1});
    rules.add_rule({RuleField::EXTENSION, "mp4", "Videos", 1});

    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        std::istringstream iss(line);
        std::string cmd;
        iss >> cmd;

        std::string arg;
        std::getline(iss >> std::ws, arg);

        if (cmd == "SCAN") {
            current_root = arg;
            rebuild_index(current_root, current_files, search_index);
            tx_log.reset(new TransactionLog(current_root + "/organizer_log.txt"));
            tx_log->load();

            std::cout << "{\"status\":\"ok\",\"root\":\"" << escape_json(current_root)
                      << "\",\"total_files\":" << current_files.size()
                      << ",\"indexed_filenames\":" << search_index->size() << "}" << std::endl;
        }
        else if (cmd == "SEARCH") {
            auto matches = search_index->search_by_prefix(arg);
            std::cout << "{\"status\":\"ok\",\"query\":\"" << escape_json(arg) << "\",\"results\":[";
            for (size_t i = 0; i < matches.size(); ++i) {
                std::cout << "\"" << escape_json(matches[i]) << "\"";
                if (i + 1 < matches.size()) std::cout << ",";
            }
            std::cout << "]}" << std::endl;
        }
        else if (cmd == "ANALYTICS") {
            std::vector<std::string> paths;
            std::vector<FileEntry> entries;
            for (const auto& f : current_files) {
                paths.push_back(f.full_path);
                entries.push_back({f.full_path, f.size_bytes});
            }

            auto duplicate_groups = dedupe::find_duplicates(paths);
            auto largest = get_largest_files(entries, 5);

            std::cout << "{\"status\":\"ok\",\"largest_files\":[";
            for (size_t i = 0; i < largest.size(); ++i) {
                std::cout << "{\"path\":\"" << escape_json(largest[i].path)
                          << "\",\"size_bytes\":" << largest[i].size_bytes << "}";
                if (i + 1 < largest.size()) std::cout << ",";
            }
            std::cout << "],\"duplicate_groups\":[";
            for (size_t i = 0; i < duplicate_groups.size(); ++i) {
                std::cout << "[";
                const auto& g = duplicate_groups[i].file_paths;
                for (size_t j = 0; j < g.size(); ++j) {
                    std::cout << "\"" << escape_json(g[j]) << "\"";
                    if (j + 1 < g.size()) std::cout << ",";
                }
                std::cout << "]";
                if (i + 1 < duplicate_groups.size()) std::cout << ",";
            }
            std::cout << "]}" << std::endl;
        }
        else if (cmd == "ORGANIZE") {
            if (!arg.empty()) {
                current_root = arg;
                rebuild_index(current_root, current_files, search_index);
                tx_log.reset(new TransactionLog(current_root + "/organizer_log.txt"));
                tx_log->load();
            }
            if (current_root.empty() || !tx_log) {
                std::cout << "{\"status\":\"error\",\"message\":\"No directory scanned yet\"}" << std::endl;
                continue;
            }

            int moved_count = 0;
            for (const auto& f : current_files) {
                std::string dest_folder = rules.resolve(f);
                if (dest_folder.empty()) continue;

                std::string dest_dir = current_root + "/" + dest_folder;
                make_dirs_recursive(dest_dir);
                std::string dest_path = dest_dir + "/" + f.filename;

                // Skip if the file is already inside the target destination path
                if (f.full_path == dest_path) continue;

                if (std::rename(f.full_path.c_str(), dest_path.c_str()) == 0) {
                    tx_log->record(ActionType::MOVE, f.full_path, dest_path);
                    moved_count++;
                }
            }
            // Refresh index after moving files so Trie paths stay accurate
            rebuild_index(current_root, current_files, search_index);

            std::cout << "{\"status\":\"ok\",\"moved_count\":" << moved_count << "}" << std::endl;
        }
        else if (cmd == "HISTORY") {
            if (!tx_log) {
                std::cout << "{\"status\":\"ok\",\"entries\":[]}" << std::endl;
                continue;
            }
            const auto& log_entries = tx_log->entries();
            std::cout << "{\"status\":\"ok\",\"entries\":[";
            for (size_t i = 0; i < log_entries.size(); ++i) {
                const auto& e = log_entries[i];
                std::cout << "{\"id\":" << e.id
                          << ",\"path_before\":\"" << escape_json(e.path_before) << "\""
                          << ",\"path_after\":\"" << escape_json(e.path_after) << "\""
                          << ",\"timestamp\":\"" << escape_json(e.timestamp) << "\""
                          << ",\"undone\":" << (e.undone ? "true" : "false") << "}";
                if (i + 1 < log_entries.size()) std::cout << ",";
            }
            std::cout << "]}" << std::endl;
        }
        else if (cmd == "UNDO") {
            if (!tx_log) {
                std::cout << "{\"status\":\"error\",\"message\":\"No transaction log loaded\"}" << std::endl;
                continue;
            }
            int target_id = -1;
            if (!arg.empty()) {
                target_id = std::atoi(arg.c_str());
            } else {
                // If no ID specified, find the most recent non-undone entry
                const auto& log_entries = tx_log->entries();
                for (int i = static_cast<int>(log_entries.size()) - 1; i >= 0; --i) {
                    if (!log_entries[i].undone) {
                        target_id = log_entries[i].id;
                        break;
                    }
                }
            }

            if (target_id == -1) {
                std::cout << "{\"status\":\"error\",\"message\":\"Nothing left to undo\"}" << std::endl;
                continue;
            }

            bool ok = tx_log->undo(target_id);
            if (ok && !current_root.empty()) {
                rebuild_index(current_root, current_files, search_index);
            }
            std::cout << "{\"status\":\"" << (ok ? "ok" : "error")
                      << "\",\"undone_id\":" << target_id << "}" << std::endl;
        }
        else if (cmd == "ADD_RULE") {
            // Format: ADD_RULE <extension> <destination_folder> <priority>
            std::istringstream rstream(arg);
            std::string ext, dest;
            int priority = 1;
            if (rstream >> ext >> dest) {
                if (!(rstream >> priority)) priority = 1;
                rules.add_rule({RuleField::EXTENSION, ext, dest, priority});
                std::cout << "{\"status\":\"ok\",\"extension\":\"" << escape_json(ext)
                          << "\",\"destination\":\"" << escape_json(dest)
                          << "\",\"priority\":" << priority << "}" << std::endl;
            } else {
                std::cout << "{\"status\":\"error\",\"message\":\"Usage: ADD_RULE <ext> <folder> [priority]\"}" << std::endl;
            }
        }
        else if (cmd == "QUIT") {
            std::cout << "{\"status\":\"bye\"}" << std::endl;
            break;
        }
        else {
            std::cout << "{\"status\":\"error\",\"message\":\"Unknown command\"}" << std::endl;
        }
    }
    return 0;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "Usage:\n"
                  << "  organizer.exe <directory-to-organize>\n"
                  << "  organizer.exe --interactive\n";
        return 1;
    }

    // Launch persistent API mode if --interactive is passed
    if (std::string(argv[1]) == "--interactive") {
        return run_interactive_mode();
    }

    // --- Original CLI Mode Below (Unchanged) ---
    std::string root = argv[1];

    std::cout << "=== Intelligent File Organizer ===\n\n";

    std::cout << "Scanning " << root << " ...\n";
    auto files = scan_directory(root);
    std::cout << "Found " << files.size() << " files.\n\n";
    if (files.empty()) return 0;

    Trie search_index;
    for (const auto& f : files) {
        search_index.insert(f.filename, f.full_path);
    }
    std::cout << "Indexed " << search_index.size() << " filenames for search.\n\n";

    std::vector<std::string> paths;
    for (const auto& f : files) paths.push_back(f.full_path);
    auto duplicate_groups = dedupe::find_duplicates(paths);

    std::cout << "=== Duplicate Files ===\n";
    if (duplicate_groups.empty()) {
        std::cout << "No duplicates found.\n";
    }
    for (const auto& group : duplicate_groups) {
        std::cout << group.file_paths.size() << " copies of the same content:\n";
        for (const auto& p : group.file_paths) std::cout << "  - " << p << "\n";
    }
    std::cout << "\n";

    std::vector<FileEntry> entries;
    for (const auto& f : files) entries.push_back({f.full_path, f.size_bytes});
    auto largest = get_largest_files(entries, 5);

    std::cout << "=== Top " << largest.size() << " Largest Files ===\n";
    for (const auto& e : largest) {
        std::cout << "  " << e.size_bytes << " bytes  " << e.path << "\n";
    }
    std::cout << "\n";

    RulesEngine rules;
    rules.add_rule({RuleField::EXTENSION, "pdf", "Documents", 1});
    rules.add_rule({RuleField::EXTENSION, "jpg", "Photos", 1});
    rules.add_rule({RuleField::EXTENSION, "png", "Photos", 1});
    rules.add_rule({RuleField::EXTENSION, "mp4", "Videos", 1});

    TransactionLog log(root + "/organizer_log.txt");

    std::cout << "=== Sorting Files ===\n";
    int moved_count = 0;
    for (const auto& f : files) {
        std::string dest_folder = rules.resolve(f);
        if (dest_folder.empty()) continue;

        std::string dest_dir = root + "/" + dest_folder;
        make_dirs_recursive(dest_dir);
        std::string dest_path = dest_dir + "/" + f.filename;

        if (std::rename(f.full_path.c_str(), dest_path.c_str()) == 0) {
            log.record(ActionType::MOVE, f.full_path, dest_path);
            std::cout << "  Moved: " << f.filename << " -> " << dest_folder << "/\n";
            moved_count++;
        }
    }
    std::cout << moved_count << " file(s) sorted. Every move is logged and undoable.\n";

    return 0;
}