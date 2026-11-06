/**
 * Pure TypeScript Zero-Dependency QR Code Generator
 * Generates clean SVG QR codes for OTP Auth URIs and other text offline.
 */

// GF(256) Math for Reed-Solomon Error Correction
const EXP_TABLE = new Uint8Array(512)
const LOG_TABLE = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x
    EXP_TABLE[i + 255] = x
    LOG_TABLE[x] = i
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0)
  }
})()

function gexp(n: number): number {
  return EXP_TABLE[n % 255]
}

function glog(n: number): number {
  if (n === 0) throw new Error('glog(0)')
  return LOG_TABLE[n]
}

function rsCompute(data: Uint8Array, numEc: number): Uint8Array {
  // Generator polynomial for numEc
  let gen = new Uint8Array([1])
  for (let i = 0; i < numEc; i++) {
    const nextGen = new Uint8Array(gen.length + 1)
    const factor = gexp(i)
    for (let j = 0; j < gen.length; j++) {
      nextGen[j] ^= gen[j]
      nextGen[j + 1] ^= gexp((glog(gen[j]) + glog(factor)) % 255)
    }
    gen = nextGen
  }

  const remainder = new Uint8Array(numEc)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0]
    for (let j = 0; j < numEc - 1; j++) {
      remainder[j] = remainder[j + 1]
    }
    remainder[numEc - 1] = 0
    if (factor !== 0) {
      const logFactor = glog(factor)
      for (let j = 0; j < numEc; j++) {
        remainder[j] ^= gexp((logFactor + glog(gen[j + 1])) % 255)
      }
    }
  }
  return remainder
}

// Table for Byte mode capacity and EC blocks (Level M)
// Supports Version 1 to 10 which covers OTP URIs up to ~270 chars
interface VersionInfo {
  version: number
  totalDataBytes: number
  ecBytesPerBlock: number
  blocks: { count: number; dataBytes: number }[]
  alignPos: number[]
}

const VERSION_TABLE: VersionInfo[] = [
  { version: 1, totalDataBytes: 16, ecBytesPerBlock: 10, blocks: [{ count: 1, dataBytes: 16 }], alignPos: [] },
  { version: 2, totalDataBytes: 28, ecBytesPerBlock: 16, blocks: [{ count: 1, dataBytes: 28 }], alignPos: [6, 18] },
  { version: 3, totalDataBytes: 44, ecBytesPerBlock: 26, blocks: [{ count: 1, dataBytes: 44 }], alignPos: [6, 22] },
  { version: 4, totalDataBytes: 64, ecBytesPerBlock: 18, blocks: [{ count: 2, dataBytes: 32 }], alignPos: [6, 26] },
  { version: 5, totalDataBytes: 86, ecBytesPerBlock: 24, blocks: [{ count: 2, dataBytes: 43 }], alignPos: [6, 30] },
  { version: 6, totalDataBytes: 108, ecBytesPerBlock: 16, blocks: [{ count: 4, dataBytes: 27 }], alignPos: [6, 34] },
  { version: 7, totalDataBytes: 124, ecBytesPerBlock: 18, blocks: [{ count: 4, dataBytes: 31 }], alignPos: [6, 22, 38] },
  { version: 8, totalDataBytes: 154, ecBytesPerBlock: 22, blocks: [{ count: 2, dataBytes: 38 }, { count: 2, dataBytes: 39 }], alignPos: [6, 24, 42] },
  { version: 9, totalDataBytes: 182, ecBytesPerBlock: 22, blocks: [{ count: 3, dataBytes: 36 }, { count: 2, dataBytes: 37 }], alignPos: [6, 26, 46] },
  { version: 10, totalDataBytes: 216, ecBytesPerBlock: 26, blocks: [{ count: 4, dataBytes: 43 }, { count: 1, dataBytes: 44 }], alignPos: [6, 28, 50] },
]

export function generateQrMatrix(text: string): boolean[][] {
  const enc = new TextEncoder().encode(text)
  const dataLen = enc.length

  // Find lowest version that fits data in Byte mode (mode indicator 4 bits + length 8 or 16 bits + data * 8 bits)
  let verInfo: VersionInfo | null = null
  for (const v of VERSION_TABLE) {
    const overhead = v.version < 10 ? 4 + 8 : 4 + 16
    const bitsNeeded = overhead + dataLen * 8
    const bytesNeeded = Math.ceil(bitsNeeded / 8)
    if (bytesNeeded <= v.totalDataBytes) {
      verInfo = v
      break
    }
  }

  if (!verInfo) {
    throw new Error('Text exceeds supported QR code size for standalone generator.')
  }

  // Build bitstream
  const bits: number[] = []
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1)
    }
  }

  // Byte mode indicator: 0100
  pushBits(0b0100, 4)
  // Character count
  pushBits(dataLen, verInfo.version < 10 ? 8 : 16)
  // Data bytes
  for (let i = 0; i < dataLen; i++) {
    pushBits(enc[i], 8)
  }
  // Terminator 0000 (up to 4 bits)
  const maxBits = verInfo.totalDataBytes * 8
  const termLen = Math.min(4, maxBits - bits.length)
  pushBits(0, termLen)
  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0)
  }
  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11]
  let padIdx = 0
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8)
    padIdx++
  }

  // Convert bits to byte stream
  const rawBytes = new Uint8Array(verInfo.totalDataBytes)
  for (let i = 0; i < rawBytes.length; i++) {
    let byte = 0
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b]
    }
    rawBytes[i] = byte
  }

  // Partition into blocks and calculate EC
  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []
  let byteOffset = 0
  for (const blk of verInfo.blocks) {
    for (let c = 0; c < blk.count; c++) {
      const d = rawBytes.slice(byteOffset, byteOffset + blk.dataBytes)
      byteOffset += blk.dataBytes
      dataBlocks.push(d)
      ecBlocks.push(rsCompute(d, verInfo.ecBytesPerBlock))
    }
  }

  // Interleave data blocks then EC blocks
  const finalBytes: number[] = []
  let maxDataLen = 0
  for (const b of dataBlocks) if (b.length > maxDataLen) maxDataLen = b.length
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of dataBlocks) {
      if (i < b.length) finalBytes.push(b[i])
    }
  }
  for (let i = 0; i < verInfo.ecBytesPerBlock; i++) {
    for (const ec of ecBlocks) {
      finalBytes.push(ec[i])
    }
  }

  // Matrix construction
  const size = verInfo.version * 4 + 17
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  )
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  )

  function setFunction(r: number, c: number, val: boolean) {
    matrix[r][c] = val
    isFunction[r][c] = true
  }

  // Finder patterns at top-left, top-right, bottom-left
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r
        const mc = col + c
        if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
          const isBlack =
            r >= 0 &&
            r <= 6 &&
            c >= 0 &&
            c <= 6 &&
            (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
          setFunction(mr, mc, isBlack)
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunction(6, i, i % 2 === 0)
    setFunction(i, 6, i % 2 === 0)
  }

  // Alignment patterns
  const positions = verInfo.alignPos
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      const r = positions[i]
      const c = positions[j]
      // Skip if overlapping finder patterns
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === positions.length - 1) ||
        (i === positions.length - 1 && j === 0)
      ) {
        continue
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBlack =
            Math.max(Math.abs(dr), Math.abs(dc)) === 2 || (dr === 0 && dc === 0)
          setFunction(r + dr, c + dc, isBlack)
        }
      }
    }
  }

  // Dark module
  setFunction(size * 4 + 17 - 8 < size ? 4 * verInfo.version + 9 : size - 8, 8, true)

  // Reserve format info area
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) setFunction(8, i, false)
    if (!isFunction[i][8]) setFunction(i, 8, false)
  }
  for (let i = size - 8; i < size; i++) {
    if (!isFunction[8][i]) setFunction(8, i, false)
  }
  for (let i = size - 7; i < size; i++) {
    if (!isFunction[i][8]) setFunction(i, 8, false)
  }

  // Place data bits with zigzag scanning
  const finalBits: number[] = []
  for (const b of finalBytes) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((b >>> i) & 1)
    }
  }

  let bitIdx = 0
  let upward = true
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right-- // Skip vertical timing column
    const colList = [right, right - 1]
    const rowList = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i)

    for (const r of rowList) {
      for (const c of colList) {
        if (!isFunction[r][c]) {
          const val = bitIdx < finalBits.length ? finalBits[bitIdx] === 1 : false
          matrix[r][c] = val
          bitIdx++
        }
      }
    }
    upward = !upward
  }

  // Apply Mask Pattern (Mask 0: (row + col) % 2 === 0)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c]) {
        const mask = (r + c) % 2 === 0
        if (mask) {
          matrix[r][c] = !matrix[r][c]
        }
      }
    }
  }

  // Format info for EC Level M (00) and Mask 0 (000) => 00000 + BCH(15, 5) => 0x4a44 (XOR with 0x5412 => 0x1e56)
  // Precomputed 15-bit format bits for Level M, Mask 0:
  // Format info string for (EC M = 00, Mask 000) is: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]

  // Top-left format info
  for (let i = 0; i <= 5; i++) matrix[8][i] = formatBits[i] === 1
  matrix[8][7] = formatBits[6] === 1
  matrix[8][8] = formatBits[7] === 1
  matrix[7][8] = formatBits[8] === 1
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1

  // Second copy of format info (split across bottom-left and top-right)
  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1
  for (let i = 7; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1

  return matrix.map((row) => row.map((cell) => cell ?? false))
}

/**
 * Generates an SVG string representation of the QR code.
 */
export function generateQrSvg(text: string, options: { size?: number; margin?: number } = {}): string {
  const matrix = generateQrMatrix(text)
  const moduleCount = matrix.length
  const margin = options.margin ?? 3
  const totalSize = moduleCount + margin * 2
  const targetPx = options.size ?? 200

  let pathData = ''
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${targetPx}" height="${targetPx}" shape-rendering="crispEdges">
    <rect width="${totalSize}" height="${totalSize}" fill="#ffffff"/>
    <path d="${pathData.trim()}" fill="#0f172a"/>
  </svg>`
}
