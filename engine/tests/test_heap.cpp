#include "heap.hpp"
#include <iostream>
#include <cassert>
#include <algorithm>

int main() {
    // --- Basic MinHeap property test ---
    MinHeap heap;
    heap.push({"c.txt", 30});
    heap.push({"a.txt", 10});
    heap.push({"b.txt", 20});

    assert(heap.peek().size_bytes == 10);  // smallest should be at the root
    std::cout << "[ok] MinHeap root is the smallest entry after pushes\n";

    // Popping should always give increasing order (that's the heap property)
    uint64_t last = 0;
    while (!heap.empty()) {
        FileEntry e = heap.pop();
        assert(e.size_bytes >= last);
        last = e.size_bytes;
    }
    std::cout << "[ok] MinHeap pops in non-decreasing order\n";

    // --- get_largest_files correctness test ---
    std::vector<FileEntry> files = {
        {"tiny.txt", 5},
        {"huge.mp4", 5000},
        {"medium.docx", 500},
        {"small.png", 50},
        {"biggest.iso", 9000},
        {"another_medium.pdf", 450},
    };

    auto top3 = get_largest_files(files, 3);
    assert(top3.size() == 3);
    // Expected largest-first: biggest.iso (9000), huge.mp4 (5000), medium.docx (500)
    assert(top3[0].path == "biggest.iso");
    assert(top3[1].path == "huge.mp4");
    assert(top3[2].path == "medium.docx");
    std::cout << "[ok] get_largest_files returns correct top-3, largest-first\n";

    // Cross-check against a brute-force sort, to be extra sure the heap
    // approach agrees with the "obviously correct but slower" approach.
    std::vector<FileEntry> sorted_files = files;
    std::sort(sorted_files.begin(), sorted_files.end(),
              [](const FileEntry& a, const FileEntry& b) { return a.size_bytes > b.size_bytes; });

    for (size_t i = 0; i < top3.size(); ++i) {
        assert(top3[i].size_bytes == sorted_files[i].size_bytes);
    }
    std::cout << "[ok] heap-based top-K matches brute-force sort\n";

    // Edge case: asking for more than exist
    auto all = get_largest_files(files, 100);
    assert(all.size() == files.size());
    std::cout << "[ok] handles k larger than input size\n";

    std::cout << "\nAll heap tests passed.\n";
    return 0;
}