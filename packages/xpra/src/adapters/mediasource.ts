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

import { getBrowser, getBrowserPlatform } from '../utils/browser'
import { XpraAudioAdapter } from '../io/audioAdapter'
import { XpraInvalidAudioCodecError, XpraAudioError } from '../errors'
import { XpraAudioCodecMap } from '../types'
import {
  XPRA_AUDIO_CODEC_STRING,
  XPRA_AUDIO_CODEC_DESCRIPTION,
} from '../constants'

/**
 * MediaSource Audio Adapter
 */
export class XpraMediaSourceAdapter extends XpraAudioAdapter {
  private mediaSource: MediaSource | null = null
  private mediaSourceReady = false
  private mediaSourceBuffer: SourceBuffer | null = null

  async setup() {
    const mediaSource = new MediaSource()

    const attach = () =>
      new Promise<SourceBuffer>((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', () => {
          console.debug('XpraAudio -> MediaSource', 'Source opened')
          if (this.mediaSourceReady) {
            reject(new XpraAudioError('MediaSource already open'))
          } else {
            const codec = (XPRA_AUDIO_CODEC_STRING as Record<string, string>)[
              this.audioCodec
            ]

            if (codec) {
              try {
                const asb = mediaSource.addSourceBuffer(codec)
                asb.mode = 'sequence'
                asb.addEventListener('error', (e) => {
                  console.error('XpraAudio -> MediaSource -> SourceBuffer', e)
                })

                resolve(asb)
              } catch (e) {
                reject(e)
              }
            } else {
              reject(
                new XpraInvalidAudioCodecError(
                  `Media codec '${this.audioCodec}' unsupported`
                )
              )
            }
          }
        })
      })

    this.mediaSource = mediaSource
    this.audio.src = window.URL.createObjectURL(this.mediaSource)
    this.mediaSourceBuffer = await attach()
    this.mediaSourceReady = true
  }

  async start() {
    try {
      await this.audio.play()
    } catch (e) {
      console.error('XpraAudio#start', 'audio start error', e)
    }
  }

  stop() {
    super.stop()

    if (this.mediaSource) {
      try {
        if (this.mediaSourceBuffer) {
          this.mediaSource.removeSourceBuffer(this.mediaSourceBuffer)
        }

        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream()
        }
      } catch (e) {
        console.error('XpraMediaSourceAdapter', e)
      }
    }

    this.mediaSource = null
    this.mediaSourceBuffer = null
    this.mediaSourceReady = false
  }

  protected pushBuffer(buffer: Uint8Array) {
    if (this.mediaSourceBuffer) {
      this.mediaSourceBuffer.appendBuffer(buffer)
    }
  }

  protected isReady() {
    return !!this.mediaSourceBuffer && !this.mediaSourceBuffer.updating
  }

  static getBlacklistedCodecs(ignoreBlacklist: boolean) {
    const browser = getBrowser()
    const platform = getBrowserPlatform()
    const isFirefox = browser.name === 'Firefox'
    const isSafari = browser.name === 'Safari'
    const isChrome = browser.name === 'Chrome'
    const isMac = platform.type === 'darwin'
    const blacklist: string[] = []

    if (!ignoreBlacklist) {
      if (isFirefox || isSafari) {
        blacklist.push('opus+mka', 'vorbis+mka')
        if (isSafari) {
          //this crashes Safari!
          blacklist.push('wav')
        }
      } else if (isChrome) {
        blacklist.push('aac+mpeg4')
        if (isMac) {
          blacklist.push('opus+mka')
        }
      }
    }

    return blacklist
  }

  static getCodecs(ignoreBlacklist = false): XpraAudioCodecMap {
    if (self.MediaSource) {
      const blacklist = this.getBlacklistedCodecs(ignoreBlacklist)

      const found = Object.entries(XPRA_AUDIO_CODEC_STRING)
        .filter(([, v]) => MediaSource.isTypeSupported(v))
        .filter(([k]) => !blacklist.includes(k))

      return Object.fromEntries(found)
    }

    return {}
  }

  static getSupportedCodecs(ignoreBlacklist = false) {
    const entries = Object.keys(
      XpraMediaSourceAdapter.getCodecs(ignoreBlacklist)
    ).map((k) => [`mediasource:${k}`, XPRA_AUDIO_CODEC_DESCRIPTION[k]])

    return Object.fromEntries(entries)
  }
}
