#pragma once
#include <string>
#include <vector>
#include "rules_engine.hpp"  // reuses the FileInfo struct

// Recursively scans a directory and returns a FileInfo for every regular
// file found. Directories, symlinks, and unreadable entries are skipped.
std::vector<FileInfo> scan_directory(const std::string& root_path);

// Extracts the lowercase extension (no dot) from a filename, or "" if
// there isn't one, e.g. "Report.PDF" -> "pdf", "README" -> "".
std::string get_extension(const std::string& filename);