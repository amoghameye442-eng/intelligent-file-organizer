#include "scanner.hpp"
#include <iostream>
#include <cassert>
#include <fstream>
#include <cstdio>
#include <direct.h>

static void write_file(const std::string& path, const std::string& content) {
    std::ofstream out(path);
    out << content;
}

int main() {
    _mkdir("scan_test_dir");
    _mkdir("scan_test_dir/subfolder");

    write_file("scan_test_dir/report.PDF", "aaaa");
    write_file("scan_test_dir/subfolder/photo.jpg", "bbbbbbbb");
    write_file("scan_test_dir/README", "no extension here");

    assert(get_extension("Report.PDF") == "pdf");
    assert(get_extension("archive.tar.gz") == "gz");
    assert(get_extension("README") == "");
    assert(get_extension(".gitignore") == "");
    std::cout << "[ok] get_extension handles case, multiple dots, no extension, dotfiles\n";

    auto files = scan_directory("scan_test_dir");
    assert(files.size() == 3);
    std::cout << "[ok] scan_directory found all 3 files recursively\n";

    bool found_pdf = false, found_jpg = false;
    for (const auto& f : files) {
        if (f.filename == "report.PDF") {
            assert(f.extension == "pdf");
            assert(f.size_bytes == 4);
            found_pdf = true;
        }
        if (f.filename == "photo.jpg") {
            assert(f.extension == "jpg");
            assert(f.size_bytes == 8);
            found_jpg = true;
        }
    }
    assert(found_pdf && found_jpg);
    std::cout << "[ok] extension and size correctly captured for nested files\n";

    std::remove("scan_test_dir/report.PDF");
    std::remove("scan_test_dir/subfolder/photo.jpg");
    std::remove("scan_test_dir/README");
    _rmdir("scan_test_dir/subfolder");
    _rmdir("scan_test_dir");

    std::cout << "\nAll scanner tests passed.\n";
    return 0;
}