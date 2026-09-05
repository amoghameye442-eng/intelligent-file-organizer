#pragma once
#include <string>
#include <vector>
#include <cstdint>

enum class RuleField { EXTENSION, FILENAME_CONTAINS, SIZE_GREATER_THAN_MB };

struct Rule {
    RuleField field;
    std::string match_value;     // extension text, substring, or size threshold as string
    std::string destination_folder;
    int priority = 0;            // lower number = checked first
};

// Minimal info the rules engine needs about a file to evaluate rules
// against it, decoupled from any actual filesystem scan.
struct FileInfo {
    std::string full_path;
    std::string filename;
    std::string extension;   // e.g. "pdf", lowercase, no dot
    uint64_t size_bytes;
};

class RulesEngine {
public:
    void add_rule(const Rule& rule);

    // Returns the destination folder for this file based on the
    // highest-priority matching rule, or empty string if no rule matches.
    std::string resolve(const FileInfo& file) const;

    const std::vector<Rule>& rules() const { return rule_list; }

private:
    std::vector<Rule> rule_list;

    bool matches(const Rule& rule, const FileInfo& file) const;
};