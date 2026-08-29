#pragma once
#include <string>
#include <vector>
#include <list>
#include <utility>

// A hash table mapping a string key (in our case, a file's checksum) to a
// list of full file paths that share that key. Built with separate
// chaining: each bucket holds a small linked list of (key, paths) pairs,
// so collisions don't overwrite each other — they just grow the chain.
class HashTable {
public:
    explicit HashTable(size_t bucket_count = 101);

    // Insert a (checksum -> file_path) mapping. If the checksum already
    // exists, the path is appended to its group instead of overwriting.
    void insert(const std::string& key, const std::string& file_path);

    // Return every file path stored under this exact key, or an empty
    // vector if the key has never been inserted.
    std::vector<std::string> get(const std::string& key) const;

    // True if this key has at least one entry.
    bool contains(const std::string& key) const;

    // Total number of distinct keys currently stored.
    size_t distinct_keys() const { return key_count; }

    // Number of buckets (fixed at construction) — exposed mainly so tests
    // can sanity-check collision behavior.
    size_t bucket_count() const { return buckets.size(); }

private:
    // Each bucket is a list of (checksum, [paths sharing that checksum]).
    using Bucket = std::list<std::pair<std::string, std::vector<std::string>>>;
    std::vector<Bucket> buckets;
    size_t key_count = 0;

    // Turns an arbitrary string key into a bucket index. We use a simple
    // polynomial rolling hash (the same family used by Java's String.hashCode
    // and many textbook hash table implementations) rather than relying on
    // std::hash, so the hashing logic itself is ours to show.
    size_t hash(const std::string& key) const;
};