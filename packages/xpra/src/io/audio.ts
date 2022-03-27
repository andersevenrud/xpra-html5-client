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
import { XPRA_AUDIO_PREFERRED_CODEC_ORDER } from '../constants/xpra'
import {
  XpraServerCapabilities,
  XpraAudioFramework,
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
  private adapter: XpraAudioAdapter | null = null
  private audioCodec: XpraAudioCodecType | null = null

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
    this.adapter = null
    this.emit('stop')
  }

  async setup(serverCapabilities: XpraServerCapabilities) {
    try {
      const detected = this.detect(serverCapabilities)
      if (detected) {
        const [codec, Adapter] = detected
        const adapter = new Adapter(this.audio, codec)

        await adapter.setup()

        this.adapter = adapter
        this.audioCodec = codec
        this.emit('start')
      }
    } catch (e) {
      console.error('XpraAudio#setup', e)
      this.stop()
    }
  }

  async start() {
    if (this.adapter) {
      this.adapter.start()
    } else {
      this.stop()
    }
  }

  private detect(serverCapabilities: XpraServerCapabilities) {
    const adapters = XpraAudio.getAudioAdapters()
    let codec = XpraAudio.detectCodec(serverCapabilities)

    if (codec) {
      const found = Object.entries(adapters).find(
        ([, v]) => !!v.getCodecs()[codec as string]
      )

      if (found) {
        let [name, adapter] = found
        const supported = adapter.getSupportedCodecs()
        const best = XpraAudio.getBestCodec(supported)

        if (best) {
          ;[name, codec] = best.split(':') as [
            XpraAudioFramework,
            XpraAudioCodecType
          ]
        }

        return [codec, adapters[name]] as [
          XpraAudioCodecType,
          typeof XpraAudioAdapter
        ]
      }
    }

    return null
  }

  addQueue(buffer: Uint8Array, metadata?: XpraAudioMetadata) {
    if (this.adapter) {
      this.adapter.addQueue(buffer, metadata)
    }
  }

  private static detectCodec(serverCapabilities: XpraServerCapabilities) {
    if (serverCapabilities['sound.send']) {
      const encoders = serverCapabilities['sound.encoders']
      const defaultCodec = XpraAudio.getDefaultAudioCodec()

      if (defaultCodec) {
        return XpraAudio.getPreferedServerCodec(encoders) || defaultCodec
      }
    }

    return null
  }

  private static getPreferedServerCodec(encoders: string[]) {
    const codecs = XpraAudio.getAudioCodecs()
    return XPRA_AUDIO_PREFERRED_CODEC_ORDER.find((codec) => {
      if (codecs.includes(codec) && encoders.includes(codec)) {
        return true
      }

      return false
    })
  }

  private static getBestCodec(supported: Record<string, string>) {
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

  private static getDefaultAudioCodec() {
    const keys = XpraAudio.getAudioCodecs()
    if (keys.length > 0) {
      const found = XPRA_AUDIO_PREFERRED_CODEC_ORDER.find((c) =>
        keys.includes(c)
      )
      return found || keys[0]
    }

    return null
  }

  private static getAudioAdapters(): Record<
    XpraAudioCodecType,
    // FIXME: Find a better way to type the values
    typeof XpraMediaSourceAdapter | typeof XpraAuroraAdapter
  > {
    return {
      mediasource: XpraMediaSourceAdapter,
      aurora: XpraAuroraAdapter,
    }
  }

  static getAudioCodecs(): XpraAudioCodecType[] {
    return Object.values(XpraAudio.getAudioAdapters()).flatMap((a) =>
      Object.keys(a.getCodecs())
    )
  }
}
