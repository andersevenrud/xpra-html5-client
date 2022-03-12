/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 *
 * ---
 *
 * Based on original Xpra source
 * @copyright Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
 * @license Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
 * @link https://github.com/Xpra-org/xpra-html5
 */

import * as zlib from 'pako'
import * as brotli from '../lib/brotli'
import lz4 from '../lib/lz4'
import { XpraInflateBit, XpraRecievePacket } from '../types'

export function decompressXpraPacketData(
  packetData: Uint8Array,
  level: number
): Uint8Array {
  if (level != 0) {
    if (level & XpraInflateBit.LZ4) {
      return lz4.decode(packetData)
    } else if (level & XpraInflateBit.BROTLI) {
      // FIXME: Override typing from module
      return brotli.decompress(packetData as any) as unknown as Uint8Array
    } else {
      return zlib.inflate(packetData as zlib.Data)
    }
  }

  return packetData
}

export function decompressXpraDrawData(packet: XpraRecievePacket) {
  const data = packet[7]
  const options = packet[10] || {}

  if (options.zlib > 0) {
    return zlib.inflate(data)
  } else if (options.lz4 > 0) {
    return lz4.decode(data)
  }

  return data
}
