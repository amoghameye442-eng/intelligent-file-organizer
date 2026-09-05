#include "scanner.hpp"
#include <dirent.h>
#include <sys/stat.h>
#include <algorithm>
#include <cctype>

std::string get_extension(const std::string& filename) {
    size_t dot = filename.find_last_of('.');
    if (dot == std::string::npos || dot == 0 || dot == filename.size() - 1) {
        return "";
    }
    std::string ext = filename.substr(dot + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return ext;
}

static bool path_is_directory(const std::string& path) {
    struct stat info;
    if (stat(path.c_str(), &info) != 0) return false;
    return (info.st_mode & S_IFDIR) != 0;
}

static uint64_t get_file_size(const std::string& path) {
    struct stat info;
    if (stat(path.c_str(), &info) != 0) return 0;
    return static_cast<uint64_t>(info.st_size);
}

// Recursively walks dir_path using dirent.h (available on essentially every
// MinGW/GCC version, unlike std::filesystem which needs GCC 8+). Appends
// every regular file found into `results`.
static void scan_recursive(const std::string& dir_path, std::vector<FileInfo>& results) {
    DIR* dir = opendir(dir_path.c_str());
    if (!dir) return;

    struct dirent* entry;
    while ((entry = readdir(dir)) != nullptr) {
        std::string name = entry->d_name;
        if (name == "." || name == "..") continue;

        std::string full_path = dir_path + "/" + name;

        if (path_is_directory(full_path)) {
            scan_recursive(full_path, results);
        } else {
            FileInfo info;
            info.full_path = full_path;
            info.filename = name;
            info.extension = get_extension(name);
            info.size_bytes = get_file_size(full_path);
            results.push_back(info);
        }
    }
    closedir(dir);
}

std::vector<FileInfo> scan_directory(const std::string& root_path) {
    std::vector<FileInfo> results;
    scan_recursive(root_path, results);
    return results;
}