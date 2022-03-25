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

import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { XpraAudioAdapter } from './audio/adapter'
import { XpraAuroraAdapter } from './audio/aurora'
import { XpraMediaSourceAdapter } from './audio/mediasource'
import { XPRA_AUDIO_PREFERRED_CODEC_ORDER } from '../constants'
import {
  XpraServerCapabilities,
  XpraAudioFramework,
  XpraAudioCodecMap,
  XpraAudioCodecType,
  XpraAudioMetadata,
} from '../types'

export type XpraAudioEventEmitters = {
  start: () => void
  stop: () => void
}

/**
 * Provides audio playback for a client session
 * @noInheritDoc
 */
export class XpraAudio extends (EventEmitter as unknown as new () => TypedEmitter<XpraAudioEventEmitters>) {
  private readonly audio: HTMLAudioElement = document.createElement('audio')
  private enabled = false
  private adapter: XpraAudioAdapter | null = null
  private audioCodec: XpraAudioCodecType | null = null
  private audioFramework: XpraAudioFramework | null = null
  private auroraCodecs: XpraAudioCodecMap = XpraAuroraAdapter.getCodecs()
  private mediaCodecs: XpraAudioCodecMap = XpraMediaSourceAdapter.getCodecs()

  private detectedCodecs: XpraAudioCodecMap = {
    ...this.mediaCodecs,
    ...this.auroraCodecs,
  }

  async init() {
    this.audio.setAttribute('autoplay', String(true))

    this.audio.addEventListener('play', () => {
      console.info('XpraAudio -> <audio>', 'playing')
    })

    this.audio.addEventListener('error', (ev: ErrorEvent) => {
      console.error('XpraAudio -> <audio>', ev)
      this.stop()
    })
  }

  validate(codec: XpraAudioCodecType) {
    if (codec !== this.audioCodec) {
      console.error('XpraAudio#validate', 'invalid codec', codec)
      this.stop()

      return false
    }

    return true
  }

  stop() {
    if (this.adapter) {
      this.adapter.stop()
    }
    this.enabled = false
    this.adapter = null
    this.emit('stop')
  }

  async setup(serverCapabilities: XpraServerCapabilities) {
    if (serverCapabilities['sound.send']) {
      const encoders = serverCapabilities['sound.encoders']
      const defaultCodec = this.getDefaultAudioCodec()

      if (defaultCodec) {
        const detected = this.getPreferedServerCodec(encoders) || defaultCodec

        if (detected) {
          this.enabled = true
          this.audioCodec = detected
          this.audioFramework = this.auroraCodecs[detected]
            ? 'aurora'
            : 'mediasource'
        }
      }
    }

    if (this.enabled) {
      let supported = {}
      if (this.audioFramework === 'mediasource') {
        supported = XpraMediaSourceAdapter.getSupportedCodecs()
      } else if (this.audioFramework === 'aurora') {
        supported = XpraAuroraAdapter.getSupportedCodecs()
      }

      const best = this.getBestCodec(supported)

      if (best) {
        const [framework, codec] = best.split(':')
        this.audioFramework = framework as XpraAudioFramework
        this.audioCodec = codec as XpraAudioCodecType
      }

      if (this.audioCodec) {
        if (this.audioFramework === 'mediasource') {
          this.adapter = new XpraMediaSourceAdapter(this.audio, this.audioCodec)
        } else if (this.audioFramework === 'aurora') {
          this.adapter = new XpraAuroraAdapter(this.audio, this.audioCodec)
        }
      }

      try {
        if (this.adapter) {
          await this.adapter.setup()
          this.emit('start')
        }
      } catch (e) {
        console.error('XpraAudio#setup', e)
        this.stop()
      }
    }
  }

  async start() {
    if (this.adapter) {
      this.adapter.start()
    } else {
      this.stop()
    }
  }

  addQueue(buffer: Uint8Array, metadata?: XpraAudioMetadata) {
    if (this.adapter) {
      this.adapter.addQueue(buffer, metadata)
    }
  }

  getDecoders() {
    return Object.keys(this.detectedCodecs)
  }

  getPreferedServerCodec(encoders: string[]) {
    return XPRA_AUDIO_PREFERRED_CODEC_ORDER.find((codec) => {
      if (codec in this.detectedCodecs && encoders.includes(codec)) {
        return true
      }

      return false
    })
  }

  getBestCodec(supported: Record<string, string>) {
    let best = null
    let bestDistance = XPRA_AUDIO_PREFERRED_CODEC_ORDER.length

    for (const k in supported) {
      const [, cs] = k.split(':')
      const distance = XPRA_AUDIO_PREFERRED_CODEC_ORDER.indexOf(cs)
      if (distance >= 0 && distance < bestDistance) {
        best = k
        bestDistance = distance
      }
    }

    return best
  }

  getDefaultAudioCodec() {
    const keys = Object.keys(this.detectedCodecs)
    if (keys.length > 0) {
      const found = XPRA_AUDIO_PREFERRED_CODEC_ORDER.find((c) =>
        keys.includes(c)
      )
      return found || keys[0]
    }

    return null
  }
}
