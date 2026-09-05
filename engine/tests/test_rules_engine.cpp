#include "rules_engine.hpp"
#include <iostream>
#include <cassert>

int main() {
    RulesEngine engine;

    engine.add_rule({RuleField::EXTENSION, "pdf", "Documents/PDFs", 1});
    engine.add_rule({RuleField::EXTENSION, "jpg", "Photos", 1});
    engine.add_rule({RuleField::FILENAME_CONTAINS, "invoice", "Documents/Invoices", 0}); // higher priority
    engine.add_rule({RuleField::SIZE_GREATER_THAN_MB, "100", "Archive/Large", 2});

    FileInfo invoice{"/downloads/invoice_march.pdf", "invoice_march.pdf", "pdf", 500000};
    assert(engine.resolve(invoice) == "Documents/Invoices");
    std::cout << "[ok] higher-priority rule wins over a lower-priority match\n";

    FileInfo plainPdf{"/downloads/notes.pdf", "notes.pdf", "pdf", 200000};
    assert(engine.resolve(plainPdf) == "Documents/PDFs");
    std::cout << "[ok] extension rule matches when no higher-priority rule applies\n";

    FileInfo photo{"/downloads/beach.jpg", "beach.jpg", "jpg", 3000000};
    assert(engine.resolve(photo) == "Photos");
    std::cout << "[ok] jpg routed to Photos\n";

    FileInfo bigFile{"/downloads/dataset.csv", "dataset.csv", "csv", 150 * 1024 * 1024};
    assert(engine.resolve(bigFile) == "Archive/Large");
    std::cout << "[ok] size-based rule matches large files\n";

    FileInfo noMatch{"/downloads/random.xyz", "random.xyz", "xyz", 1000};
    assert(engine.resolve(noMatch) == "");
    std::cout << "[ok] unmatched file returns empty destination\n";

    std::cout << "\nAll rules engine tests passed.\n";
    return 0;
}