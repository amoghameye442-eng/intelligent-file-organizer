#pragma once
#include <string>
#include <vector>

namespace dedupe {

// A group of two or more files that share identical content.
struct DuplicateGroup {
    std::string checksum;
    std::vector<std::string> file_paths;
};

// Given a list of file paths, compute each file's SHA-256 checksum, group
// them using our custom hash table, and return only the groups that have
// more than one file (i.e., actual duplicates).
std::vector<DuplicateGroup> find_duplicates(const std::vector<std::string>& file_paths);

} // namespace dedupe