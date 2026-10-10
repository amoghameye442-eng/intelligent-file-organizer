// MOCK API for the Search view.
//
// The real version will ask the C++ engine's Trie for every file name that
// STARTS WITH the text the user typed (a "prefix search"). That endpoint is not
// defined yet, so no URL is invented here. Until then, searchFiles() filters
// the mock data and answers after a short delay, like a real network call.
//
// The contract the page relies on (PROPOSED, to agree with Amogh):
//   searchFiles(prefix)  ->  Promise of an array of { id, name, path, sizeBytes, type }
//
// When the real API exists, ONLY this file changes: call the real endpoint with
// `prefix` and return its list. Search.jsx and the components stay the same.

import { mockSearchFiles } from "../mock/searchData"

export function searchFiles(prefix) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrefix = prefix.toLowerCase()

      // Same result a Trie gives: names that START with the prefix,
      // ignoring upper/lower case, in alphabetical order.
      const matches = mockSearchFiles
        .filter((file) => file.name.toLowerCase().startsWith(lowerPrefix))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

      resolve(matches)
    }, 400)
  })
}
