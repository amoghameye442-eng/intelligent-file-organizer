#include "scanner.hpp"
#include "trie.hpp"
#include "dedupe.hpp"
#include "heap.hpp"
#include "rules_engine.hpp"
#include "transaction_log.hpp"
#include <iostream>
#include <cstdio>
#include <direct.h>

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

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "Usage: organizer.exe <directory-to-organize>\n";
        return 1;
    }
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