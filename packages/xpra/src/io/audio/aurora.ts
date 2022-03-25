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

import AV from 'xpra-av'
import { XpraAudioAdapter } from './adapter'
import { XpraAudioCodecMap } from '../../types'
import {
  XPRA_AUDIO_CODEC_DESCRIPTION,
  XPRA_AUDIO_AURORA_CODECS,
} from '../../constants'

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

  static getCodecs(): XpraAudioCodecMap {
    const supported = Object.entries(XPRA_AUDIO_AURORA_CODECS).filter(([, v]) =>
      AV.Decoder.find(v)
    )

    return Object.fromEntries(supported)
  }

  static getSupportedCodecs() {
    const entries = Object.keys(XpraAuroraAdapter.getCodecs()).map((k) => [
      `aurora:${k}`,
      `legacy:${XPRA_AUDIO_CODEC_DESCRIPTION[k]}`,
    ])

    return Object.fromEntries(entries)
  }
}
