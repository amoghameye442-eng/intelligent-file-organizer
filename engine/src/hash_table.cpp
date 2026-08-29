#include "hash_table.hpp"

HashTable::HashTable(size_t bucket_count) : buckets(bucket_count) {}

size_t HashTable::hash(const std::string& key) const {
    // Polynomial rolling hash: treat the string as a number in base 31.
    // 31 is a common choice because it's prime (helps spread values evenly)
    // and (31 * x) can be computed efficiently.
    size_t hash_value = 0;
    const size_t prime = 31;

    for (char ch : key) {
        hash_value = hash_value * prime + static_cast<unsigned char>(ch);
    }

    return hash_value % buckets.size();
}

void HashTable::insert(const std::string& key, const std::string& file_path) {
    size_t index = hash(key);
    Bucket& bucket = buckets[index];

    // Look for an existing entry with this exact key in the bucket's chain.
    for (auto& entry : bucket) {
        if (entry.first == key) {
            entry.second.push_back(file_path);
            return;
        }
    }

    // No existing entry for this key — this is a brand new checksum.
    bucket.emplace_back(key, std::vector<std::string>{file_path});
    key_count++;
}

std::vector<std::string> HashTable::get(const std::string& key) const {
    size_t index = hash(key);
    const Bucket& bucket = buckets[index];

    for (const auto& entry : bucket) {
        if (entry.first == key) {
            return entry.second;
        }
    }
    return {};
}

bool HashTable::contains(const std::string& key) const {
    size_t index = hash(key);
    const Bucket& bucket = buckets[index];

    for (const auto& entry : bucket) {
        if (entry.first == key) {
            return true;
        }
    }
    return false;
}