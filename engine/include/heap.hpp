#pragma once
#include <string>
#include <vector>
#include <cstdint>

// One entry in a "largest files" report: a file's path and its size in bytes.
struct FileEntry {
    std::string path;
    uint64_t size_bytes;
};

// A min-heap over FileEntry, ordered by size_bytes. The smallest entry
// currently in the heap always sits at index 0 (the root).
//
// This is stored as a flat array (std::vector), not a tree of pointers:
// for the item at index i, its parent is at (i-1)/2, its children are at
// 2i+1 and 2i+2. This is the standard array representation of a binary
// heap — no pointers needed, and it's cache-friendly.
class MinHeap {
public:
    void push(const FileEntry& entry);

    // Remove and return the smallest entry (the root).
    FileEntry pop();

    // Look at the smallest entry without removing it.
    const FileEntry& peek() const;

    bool empty() const { return data.empty(); }
    size_t size() const { return data.size(); }

private:
    std::vector<FileEntry> data;

    // Restore the heap property by moving a newly-inserted item upward
    // until its parent is smaller (or it reaches the root).
    void sift_up(size_t index);

    // Restore the heap property by moving an item downward until both its
    // children are larger (or it has no children).
    void sift_down(size_t index);
};

// Scan a list of (path, size) entries and return the K largest, sorted
// largest-first. Uses a min-heap of size K internally for efficiency —
// see heap.cpp for why that's the right approach.
std::vector<FileEntry> get_largest_files(const std::vector<FileEntry>& all_files, size_t k);