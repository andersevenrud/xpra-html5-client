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

import { XpraInvalidEncoderError } from '../errors'
import { XpraSendPacket, XpraPacketEncoder, XpraEncodeBit } from '../types'
import { bdecode, bencode } from '../lib/bencode'
import {
  rdecodelegacy,
  rdecodeplus,
  rencodeplus,
  rencodelegacy,
} from '../lib/rencode'

/**
 * Decodes packet data from spesified decoder
 */
export function decodeXpraPacketData(
  packetData: Uint8Array | string,
  protoFlags: number
) {
  if (protoFlags === XpraEncodeBit.RENCODELEGACY) {
    return rdecodelegacy(packetData)
  } else if (protoFlags === XpraEncodeBit.RENCODEPLUS) {
    return rdecodeplus(packetData)
  } else {
    return bdecode(packetData)
  }
}

/**
 * Encodes packet data from spesified encoder
 */
export function encodeXpraPacket(
  packet: XpraSendPacket,
  encoder: XpraPacketEncoder
): [Uint8Array | string, XpraEncodeBit] {
  switch (encoder) {
    case 'auto':
    case 'bencode':
      return [bencode(packet), XpraEncodeBit.BENCODE]

    case 'rencode':
      return [rencodelegacy(packet), XpraEncodeBit.RENCODELEGACY]

    case 'rencodeplus':
      return [rencodeplus(packet), XpraEncodeBit.RENCODEPLUS]

    default:
      throw new XpraInvalidEncoderError(`Invalid encoder: ${encoder}`)
  }
}
