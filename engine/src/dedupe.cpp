#include "dedupe.hpp"
#include "hash_table.hpp"
#include "sha256.hpp"

namespace dedupe {

std::vector<DuplicateGroup> find_duplicates(const std::vector<std::string>& file_paths) {
    // Size the table relative to input so chains stay short even on large
    // folders — a bigger, prime bucket count keeps collisions rare.
    HashTable table(file_paths.size() * 2 + 101);
    std::vector<std::string> unique_checksums;  // insertion order, no repeats

    // Single pass: hash each file once, insert into the table, and record
    // each newly-seen checksum so we can look up final groups afterward
    // without re-hashing anything.
    for (const auto& path : file_paths) {
        std::string checksum = SHA256::hash_file(path);
        if (checksum.empty()) continue;  // unreadable file, skip it

        bool is_new = !table.contains(checksum);
        table.insert(checksum, path);
        if (is_new) {
            unique_checksums.push_back(checksum);
        }
    }

    // A checksum is only a "duplicate group" if more than one file mapped
    // to it.
    std::vector<DuplicateGroup> results;
    for (const auto& checksum : unique_checksums) {
        auto matches = table.get(checksum);
        if (matches.size() > 1) {
            results.push_back(DuplicateGroup{checksum, matches});
        }
    }

    return results;
}

} // namespace dedupe