#pragma once
#include <string>
#include <cstdint>
#include <vector>

// A self-contained SHA-256 implementation (no external crypto library
// dependency). Used to fingerprint file contents for duplicate detection:
// two files with the same SHA-256 hash are (for all practical purposes)
// the same content.
class SHA256 {
public:
    SHA256();

    // Feed raw bytes into the hash (can be called multiple times, e.g.
    // once per chunk while streaming a large file).
    void update(const uint8_t* data, size_t length);

    // Finalize and return the hash as a 64-character lowercase hex string.
    std::string hexdigest();

    // Convenience: hash an entire file on disk in one call, reading it in
    // chunks so we never load huge files fully into memory.
    static std::string hash_file(const std::string& file_path);

private:
    uint32_t state[8];
    uint64_t bit_length;
    uint8_t buffer[64];
    size_t buffer_length;

    void process_block(const uint8_t* block);
};