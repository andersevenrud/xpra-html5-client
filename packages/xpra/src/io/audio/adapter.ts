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

import { uint8fromString } from '../../utils/data'
import { XpraAudioError } from '../../errors'
import { XpraAudioCodecType, XpraAudioMetadata } from '../../types'
import { XPRA_MAX_AUDIO_BUFFERS } from '../../constants/xpra'

const CONCAT = true

/**
 * Provides audio buffer queues to adapters
 */
export /* abstract */ class XpraAudioAdapter {
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
