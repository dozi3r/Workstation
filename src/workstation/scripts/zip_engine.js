// ============================================================================
// CREATOR STUDIO: ZERO-CORS OFFLINE ZIP ENGINE & CORE UTILITIES (STANDALONE PURE JAVASCRIPT)
// ============================================================================
// Provides lightweight, 100% offline, zero-dependency ZIP archive creation and
// extraction for campaign packages (.zip / .csz) under the file:/// protocol.
// Conforms to PKWARE APPNOTE.TXT specification with UTF-8 filename support.

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;

function escapeAttr(str) {
  return escapeHtml(str);
}
window.escapeAttr = escapeAttr;

function stripMapImageDataUrl(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const copy = Object.assign({}, meta);
  delete copy.dataUrl;
  if (typeof copy.url === 'string' && copy.url.startsWith('data:')) {
    delete copy.url;
  }
  return copy;
}
window.stripMapImageDataUrl = stripMapImageDataUrl;

(function() {
  const CRC_TABLE = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    CRC_TABLE[i] = c;
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function dosDateTime(date) {
    const d = date || new Date();
    const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
    const dt = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    return { time, date: dt };
  }

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  class ZeroCorsZip {
    constructor() {
      this.files = [];
    }

    /**
     * Add a file to the archive
     * @param {string} path - Relative file path (e.g. 'campaign.json', 'assets/map_root.png')
     * @param {string|Uint8Array|ArrayBuffer} data - File contents or binary buffer
     */
    addFile(path, data) {
      let uint8;
      if (typeof data === "string") {
        uint8 = textEncoder.encode(data);
      } else if (data instanceof Uint8Array) {
        uint8 = data;
      } else if (data instanceof ArrayBuffer) {
        uint8 = new Uint8Array(data);
      } else {
        uint8 = textEncoder.encode(String(data));
      }
      this.files.push({
        path: path.replace(/\\/g, "/"),
        data: uint8,
        crc: crc32(uint8),
        size: uint8.length
      });
    }

    /**
     * Build the binary ZIP archive buffer
     * @returns {Blob} application/zip Blob
     */
    generateBlob() {
      const now = dosDateTime(new Date());
      const localChunks = [];
      const centralChunks = [];
      let offset = 0;

      this.files.forEach(f => {
        const nameBytes = textEncoder.encode(f.path);
        const nameLen = nameBytes.length;
        const dataLen = f.size;

        // Local File Header (30 bytes + nameLen + dataLen)
        const localHdr = new Uint8Array(30 + nameLen);
        const lView = new DataView(localHdr.buffer);
        lView.setUint32(0, 0x04034b50, true);  // Local signature
        lView.setUint16(4, 20, true);          // Version needed (2.0)
        lView.setUint16(6, 0x0800, true);      // Flags (Bit 11 = UTF-8)
        lView.setUint16(8, 0, true);           // Compression: Store (0)
        lView.setUint16(10, now.time, true);
        lView.setUint16(12, now.date, true);
        lView.setUint32(14, f.crc, true);
        lView.setUint32(18, dataLen, true);    // Compressed size
        lView.setUint32(22, dataLen, true);    // Uncompressed size
        lView.setUint16(26, nameLen, true);
        lView.setUint16(28, 0, true);          // Extra field length
        localHdr.set(nameBytes, 30);

        localChunks.push(localHdr);
        localChunks.push(f.data);

        // Central Directory Header (46 bytes + nameLen)
        const centralHdr = new Uint8Array(46 + nameLen);
        const cView = new DataView(centralHdr.buffer);
        cView.setUint32(0, 0x02014b50, true);  // Central signature
        cView.setUint16(4, 20, true);          // Version made by
        cView.setUint16(6, 20, true);          // Version needed
        cView.setUint16(8, 0x0800, true);      // UTF-8 flag
        cView.setUint16(10, 0, true);          // Method: Store
        cView.setUint16(12, now.time, true);
        cView.setUint16(14, now.date, true);
        cView.setUint32(16, f.crc, true);
        cView.setUint32(20, dataLen, true);
        cView.setUint32(24, dataLen, true);
        cView.setUint16(28, nameLen, true);
        cView.setUint16(30, 0, true);          // Extra field length
        cView.setUint16(32, 0, true);          // Comment length
        cView.setUint16(34, 0, true);          // Disk start
        cView.setUint16(36, 0, true);          // Internal attributes
        cView.setUint32(38, 0, true);          // External attributes
        cView.setUint32(42, offset, true);     // Relative offset of local header
        centralHdr.set(nameBytes, 46);

        centralChunks.push(centralHdr);

        offset += localHdr.length + dataLen;
      });

      const centralDirSize = centralChunks.reduce((acc, c) => acc + c.length, 0);

      // End of Central Directory Record (22 bytes)
      const eocd = new Uint8Array(22);
      const eView = new DataView(eocd.buffer);
      eView.setUint32(0, 0x06054b50, true);    // EOCD signature
      eView.setUint16(4, 0, true);             // Disk number
      eView.setUint16(6, 0, true);             // Start disk
      eView.setUint16(8, this.files.length, true);  // Entries this disk
      eView.setUint16(10, this.files.length, true); // Total entries
      eView.setUint32(12, centralDirSize, true);     // Central dir size
      eView.setUint32(16, offset, true);             // Offset of central dir
      eView.setUint16(20, 0, true);             // Comment length

      const allChunks = [...localChunks, ...centralChunks, eocd];
      return new Blob(allChunks, { type: "application/zip" });
    }

    /**
     * Parse an existing ZIP archive
     * @param {ArrayBuffer} buffer
     * @returns {Promise<Object.<string, Uint8Array>>} Mapping of path -> file bytes
     */
    static async parse(buffer) {
      const view = new DataView(buffer);
      const byteLen = buffer.byteLength;
      const files = {};

      // Search for EOCD from end of file
      let eocdOffset = -1;
      for (let i = byteLen - 22; i >= Math.max(0, byteLen - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
          eocdOffset = i;
          break;
        }
      }

      if (eocdOffset === -1) {
        throw new Error("Invalid ZIP archive: End of Central Directory (EOCD) not found.");
      }

      const totalEntries = view.getUint16(eocdOffset + 10, true);
      const centralDirOffset = view.getUint32(eocdOffset + 16, true);

      let cOffset = centralDirOffset;
      for (let i = 0; i < totalEntries; i++) {
        if (view.getUint32(cOffset, true) !== 0x02014b50) break;
        const method = view.getUint16(cOffset + 10, true);
        const compSize = view.getUint32(cOffset + 20, true);
        const uncompSize = view.getUint32(cOffset + 24, true);
        const nameLen = view.getUint16(cOffset + 28, true);
        const extraLen = view.getUint16(cOffset + 30, true);
        const commentLen = view.getUint16(cOffset + 32, true);
        const localHdrOffset = view.getUint32(cOffset + 42, true);

        const nameBytes = new Uint8Array(buffer, cOffset + 46, nameLen);
        const filePath = textDecoder.decode(nameBytes);

        // Read Local Header to find exact data start
        if (view.getUint32(localHdrOffset, true) === 0x04034b50) {
          const lNameLen = view.getUint16(localHdrOffset + 26, true);
          const lExtraLen = view.getUint16(localHdrOffset + 28, true);
          const dataStart = localHdrOffset + 30 + lNameLen + lExtraLen;

          const rawData = new Uint8Array(buffer, dataStart, compSize);
          if (method === 0) {
            // Uncompressed
            files[filePath] = new Uint8Array(rawData);
          } else if (method === 8 && typeof DecompressionStream !== "undefined") {
            // DEFLATE using browser native DecompressionStream
            try {
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(rawData);
              writer.close();
              const response = new Response(ds.readable);
              const ab = await response.arrayBuffer();
              files[filePath] = new Uint8Array(ab);
            } catch(e) {
              console.warn("[ZeroCorsZip] Failed to decompress entry:", filePath, e);
            }
          } else {
            console.warn("[ZeroCorsZip] Unsupported compression method:", method, "for", filePath);
          }
        }

        cOffset += 46 + nameLen + extraLen + commentLen;
      }

      return files;
    }
  }

  window.ZeroCorsZip = ZeroCorsZip;
})();
