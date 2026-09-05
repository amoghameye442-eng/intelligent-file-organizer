# Intelligent File Organisation and Automation System

A file management system that goes beyond basic extension-based sorting —
built with custom-implemented data structures (Trie, hash table), a
from-scratch SHA-256 implementation for content-based duplicate detection,
a rule engine for automation, and a React dashboard for a real product feel.

## Why this exists

Most "file organizer" projects are a script that moves `.pdf` files into a
folder named PDFs. This one is built to demonstrate real systems design:
custom data structures with justified complexity trade-offs, cryptographic
hashing implemented from first principles, and a multi-language architecture
where each language is chosen for what it's actually good at.

## Architecture
┌──────────────────────────┐
│ React + Vite + Tailwind │ dashboard: search, rules, undo history,
│ dashboard │ storage analytics
└─────────────┬─────────────┘
│ REST API
┌─────────────▼─────────────┐
│ C++ Engine │ scanning, custom data structures,
│ - Trie (search) │ rules engine, transaction log
│ - Hash Table (dedupe) │
│ - SHA-256 (from scratch) │
│ - Dedupe │
└─────────────┬─────────────┘
│ invokes for content analysis
┌─────────────▼─────────────┐
│ Python classifier │ content-based auto-tagging
│ (reads inside PDFs/images) │ (PyPDF, Pillow/EXIF)
└────────────────────────────┘


**Why C++ for the core:** file scanning, hashing, and search are
performance-sensitive over large directory trees — this is where raw
speed and manual memory control matter.

**Why Python for classification:** reading file content (PDF text
extraction, image metadata) is a job Python's library ecosystem is
simply better suited for than C++. Different languages for different
jobs, deliberately.

**Why React for the dashboard:** fastest path to a polished, demoable
UI — rule builder, live search, undo history, and analytics charts.

## Current status
## Current status

- [x] Custom Trie — prefix-based filename search/autocomplete
- [x] Custom hash table (separate chaining, polynomial rolling hash)
- [x] SHA-256 implemented from scratch, verified with a known-answer test
- [x] Dedupe module — content-based duplicate file detection
- [x] Min-heap — top-K largest-files report, verified against brute-force sort
- [x] Transaction log — write-ahead style, disk-persisted, full undo support
- [x] Rules engine — priority-based extension/filename/size rules
- [x] Scanner — recursive directory walk
- [x] End-to-end engine (`organizer.exe`) — scans, indexes, dedupes, reports, and sorts files with undo logging, all wired together
- [ ] File-watcher daemon (auto-sort on file arrival)
- [ ] Python content-classifier module
- [ ] REST API layer (engine ↔ frontend) — **blocks frontend integration, needed next**
- [ ] React dashboard


## Repo structure

engine/ C++ core (data structures, hashing, automation logic)
include/ header files
src/ implementation
tests/ test programs for each module
classifier/ Python content-classification module
frontend/ React + Vite + Tailwind dashboard
docs/ architecture notes, diagrams


## Building and running the engine tests

## Building and running the engine tests

From inside `engine/`:
```bash
g++ -std=c++17 -Wall -I include src/trie.cpp tests/test_trie.cpp -o test_trie
./test_trie

g++ -std=c++17 -Wall -I include src/hash_table.cpp src/sha256.cpp src/dedupe.cpp tests/test_dedupe.cpp -o test_dedupe
./test_dedupe

g++ -std=c++17 -Wall -I include src/heap.cpp tests/test_heap.cpp -o test_heap
./test_heap

g++ -std=c++17 -Wall -I include src/transaction_log.cpp tests/test_transaction_log.cpp -o test_transaction_log
./test_transaction_log

g++ -std=c++17 -Wall -I include src/rules_engine.cpp tests/test_rules_engine.cpp -o test_rules_engine
./test_rules_engine

g++ -std=c++17 -Wall -I include src/scanner.cpp tests/test_scanner.cpp -o test_scanner
./test_scanner
```
(On Windows PowerShell, run the resulting `.exe` as `.\test_trie.exe`, etc.)

## Running the full engine end-to-end

```bash
g++ -std=c++17 -Wall -I include src/scanner.cpp src/trie.cpp src/hash_table.cpp src/sha256.cpp src/dedupe.cpp src/heap.cpp src/rules_engine.cpp src/transaction_log.cpp src/main.cpp -o organizer
./organizer /path/to/a/messy/folder
```
This scans the folder, reports duplicates and the largest files, then actually
sorts files into `Documents/`, `Photos/`, `Videos/` subfolders based on
extension — with every move logged and undoable via the transaction log.

**Note on portability:** the codebase intentionally avoids `std::filesystem`
and `std::optional` (using `dirent.h`/`sys/stat.h` and plain structs instead)
so it compiles on older compilers (tested down to GCC/MinGW 6.3.0), not just
the newest ones.

## Team

| Member | Owns |
|---|---|
| Amogh | C++ engine, data structures, algorithms, system architecture |
| [sampan sharma | React dashboard, frontend architecture, API integration |

See `docs/TASKS.md` for the detailed task breakdown.
