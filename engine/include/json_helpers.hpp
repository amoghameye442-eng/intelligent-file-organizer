#pragma once
#include <string>
#include <sstream>

// Tiny hand-rolled JSON helpers — our API's responses are simple enough
// (flat objects/arrays of strings and numbers) that pulling in a full JSON
// library isn't worth the extra dependency. Escapes just enough to be safe
// for filenames/paths (quotes, backslashes, control chars).
namespace json {

inline std::string escape(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 8);
    for (char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    char buf[8];
                    snprintf(buf, sizeof(buf), "\\u%04x", c);
                    out += buf;
                } else {
                    out += c;
                }
        }
    }
    return out;
}

inline std::string str(const std::string& s) {
    return "\"" + escape(s) + "\"";
}

} // namespace json