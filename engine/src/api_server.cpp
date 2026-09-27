#include "vendor/httplib.h"
#include "json_helpers.hpp"
#include "scanner.hpp"
#include "trie.hpp"
#include "dedupe.hpp"
#include "heap.hpp"
#include "rules_engine.hpp"
#include "transaction_log.hpp"
#include <iostream>
#include <sstream>
#ifdef _WIN32
  #include <direct.h>
#else
  #include <sys/stat.h>
#endif

using namespace httplib;

// In-memory state, rebuilt whenever /api/scan is called. Fine for a
// single-user desktop tool — not built for concurrent multi-user access.
static std::vector<FileInfo> g_files;
static Trie g_search_index;
static RulesEngine g_rules;
static TransactionLog* g_log = nullptr;
static std::string g_default_root = ".";

static void set_cors(Response& res) {
    // Allow the React dev server (different port) to call this API.
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

static void rebuild_index() {
    g_search_index = Trie();
    for (const auto& f : g_files) {
        g_search_index.insert(f.filename, f.full_path);
    }
}

static std::string file_info_json(const FileInfo& f) {
    std::ostringstream o;
    o << "{"
      << "\"path\":" << json::str(f.full_path) << ","
      << "\"filename\":" << json::str(f.filename) << ","
      << "\"extension\":" << json::str(f.extension) << ","
      << "\"size_bytes\":" << f.size_bytes
      << "}";
    return o.str();
}

int main(int argc, char* argv[]) {
    g_default_root = argc > 1 ? argv[1] : ".";

    g_rules.add_rule({RuleField::EXTENSION, "pdf", "Documents", 1});
    g_rules.add_rule({RuleField::EXTENSION, "jpg", "Photos", 1});
    g_rules.add_rule({RuleField::EXTENSION, "png", "Photos", 1});
    g_rules.add_rule({RuleField::EXTENSION, "mp4", "Videos", 1});

    Server svr;

    svr.set_pre_routing_handler([](const Request& req, Response& res) {
        set_cors(res);
        if (req.method == "OPTIONS") { res.status = 200; return Server::HandlerResponse::Handled; }
        return Server::HandlerResponse::Unhandled;
    });

    // GET /api/scan?path=C:/some/folder
    svr.Get("/api/scan", [](const Request& req, Response& res) {
        std::string path = req.has_param("path") ? req.get_param_value("path") : g_default_root;
        g_files = scan_directory(path);
        rebuild_index();

        std::ostringstream o;
        o << "{\"count\":" << g_files.size() << ",\"files\":[";
        for (size_t i = 0; i < g_files.size(); ++i) {
            if (i) o << ",";
            o << file_info_json(g_files[i]);
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // GET /api/search?prefix=rep
    svr.Get("/api/search", [](const Request& req, Response& res) {
        std::string prefix = req.has_param("prefix") ? req.get_param_value("prefix") : "";
        auto matches = g_search_index.search_by_prefix(prefix);

        std::ostringstream o;
        o << "{\"matches\":[";
        for (size_t i = 0; i < matches.size(); ++i) {
            if (i) o << ",";
            o << json::str(matches[i]);
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // GET /api/duplicates
    svr.Get("/api/duplicates", [](const Request&, Response& res) {
        std::vector<std::string> paths;
        for (const auto& f : g_files) paths.push_back(f.full_path);
        auto groups = dedupe::find_duplicates(paths);

        std::ostringstream o;
        o << "{\"groups\":[";
        for (size_t i = 0; i < groups.size(); ++i) {
            if (i) o << ",";
            o << "{\"checksum\":" << json::str(groups[i].checksum) << ",\"files\":[";
            for (size_t j = 0; j < groups[i].file_paths.size(); ++j) {
                if (j) o << ",";
                o << json::str(groups[i].file_paths[j]);
            }
            o << "]}";
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // GET /api/largest?k=5
    svr.Get("/api/largest", [](const Request& req, Response& res) {
        size_t k = req.has_param("k") ? std::stoul(req.get_param_value("k")) : 5;
        std::vector<FileEntry> entries;
        for (const auto& f : g_files) entries.push_back({f.full_path, f.size_bytes});
        auto largest = get_largest_files(entries, k);

        std::ostringstream o;
        o << "{\"files\":[";
        for (size_t i = 0; i < largest.size(); ++i) {
            if (i) o << ",";
            o << "{\"path\":" << json::str(largest[i].path)
              << ",\"size_bytes\":" << largest[i].size_bytes << "}";
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // POST /api/sort  { "root": "C:/some/folder" }
    svr.Post("/api/sort", [](const Request& req, Response& res) {
        std::string root = g_default_root;
        auto pos = req.body.find("\"root\"");
        if (pos != std::string::npos) {
            auto colon = req.body.find(':', pos);
            auto q1 = req.body.find('"', colon + 1);
            auto q2 = req.body.find('"', q1 + 1);
            if (q1 != std::string::npos && q2 != std::string::npos) {
                root = req.body.substr(q1 + 1, q2 - q1 - 1);
            }
        }

        if (!g_log) g_log = new TransactionLog(root + "/organizer_log.txt");

        std::ostringstream o;
        o << "{\"moved\":[";
        bool first = true;
        for (const auto& f : g_files) {
            std::string dest_folder = g_rules.resolve(f);
            if (dest_folder.empty()) continue;

            std::string dest_dir = root + "/" + dest_folder;
#ifdef _WIN32
            _mkdir(dest_dir.c_str());
#else
            mkdir(dest_dir.c_str(), 0755);
#endif
            std::string dest_path = dest_dir + "/" + f.filename;
            if (std::rename(f.full_path.c_str(), dest_path.c_str()) == 0) {
                g_log->record(ActionType::MOVE, f.full_path, dest_path);
                if (!first) o << ",";
                o << "{\"filename\":" << json::str(f.filename)
                  << ",\"to\":" << json::str(dest_folder) << "}";
                first = false;
            }
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // GET /api/history
    svr.Get("/api/history", [](const Request& req, Response& res) {
        std::string root = req.has_param("root") ? req.get_param_value("root") : g_default_root;
        if (!g_log) g_log = new TransactionLog(root + "/organizer_log.txt");

        std::ostringstream o;
        o << "{\"entries\":[";
        const auto& entries = g_log->entries();
        for (size_t i = 0; i < entries.size(); ++i) {
            if (i) o << ",";
            const auto& e = entries[i];
            o << "{\"id\":" << e.id
              << ",\"path_before\":" << json::str(e.path_before)
              << ",\"path_after\":" << json::str(e.path_after)
              << ",\"timestamp\":" << json::str(e.timestamp)
              << ",\"undone\":" << (e.undone ? "true" : "false") << "}";
        }
        o << "]}";
        res.set_content(o.str(), "application/json");
    });

    // POST /api/undo/:id
    svr.Post(R"(/api/undo/(\d+))", [](const Request& req, Response& res) {
        int id = std::stoi(req.matches[1]);
        bool ok = g_log && g_log->undo(id);
        res.set_content(std::string("{\"success\":") + (ok ? "true" : "false") + "}", "application/json");
    });

    std::cout << "File Organizer API running at http://localhost:8080\n";
    std::cout << "Default folder: " << g_default_root << "\n";
    svr.listen("0.0.0.0", 8080);

    return 0;
}