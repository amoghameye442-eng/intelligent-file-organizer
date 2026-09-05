#include "rules_engine.hpp"
#include <algorithm>

void RulesEngine::add_rule(const Rule& rule) {
    rule_list.push_back(rule);
    // Keep rules sorted by priority so resolve() can just check in order.
    std::sort(rule_list.begin(), rule_list.end(),
              [](const Rule& a, const Rule& b) { return a.priority < b.priority; });
}

bool RulesEngine::matches(const Rule& rule, const FileInfo& file) const {
    switch (rule.field) {
        case RuleField::EXTENSION:
            return file.extension == rule.match_value;

        case RuleField::FILENAME_CONTAINS:
            return file.filename.find(rule.match_value) != std::string::npos;

        case RuleField::SIZE_GREATER_THAN_MB: {
            double threshold_mb = std::stod(rule.match_value);
            double file_mb = static_cast<double>(file.size_bytes) / (1024.0 * 1024.0);
            return file_mb > threshold_mb;
        }
    }
    return false;
}

std::string RulesEngine::resolve(const FileInfo& file) const {
    // rule_list is kept sorted by priority, so the first match wins.
    for (const auto& rule : rule_list) {
        if (matches(rule, file)) {
            return rule.destination_folder;
        }
    }
    return "";  // no rule matched — caller decides what to do (e.g. leave in place)
}