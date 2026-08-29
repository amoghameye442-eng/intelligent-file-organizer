#include "sha256.hpp"
#include <fstream>
#include <sstream>
#include <iomanip>
#include <cstring>

namespace {

// Round constants defined by the SHA-256 spec (first 32 bits of the
// fractional parts of the cube roots of the first 64 primes).
constexpr uint32_t K[64] = {
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
};

inline uint32_t rotr(uint32_t x, uint32_t n) { return (x >> n) | (x << (32 - n)); }

} // namespace

SHA256::SHA256() : bit_length(0), buffer_length(0) {
    // Initial hash values: first 32 bits of the fractional parts of the
    // square roots of the first 8 primes.
    state[0] = 0x6a09e667; state[1] = 0xbb67ae85;
    state[2] = 0x3c6ef372; state[3] = 0xa54ff53a;
    state[4] = 0x510e527f; state[5] = 0x9b05688c;
    state[6] = 0x1f83d9ab; state[7] = 0x5be0cd19;
    std::memset(buffer, 0, sizeof(buffer));
}

void SHA256::process_block(const uint8_t* block) {
    uint32_t w[64];
    for (int i = 0; i < 16; ++i) {
        w[i] = (block[i * 4] << 24) | (block[i * 4 + 1] << 16) |
               (block[i * 4 + 2] << 8) | (block[i * 4 + 3]);
    }
    for (int i = 16; i < 64; ++i) {
        uint32_t s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >> 3);
        uint32_t s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >> 10);
        w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }

    uint32_t a = state[0], b = state[1], c = state[2], d = state[3];
    uint32_t e = state[4], f = state[5], g = state[6], h = state[7];

    for (int i = 0; i < 64; ++i) {
        uint32_t S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        uint32_t ch = (e & f) ^ (~e & g);
        uint32_t temp1 = h + S1 + ch + K[i] + w[i];
        uint32_t S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        uint32_t maj = (a & b) ^ (a & c) ^ (b & c);
        uint32_t temp2 = S0 + maj;

        h = g; g = f; f = e; e = d + temp1;
        d = c; c = b; b = a; a = temp1 + temp2;
    }

    state[0] += a; state[1] += b; state[2] += c; state[3] += d;
    state[4] += e; state[5] += f; state[6] += g; state[7] += h;
}

void SHA256::update(const uint8_t* data, size_t length) {
    bit_length += static_cast<uint64_t>(length) * 8;

    while (length > 0) {
        size_t space = 64 - buffer_length;
        size_t to_copy = length < space ? length : space;
        std::memcpy(buffer + buffer_length, data, to_copy);
        buffer_length += to_copy;
        data += to_copy;
        length -= to_copy;

        if (buffer_length == 64) {
            process_block(buffer);
            buffer_length = 0;
        }
    }
}

std::string SHA256::hexdigest() {
    // Padding: a single 1-bit, then zeros, then the original bit length,
    // per the SHA-256 spec, so the final message length is a multiple of
    // 512 bits (64 bytes).
    uint64_t original_bit_length = bit_length;
    uint8_t pad_byte = 0x80;
    update(&pad_byte, 1);

    uint8_t zero = 0;
    while (buffer_length != 56) {
        update(&zero, 1);
    }

    uint8_t length_bytes[8];
    for (int i = 0; i < 8; ++i) {
        length_bytes[7 - i] = static_cast<uint8_t>(original_bit_length >> (i * 8));
    }
    update(length_bytes, 8);

    std::ostringstream out;
    out << std::hex << std::setfill('0');
    for (int i = 0; i < 8; ++i) {
        out << std::setw(8) << state[i];
    }
    return out.str();
}

std::string SHA256::hash_file(const std::string& file_path) {
    std::ifstream file(file_path, std::ios::binary);
    if (!file) {
        return "";  // caller should treat empty string as "couldn't read file"
    }

    SHA256 hasher;
    std::vector<uint8_t> chunk(8192);

    while (file.read(reinterpret_cast<char*>(chunk.data()), chunk.size()) || file.gcount() > 0) {
        hasher.update(chunk.data(), static_cast<size_t>(file.gcount()));
    }

    return hasher.hexdigest();
}