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

// TODO: Transition this into a separate package
//       This will improve compile times and whatnot

import './aurora/aurora'
import './aurora/aac'
import './aurora/mp3'
import './aurora/flac'
import './aurora/aurora-xpra'
import lz4 from './lz4'
import JSMpeg from './jsmpeg'
import * as brotli from './brotli'

const AV = self.AV

export { lz4, JSMpeg, brotli, AV }

export {
  LANGUAGE_TO_LAYOUT,
  get_key as getKey,
  get_key_codes as getKeyCodes,
  get_modifiers as getModifiers,
} from './keycodes'

export { ord, bdecode, bencode, uintToString } from './bencode'

export {
  rencode_selftest as rencodeSelfTest,
  rdecodelegacy,
  rdecodeplus,
  rencodeplus,
  rencodelegacy,
} from './rencode'

export {
  getMediaSourceAudioCodecs,
  getDefaultAudioCodec,
  getMediaSourceClass,
  getAuroraAudioCodecs,
  getMediaSource,
  get_supported_codecs as getSupportedCodecs,
  get_best_codec as getBestCodec,
  CODEC_STRING,
  PREFERRED_CODEC_ORDER,
} from './media'
