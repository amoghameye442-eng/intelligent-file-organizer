#include "trie.hpp"
#include <algorithm>
#include <cctype>

Trie::Trie() : root(std::make_unique<TrieNode>()) {}

// Lowercase every character before indexing so search is case-insensitive.
// Users expect "report" to find "Report.pdf".
static std::string normalize(const std::string& s) {
    std::string out = s;
    std::transform(out.begin(), out.end(), out.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return out;
}

void Trie::insert(const std::string& filename, const std::string& full_path) {
    std::string key = normalize(filename);
    TrieNode* current = root.get();

    // Walk down one character at a time, creating nodes as needed.
    for (char ch : key) {
        if (current->children.find(ch) == current->children.end()) {
            current->children[ch] = std::make_unique<TrieNode>();
        }
        current = current->children[ch].get();
    }

    if (!current->is_end_of_word) {
        word_count++;
    }
    current->is_end_of_word = true;
    current->full_path = full_path;
}

bool Trie::contains(const std::string& filename) const {
    std::string key = normalize(filename);
    const TrieNode* current = root.get();

    for (char ch : key) {
        auto it = current->children.find(ch);
        if (it == current->children.end()) {
            return false;
        }
        current = it->second.get();
    }
    return current->is_end_of_word;
}

void Trie::collect_words(const TrieNode* node, std::vector<std::string>& results) const {
    if (node->is_end_of_word) {
        results.push_back(node->full_path);
    }
    for (const auto& entry : node->children) {
        collect_words(entry.second.get(), results);
    }
}

std::vector<std::string> Trie::search_by_prefix(const std::string& prefix) const {
    std::string key = normalize(prefix);
    const TrieNode* current = root.get();

    // First, walk down to the node representing the end of the prefix.
    for (char ch : key) {
        auto it = current->children.find(ch);
        if (it == current->children.end()) {
            return {};  // nothing matches this prefix at all
        }
        current = it->second.get();
    }

    // Then collect every complete filename in the subtree below that point.
    std::vector<std::string> results;
    collect_words(current, results);
    return results;
}

bool Trie::remove_helper(TrieNode* node, const std::string& filename, size_t depth) {
    if (depth == filename.size()) {
        if (!node->is_end_of_word) return false;
        node->is_end_of_word = false;
        node->full_path.clear();
        return node->children.empty();  // true means "safe to delete this node"
    }

    char ch = filename[depth];
    auto it = node->children.find(ch);
    if (it == node->children.end()) return false;

    bool should_delete_child = remove_helper(it->second.get(), filename, depth + 1);
    if (should_delete_child) {
        node->children.erase(it);
    }

    // This node can also be deleted if it has no children left and isn't
    // itself the end of another word.
    return node->children.empty() && !node->is_end_of_word;
}

void Trie::remove(const std::string& filename) {
    std::string key = normalize(filename);
    if (remove_helper(root.get(), key, 0)) {
        // root itself is never deleted, just left empty
    }
    word_count--;
}