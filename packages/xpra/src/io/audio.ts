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

import '../lib/aurora/aurora'
import '../lib/aurora/aac'
import '../lib/aurora/mp3'
import '../lib/aurora/flac'
import '../lib/aurora/aurora-xpra'
import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { uint8fromString } from '../utils/data'
import { XPRA_MAX_AUDIO_BUFFERS } from '../constants'
import { XpraInvalidAudioCodecError, XpraAudioError } from '../errors'
import {
  XpraServerCapabilities,
  XpraAudioFramework,
  XpraAudioCodecMap,
  XpraAudioCodecType,
  XpraAudioMetadata,
} from '../types'
import {
  getMediaSourceAudioCodecs,
  getDefaultAudioCodec,
  getMediaSourceClass,
  getAuroraAudioCodecs,
  getMediaSource,
  get_supported_codecs,
  get_best_codec,
  CODEC_STRING,
  PREFERRED_CODEC_ORDER,
} from '../lib/media'

export type XpraAudioEventEmitters = {
  start: () => void
  stop: () => void
}

const AV = self.AV

const CONCAT = true

const hasMS = !!getMediaSourceClass()

const hasAV =
  typeof AV !== 'undefined' &&
  AV != null &&
  AV.Decoder != null &&
  AV.Player.fromXpraSource != null

/**
 * Provides audio buffer queues to adapters
 */
export abstract class XpraAudioAdapter {
  protected readonly audio: HTMLAudioElement
  protected readonly audioCodec: XpraAudioCodecType

  // TODO: Move this to a worker queue
  private audioBuffer: Uint8Array[] = []
  private audioBufferCount = 0

  constructor(audio: HTMLAudioElement, codec: XpraAudioCodecType) {
    this.audio = audio
    this.audioCodec = codec
  }

  async setup() {
    console.warn('XpraAudioAdapter#setup', 'unhandled event')
  }

  async start() {
    console.warn('XpraAudioAdapter#start', 'unhandled event')
  }

  stop() {
    this.audio.pause()
    this.audioBuffer = []
    this.audioBufferCount = 0
    this.audio.src = ''
  }

  addQueue(buffer: Uint8Array, metadata?: XpraAudioMetadata) {
    let minStartBuffers = 4
    if (this.audioBuffer.length >= XPRA_MAX_AUDIO_BUFFERS) {
      throw new XpraAudioError('Buffer queue overflow')
    }

    if (metadata) {
      for (let i = 0; i < metadata.length; i++) {
        this.audioBuffer.push(uint8fromString(metadata[i]))
      }

      minStartBuffers = 1
    }

    this.audioBuffer.push(buffer)
    this.processQueue(minStartBuffers)
  }

  protected pushBuffer(_buffer: Uint8Array) {
    console.warn('XpraAudioAdapter#pushBuffer', 'unhandled event')
  }

  private processQueue(minStartBuffers: number) {
    if (
      this.isReady() &&
      (this.audioBufferCount > 0 || this.audioBuffer.length >= minStartBuffers)
    ) {
      if (CONCAT) {
        let buf
        if (this.audioBuffer.length == 1) {
          buf = this.audioBuffer[0]
        } else {
          let size = 0
          for (let i = 0, j = this.audioBuffer.length; i < j; ++i) {
            size += this.audioBuffer[i].length
          }
          buf = new Uint8Array(size)
          size = 0
          for (let i = 0, j = this.audioBuffer.length; i < j; ++i) {
            const v = this.audioBuffer[i]
            if (v.length > 0) {
              buf.set(v, size)
              size += v.length
            }
          }
        }

        this.audioBufferCount += 1
        this.pushBuffer(buf)
      } else {
        this.audioBufferCount += this.audioBuffer.length
        for (let i = 0, j = this.audioBuffer.length; i < j; ++i) {
          if (this.audioBuffer[i]) {
            this.pushBuffer(this.audioBuffer[i])
          }
        }
      }

      this.audioBuffer = []
    }
  }

  protected isReady() {
    return false
  }
}

/**
 * MediaSource Audio Adapter
 */
export class XpraMediaSourceAdapter extends XpraAudioAdapter {
  private mediaSource: MediaSource | null = null
  private mediaSourceReady = false
  private mediaSourceBuffer: SourceBuffer | null = null

  async setup() {
    const mediaSource = getMediaSource() as MediaSource

    const attach = () =>
      new Promise<SourceBuffer>((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', () => {
          console.debug('XpraAudio -> MediaSource', 'Source opened')
          if (this.mediaSourceReady) {
            reject(new XpraAudioError('MediaSource already open'))
          } else {
            const codec = (CODEC_STRING as Record<string, string>)[
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
}

/**
 * Aurora Audio Adapter
 */
export class XpraAuroraAdapter extends XpraAudioAdapter {
  private auroraSource: AuroraSource | null = null

  async setup() {
    this.auroraSource = AV.Player.fromXpraSource()
  }

  async start() {
    if (this.auroraSource) {
      this.auroraSource.play()
    }
  }

  stop() {
    super.stop()

    if (this.auroraSource?.context) {
      try {
        this.auroraSource.context.close()
      } catch (e) {
        console.error('XpraAuroraAdapter', e)
      }
    }

    this.auroraSource = null
  }

  protected pushBuffer(buffer: Uint8Array) {
    if (this.auroraSource) {
      this.auroraSource.asset.source._on_data(buffer)
    }
  }

  protected isReady() {
    return !!this.auroraSource
  }
}

/**
 * Provides audio playback for a client session
 * @noInheritDoc
 */
export class XpraAudio extends (EventEmitter as unknown as new () => TypedEmitter<XpraAudioEventEmitters>) {
  private readonly audio: HTMLAudioElement = document.createElement('audio')
  private enabled = false
  private adapter: XpraAudioAdapter | null = null
  private defaultCodec: XpraAudioCodecType | null = null
  private audioCodec: XpraAudioCodecType | null = null
  private audioFramework: XpraAudioFramework | null = null

  private auroraCodecs: XpraAudioCodecMap = (hasAV
    ? getAuroraAudioCodecs()
    : {}) as XpraAudioCodecMap

  private mediaCodecs: XpraAudioCodecMap = (hasMS
    ? getMediaSourceAudioCodecs()
    : {}) as XpraAudioCodecMap

  private detectedCodecs: XpraAudioCodecMap = {
    ...this.mediaCodecs,
    ...this.auroraCodecs,
  }

  constructor() {
    super()

    if (Object.values(this.detectedCodecs).length > 0) {
      this.defaultCodec = getDefaultAudioCodec(this.detectedCodecs)
    }

    console.debug('XpraAudio#constructor', this)
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

      if (this.defaultCodec) {
        const detected =
          PREFERRED_CODEC_ORDER.find((codec) => {
            if (codec in this.detectedCodecs && encoders.includes(codec)) {
              return true
            }

            return false
          }) || this.defaultCodec

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
      const supported = get_supported_codecs(
        this.audioFramework === 'mediasource',
        this.audioFramework === 'aurora',
        false
      )

      const best = get_best_codec(supported)

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

  playBell() {
    const snd = new Audio(
      'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
    )
    snd.play()
  }

  addQueue(buffer: Uint8Array, metadata?: XpraAudioMetadata) {
    if (this.adapter) {
      this.adapter.addQueue(buffer, metadata)
    }
  }

  getDecoders() {
    return Object.keys(this.detectedCodecs)
  }
}
