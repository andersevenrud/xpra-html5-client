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

import forge from 'node-forge'
import { XpraCipherCapability } from '../types'
import { XpraCryptoError } from '../errors'
import { uint8toString } from '../utils/data'
import {
  XPRA_DEFAULT_KEYSIZE,
  XPRA_DEFAULT_KEY_HASH,
  XPRA_DEFAULT_MODE,
  XPRA_CHUNK_SZ,
} from '../constants'

export type XpraCipherInstance = any

export interface XpraCipher {
  cipher: string
  mode: string
  blockSize: number
  secret: string
  iv: string
}

/**
 * Encrypts packet data with a cipher
 */
export function encryptXpraPacketData(
  data: Uint8Array | string,
  size: number,
  blockSize: number,
  cipher: XpraCipherInstance
) {
  const paddingSize = blockSize - (size % blockSize)

  let inputData = data
  if (typeof inputData !== 'string') {
    const c = []
    for (let i = 0; i < data.length; i += XPRA_CHUNK_SZ) {
      c.push(
        String.fromCharCode.apply(
          null,
          (data as Uint8Array).subarray(
            i,
            i + XPRA_CHUNK_SZ
          ) as unknown as number[]
        )
      )
    }
    inputData = c.join('')
  }

  if (paddingSize) {
    const paddingChr = String.fromCharCode(paddingSize)
    for (let i = 0; i < paddingSize; i++) {
      inputData += paddingChr
    }
  }

  cipher.update(forge.util.createBuffer(inputData), 'utf8')
  return cipher.output.getBytes()
}

/**
 * Decrypts packet data with a cipher
 */
export function decryptXpraPacketData(
  packet: Uint8Array,
  size: number,
  padding: number,
  cipher: XpraCipherInstance
) {
  cipher.update(forge.util.createBuffer(uint8toString(packet)))

  const decrypted = cipher.output.getBytes()
  if (!decrypted || decrypted.length < size - padding) {
    throw new XpraCryptoError('Decryption failure')
  }

  const packetData = new Uint8Array(size - padding)
  for (let i = 0; i < size - padding; i++) {
    packetData[i] = decrypted[i].charCodeAt(0)
  }

  return packetData
}

/**
 * Validates and creates cipher data
 */
export function createXpraCipher(
  caps: XpraCipherCapability,
  key: string
): XpraCipher {
  if (!key) {
    throw new XpraCryptoError('Missing crypto key')
  }

  const cipher = caps['cipher'] || 'AES'
  const keySalt = caps['cipher.key_salt']
  const iterations = caps['cipher.key_stretch_iterations'] || 0
  const keySize = caps['cipher.key_size'] || XPRA_DEFAULT_KEYSIZE
  const keyStretch = caps['cipher.key_stretch'] || 'PBKDF2'
  const keyHash = (
    caps['cipher.key_hash'] || XPRA_DEFAULT_KEY_HASH
  ).toLowerCase()
  const mode = caps['cipher.mode'] || XPRA_DEFAULT_MODE
  const iv = caps['cipher.iv']

  if (cipher !== 'AES') {
    throw new XpraCryptoError(`Unsupported crypto cipher: ${cipher}`)
  } else if (iterations < 0) {
    throw new XpraCryptoError(`Invalid crypto iteration count: ${iterations}`)
  } else if ([32, 24, 16].indexOf(keySize) < 0) {
    throw new XpraCryptoError(`Invalid crypto key size: ${keySize}`)
  } else if (keyStretch.toUpperCase() != 'PBKDF2') {
    throw new XpraCryptoError(`Invalid key stretching function: ${keyStretch}`)
  } else if (!iv) {
    throw new XpraCryptoError('Missing IV')
  } else if (['CBC', 'CFB', 'CTR'].indexOf(mode) < 0) {
    throw new XpraCryptoError(`Unsupported AES mode: ${mode}`)
  }

  const blockSize = mode === 'CBC' ? 32 : 0
  const secret = forge.pkcs5.pbkdf2(key, keySalt, iterations, keySize, keyHash)

  return {
    cipher,
    mode,
    blockSize,
    secret,
    iv,
  }
}
