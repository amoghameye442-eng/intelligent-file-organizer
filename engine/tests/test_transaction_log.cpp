#include "transaction_log.hpp"
#include <iostream>
#include <cassert>
#include <fstream>
#include <cstdio>

static void write_file(const std::string& path, const std::string& content) {
    std::ofstream out(path);
    out << content;
}

static bool file_exists(const std::string& path) {
    std::ifstream f(path);
    return f.good();
}

int main() {
    // clean slate (ignore errors if files don't exist yet)
    std::remove("test_log.txt");
    std::remove("original_a.txt");
    std::remove("moved_a.txt");

    write_file("original_a.txt", "hello");

    {
        TransactionLog log("test_log.txt");

        // simulate actually moving the file, then recording it
        std::rename("original_a.txt", "moved_a.txt");
        int id = log.record(ActionType::MOVE, "original_a.txt", "moved_a.txt");

        assert(file_exists("moved_a.txt"));
        assert(!file_exists("original_a.txt"));
        std::cout << "[ok] move recorded, file actually moved\n";

        bool ok = log.undo(id);
        assert(ok);
        assert(file_exists("original_a.txt"));
        assert(!file_exists("moved_a.txt"));
        std::cout << "[ok] undo reversed the move\n";

        bool second_undo = log.undo(id);
        assert(!second_undo);
        std::cout << "[ok] undoing the same id twice is correctly rejected\n";
    }

    {
        TransactionLog reloaded("test_log.txt");
        assert(reloaded.entries().size() == 1);
        assert(reloaded.entries()[0].undone == true);
        std::cout << "[ok] log persisted to disk and reloaded correctly\n";
    }

    std::remove("test_log.txt");
    std::remove("original_a.txt");

    std::cout << "\nAll transaction log tests passed.\n";
    return 0;
}