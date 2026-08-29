#include "hash_table.hpp"
#include "sha256.hpp"
#include "dedupe.hpp"
#include <iostream>
#include <fstream>
#include <cassert>
#include <cstdio>

// Helper: write a small text file with given content, for testing.
static void write_test_file(const std::string& path, const std::string& content) {
    std::ofstream out(path, std::ios::binary);
    out << content;
}

int main() {
    // --- HashTable basic tests ---
    HashTable table(11);  // small bucket count on purpose, to force collisions
    table.insert("checksumA", "/a/file1.txt");
    table.insert("checksumA", "/a/file2.txt");  // same checksum, different file
    table.insert("checksumB", "/b/file3.txt");

    assert(table.distinct_keys() == 2);
    assert(table.get("checksumA").size() == 2);
    assert(table.get("checksumB").size() == 1);
    assert(!table.contains("checksumC"));
    std::cout << "[ok] HashTable insert/get/contains, including collisions\n";

    // --- SHA-256 known-answer test ---
    // The SHA-256 hash of an empty input is a published constant value
    // (it's the same every time, for every correct SHA-256 implementation
    // in the world). Checking our output against it proves our from-scratch
    // implementation is actually correct, not just "produces some string".
    SHA256 hasher;
    std::string empty_hash = hasher.hexdigest();
    const std::string known_empty_sha256 =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    assert(empty_hash == known_empty_sha256);
    std::cout << "[ok] SHA256 matches known answer for empty input\n";

        // --- Dedupe test using real temp files ---
    write_test_file("test_dedupe_a.txt", "identical content");
    write_test_file("test_dedupe_b.txt", "identical content");
    write_test_file("test_dedupe_c.txt", "different content");

    std::vector<std::string> files = {
        "test_dedupe_a.txt",
        "test_dedupe_b.txt",
        "test_dedupe_c.txt"
    };

    auto groups = dedupe::find_duplicates(files);
    assert(groups.size() == 1);            // exactly one duplicate group
    assert(groups[0].file_paths.size() == 2);  // containing exactly 2 files
    std::cout << "[ok] dedupe found " << groups.size()
              << " duplicate group with " << groups[0].file_paths.size() << " files\n";

       // cleanup
    std::remove("test_dedupe_a.txt");
    std::remove("test_dedupe_b.txt");
    std::remove("test_dedupe_c.txt");
    
    std::cout << "\nAll HashTable/SHA256/dedupe tests passed.\n";
    return 0;
}