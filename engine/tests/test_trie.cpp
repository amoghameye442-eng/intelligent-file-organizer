#include "trie.hpp"
#include <iostream>
#include <cassert>

int main() {
    Trie trie;

    trie.insert("Report_2024.pdf", "/documents/Report_2024.pdf");
    trie.insert("report_final.docx", "/documents/report_final.docx");
    trie.insert("invoice_march.xlsx", "/documents/invoice_march.xlsx");
    trie.insert("vacation.jpg", "/photos/vacation.jpg");

    assert(trie.size() == 4);
    std::cout << "[ok] insert + size\n";

    assert(trie.contains("VACATION.JPG"));
    assert(!trie.contains("nonexistent.txt"));
    std::cout << "[ok] contains (case-insensitive)\n";

    auto results = trie.search_by_prefix("report");
    assert(results.size() == 2);
    std::cout << "[ok] search_by_prefix found " << results.size() << " matches for 'report'\n";

    auto none = trie.search_by_prefix("zzz");
    assert(none.empty());
    std::cout << "[ok] search_by_prefix returns empty for no match\n";

    trie.remove("vacation.jpg");
    assert(!trie.contains("vacation.jpg"));
    std::cout << "[ok] remove works\n";

    std::cout << "\nAll Trie tests passed.\n";
    return 0;
}