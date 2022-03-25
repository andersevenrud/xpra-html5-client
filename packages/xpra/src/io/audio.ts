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
import AV from 'xpra-av'
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
  get_supported_codecs as getSupportedCodecs,
  get_best_codec as getBestCodec,
  CODEC_STRING,
  PREFERRED_CODEC_ORDER,
} from '../lib/media'

export type XpraAudioEventEmitters = {
  start: () => void
  stop: () => void
}

const CONCAT = true

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

  /** @virtual */
  async setup() {
    console.warn('XpraAudioAdapter#setup', 'unhandled event')
  }

  /** @virtual */
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

  /** @virtual */
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
  private auroraSource: AV.XpraSource | null = null

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
  private auroraCodecs: XpraAudioCodecMap =
    getAuroraAudioCodecs() as XpraAudioCodecMap

  private mediaCodecs: XpraAudioCodecMap = (!!getMediaSourceClass()
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
      const supported = getSupportedCodecs(
        this.audioFramework === 'mediasource',
        this.audioFramework === 'aurora',
        false
      )

      const best = getBestCodec(supported)

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
}
