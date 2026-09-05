#include "heap.hpp"
#include <algorithm>

void MinHeap::sift_up(size_t index) {
    while (index > 0) {
        size_t parent = (index - 1) / 2;
        if (data[parent].size_bytes <= data[index].size_bytes) {
            break;  // parent is already smaller (or equal) — heap property holds
        }
        std::swap(data[parent], data[index]);
        index = parent;
    }
}

void MinHeap::sift_down(size_t index) {
    size_t n = data.size();
    while (true) {
        size_t left = 2 * index + 1;
        size_t right = 2 * index + 2;
        size_t smallest = index;

        if (left < n && data[left].size_bytes < data[smallest].size_bytes) {
            smallest = left;
        }
        if (right < n && data[right].size_bytes < data[smallest].size_bytes) {
            smallest = right;
        }
        if (smallest == index) {
            break;  // both children (if any) are already larger — done
        }
        std::swap(data[index], data[smallest]);
        index = smallest;
    }
}

void MinHeap::push(const FileEntry& entry) {
    data.push_back(entry);
    sift_up(data.size() - 1);
}

FileEntry MinHeap::pop() {
    FileEntry root = data.front();
    data.front() = data.back();
    data.pop_back();
    if (!data.empty()) {
        sift_down(0);
    }
    return root;
}

const FileEntry& MinHeap::peek() const {
    return data.front();
}

std::vector<FileEntry> get_largest_files(const std::vector<FileEntry>& all_files, size_t k) {
    MinHeap heap;

    for (const auto& file : all_files) {
        if (heap.size() < k) {
            // Heap isn't full yet — every file qualifies for now.
            heap.push(file);
        } else if (file.size_bytes > heap.peek().size_bytes) {
            // This file is bigger than our current smallest "top-K" entry,
            // so it displaces it: drop the smallest, add this one.
            heap.pop();
            heap.push(file);
        }
        // Otherwise: this file is smaller than everything already in our
        // top-K, so it's correctly ignored.
    }

    // Drain the heap into a vector. Since it's a min-heap, popping gives us
    // smallest-first — so we reverse to present largest-first, which is
    // what a "largest files" report should read like.
    std::vector<FileEntry> result;
    while (!heap.empty()) {
        result.push_back(heap.pop());
    }
    std::reverse(result.begin(), result.end());
    return result;
}