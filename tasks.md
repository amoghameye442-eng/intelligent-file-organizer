# Task Breakdown

This splits the project so both members have a clear, substantial, and
independently demoable piece of ownership — useful both for parallel work
and for viva questions ("who built what").

## Amogh — C++ Engine & System Design

- [x] Trie (prefix search / autocomplete over filenames)
- [x] Custom hash table (separate chaining, polynomial rolling hash)
- [x] SHA-256 implementation (from scratch, verified with known-answer test)
- [x] Dedupe module (content-based duplicate detection)
- [ ] Heap-based "largest files" report
- [ ] Transaction log (records every automated move/rename/delete, enables undo)
- [ ] Rules engine (extension / filename pattern / date-based sorting rules)
- [ ] File-watcher daemon (auto-sorts new files as they arrive)
- [ ] REST API layer exposing the engine to the frontend (likely cpp-httplib)
- [ ] Python classifier module (content-based auto-tagging: reads inside PDFs/images)

## [sampan sharma] — Frontend Dashboard

The dashboard is the part everyone actually sees in the demo, so this
carries real weight — it's not "just UI," it's the product surface.

### 1. Project setup
- [x] Initialize Vite + React + Tailwind project in `frontend/`
- [x] Set up routing (React Router) for: Dashboard, Search, Rules, History, Settings
- [ ] Set up a shared API client module (fetch/axios wrapper) pointing at the C++ engine's REST API

### 2. Dashboard (home) view
- [ ] Storage overview: total files, total size, breakdown by file type (pie/bar chart)
- [ ] "Largest files" panel (backed by the engine's heap-based report)
- [ ] Recent automation activity feed (backed by the transaction log)

### 3. Search view
- [ ] Live search-as-you-type box, calling the Trie's prefix-search endpoint
- [ ] Results list showing filename, full path, size, type
- [ ] Debounce input so it doesn't spam the API on every keystroke

### 4. Rules view (the "wow" feature for the demo)
- [ ] Visual rule builder: "if [extension/name/date] [condition] then move to [folder]"
- [ ] List of active rules, with edit/delete
- [ ] Rule ordering (which rule wins if multiple match)

### 5. Duplicate files view
- [ ] Display duplicate groups returned by the dedupe module
- [ ] Let the user pick which copy to keep, trigger delete via the API

### 6. History / Undo view
- [ ] Chronological list of every automated action (from the transaction log)
- [ ] "Undo" button per action, calling the engine's rollback endpoint

### 7. Polish
- [ ] Dark mode
- [ ] Loading states / empty states for every view
- [ ] Responsive layout for demo on a projector

## Shared / either person
- [ ] Agree on the REST API contract (endpoints, request/response shapes) before frontend work starts on data-dependent views — recommend doing this as a shared doc or even mock JSON responses so frontend isn't blocked waiting on backend
- [ ] Write the final README sections covering setup instructions for both halves
- [ ] Prepare the presentation/demo script together

## Suggested order to avoid blocking each other

1. Agree on API contract early (just the shapes, not the real implementation)
2. Partner starts frontend against mock/hardcoded data immediately — no need to wait for the real API
3. Amogh finishes the REST API layer once enough engine modules exist
4. Wire frontend to the real API, replacing the mocks
5. Integration pass together before the deadline
