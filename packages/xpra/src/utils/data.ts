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

import { XPRA_CHUNK_SZ } from '../constants/xpra'

export function arrayBufferToBase64(uintArray: Uint8Array) {
  // apply in chunks of 10400 to avoid call stack overflow
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
  let s = ''
  const skip = 10400
  if (uintArray.subarray) {
    for (let i = 0, len = uintArray.length; i < len; i += skip) {
      s += String.fromCharCode.apply(
        null,
        uintArray.subarray(i, Math.min(i + skip, len)) as unknown as number[]
      )
    }
  } else {
    for (let i = 0, len = uintArray.length; i < len; i += skip) {
      s += String.fromCharCode.apply(
        null,
        uintArray.slice(i, Math.min(i + skip, len)) as unknown as number[]
      )
    }
  }
  return window.btoa(s)
}

export function uint8toString(u8a: Uint8Array) {
  const c = []
  for (let i = 0; i < u8a.length; i += XPRA_CHUNK_SZ) {
    c.push(
      String.fromCharCode.apply(
        null,
        u8a.subarray(i, i + XPRA_CHUNK_SZ) as unknown as number[]
      )
    )
  }
  return c.join('')
}

export function uint8fromString(input: string) {
  const uint = new Uint8Array(input.length)
  for (let i = 0; i < input.length; ++i) {
    uint[i] = input.charCodeAt(i)
  }
  return uint
}

export function uint8fromStringOrString(input: string | Uint8Array) {
  if (input instanceof Uint8Array) {
    return uint8toString(input)
  }

  return input
}

export function uint8fromStringOrUint8(input: string | Uint8Array) {
  if (typeof input === 'string') {
    return uint8fromString(input)
  }

  return input
}

export function createHexUUID() {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      s[i] = '-'
    } else {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
  }
  return s.join('')
}

export function createRandomSecureString(len: number) {
  const crypto = window.crypto || window.mscrypto

  if (!crypto) {
    let s = ''
    while (s.length < len) {
      s += createHexUUID()
    }
    return s.substr(0, len)
  }

  const u = new Uint8Array(len)
  crypto.getRandomValues(u)

  return String.fromCharCode.apply(null, u as unknown as number[])
}

export function xorString(str1: string, str2: string) {
  let result = ''
  if (str1.length !== str2.length) {
    throw new TypeError('strings must be equal length')
  }
  for (let i = 0; i < str1.length; i++) {
    result += String.fromCharCode(str1[i].charCodeAt(0) ^ str2[i].charCodeAt(0))
  }
  return result
}

// FIXME: Find a modern replacement
export const unescapeUri = (s: string) => unescape(encodeURIComponent(s))
