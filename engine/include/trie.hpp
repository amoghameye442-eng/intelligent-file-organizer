#pragma once
#include <string>
#include <unordered_map>
#include <vector>
#include <memory>

// A Trie (prefix tree) node. Each node represents one character on the
// path from the root. If is_end_of_word is true, the path from the root
// down to this node spells out a complete filename we've inserted.
struct TrieNode {
    std::unordered_map<char, std::unique_ptr<TrieNode>> children;
    bool is_end_of_word = false;

    // When is_end_of_word is true, we also stash the full file path here
    // so search results can return "where is this file", not just "this
    // filename exists".
    std::string full_path;
};

class Trie {
public:
    Trie();

    // Insert one filename (and its full path) into the trie.
    void insert(const std::string& filename, const std::string& full_path);

    // Remove a filename from the trie (used when a file is renamed/deleted
    // so the search index stays accurate).
    void remove(const std::string& filename);

    // Return every full path whose filename starts with `prefix`.
    // This is what powers "type a few letters, see matches instantly".
    std::vector<std::string> search_by_prefix(const std::string& prefix) const;

    // Exact match: does this filename exist in the index?
    bool contains(const std::string& filename) const;

    size_t size() const { return word_count; }

private:
    std::unique_ptr<TrieNode> root;
    size_t word_count = 0;

    // Helper used by search_by_prefix: once we've walked down to the node
    // matching the prefix, collect every complete word beneath it.
    void collect_words(const TrieNode* node, std::vector<std::string>& results) const;

    // Helper used by remove(): recursively deletes nodes that are no longer
    // needed once a word is removed, so the trie doesn't accumulate dead
    // branches over time.
    bool remove_helper(TrieNode* node, const std::string& filename, size_t depth);
};