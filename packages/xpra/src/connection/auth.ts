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
import { xorString, createRandomSecureString } from '../utils/data'
import { XpraChallengeError } from '../errors'
import { XpraChallengeCallback, XpraChallengePrompt } from '../types'

/**
 * Creates a digest from a challenge
 */
export function createXpraChallengeDigest(
  digest: string,
  password: string,
  salt: string
) {
  if (digest.startsWith('hmac')) {
    let hash = 'md5'
    if (digest.indexOf('+') > 0) {
      hash = digest.split('+')[1]
    }
    const hmac = forge.hmac.create()
    hmac.start(hash, password)
    hmac.update(salt)
    return hmac.digest().toHex()
  } else if (digest == 'xor') {
    const trimmed_salt = salt.slice(0, password.length)
    return xorString(trimmed_salt, password)
  }

  return null
}

/**
 * Processes a connection challenge and creates data
 * for an appropriate response
 */
export function createXpraChallengeResponse(
  serverSalt: string,
  digest: string,
  saltDigest: string,
  password: string,
  useSsl: boolean,
  useEncryption: string | null
) {
  if (!password) {
    throw new XpraChallengeError('Invalid login')
  }

  if (saltDigest === 'xor') {
    if (digest === 'xor') {
      if (!useSsl && !useEncryption) {
        throw new XpraChallengeError(
          'Aborted challenge because xor is not safe in this environment'
        )
      }
    }

    if (serverSalt.length < 16 || serverSalt.length > 256) {
      throw new XpraChallengeError(
        `Invalid challenge xor salt length: ${serverSalt.length}`
      )
    }
  }

  const clientSaltLength = saltDigest === 'xor' ? serverSalt.length : 32
  const clientSalt = createRandomSecureString(clientSaltLength)
  const salt = createXpraChallengeDigest(saltDigest, clientSalt, serverSalt)

  let challengeResponse = null
  if (salt) {
    challengeResponse = createXpraChallengeDigest(digest, password, salt)
  }

  if (!challengeResponse) {
    throw new XpraChallengeError('Could not challenge server auth attempt')
  }

  return [challengeResponse, clientSalt]
}

/**
 * Processes and handles a keycloak challenge attempt
 */
export function handleXpraKeycloakChallenge(
  challenge: XpraChallengePrompt,
  cb: XpraChallengeCallback
) {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const error = params.get('error')
  const error_description = params.get('error_description')

  if (error) {
    cb(JSON.stringify({ error, error_description }))
  } else if (!code) {
    window.location.href = challenge.serverSalt
  } else {
    history.replaceState({}, '', window.location.pathname)
    cb(JSON.stringify({ code }))
  }
}
