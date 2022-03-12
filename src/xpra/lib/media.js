/*
 * Copyright (c) 2016 Antoine Martin <antoine@xpra.org>
 * Licensed under MPL 2.0
 *
 */
'use strict'

import Utilities from './utilities'

export const CODEC_DESCRIPTION = {
  mp4a: 'mpeg4: aac',
  'aac+mpeg4': 'mpeg4: aac',
  mp3: 'mp3',
  'mp3+id3v2': 'mp3',
  'mp3+mpeg4': 'mpeg4: mp3',
  wav: 'wav',
  wave: 'wave',
  flac: 'flac',
  opus: 'opus',
  vorbis: 'vorbis',
  'opus+mka': 'webm: opus',
  'opus+ogg': 'ogg: opus',
  'vorbis+mka': 'webm: vorbis',
  'vorbis+ogg': 'ogg: vorbis',
  'speex+ogg': 'ogg: speex',
  'flac+ogg': 'ogg: flac',
}

export const CODEC_STRING = {
  'aac+mpeg4': 'audio/mp4; codecs="mp4a.40.2"',
  //"aac+mpeg4"		: 'audio/mp4; codecs="aac51"',
  //"aac+mpeg4"		: 'audio/aac',
  mp3: 'audio/mpeg',
  'mp3+mpeg4': 'audio/mp4; codecs="mp3"',
  //"mp3"			: "audio/mp3",
  ogg: 'audio/ogg',
  //"wave"		: 'audio/wave',
  //"wav"			: 'audio/wav; codec="1"',
  wav: 'audio/wav',
  flac: 'audio/flac',
  'opus+mka': 'audio/webm; codecs="opus"',
  'vorbis+mka': 'audio/webm; codecs="vorbis"',
  'vorbis+ogg': 'audio/ogg; codecs="vorbis"',
  'speex+ogg': 'audio/ogg; codecs="speex"',
  'flac+ogg': 'audio/ogg; codecs="flac"',
  'opus+ogg': 'audio/ogg; codecs="opus"',
}

export const PREFERRED_CODEC_ORDER = [
  'opus+mka',
  'vorbis+mka',
  'opus+ogg',
  'vorbis+ogg',
  'opus',
  'vorbis',
  'speex+ogg',
  'flac+ogg',
  'aac+mpeg4',
  'mp3+mpeg4',
  'mp3',
  'mp3+id3v2',
  'flac',
  'wav',
  'wave',
]

export const H264_PROFILE_CODE = {
  //"baseline"	: "42E0",
  baseline: '42C0',
  main: '4D40',
  high: '6400',
  extended: '58A0',
}

export const H264_LEVEL_CODE = {
  '3.0': '1E',
  3.1: '1F',
  4.1: '29',
  5.1: '33',
}

export const READY_STATE = {
  0: 'NOTHING',
  1: 'METADATA',
  2: 'CURRENT DATA',
  3: 'FUTURE DATA',
  4: 'ENOUGH DATA',
}

export const NETWORK_STATE = {
  0: 'EMPTY',
  1: 'IDLE',
  2: 'LOADING',
  3: 'NO_SOURCE',
}

export const ERROR_CODE = {
  1: 'ABORTED: fetching process aborted by user',
  2: 'NETWORK: error occurred when downloading',
  3: 'DECODE: error occurred when decoding',
  4: 'SRC_NOT_SUPPORTED',
}

export const AURORA_CODECS = {
  wav: 'lpcm',
  'mp3+id3v2': 'mp3',
  flac: 'flac',
  'aac+mpeg4': 'mp4a',
}

export function getMediaSourceClass() {
  return window.MediaSource || window.WebKitMediaSource
}

export function getMediaSource() {
  const ms = getMediaSourceClass()
  if (!ms) {
    throw new Error('no MediaSource support!')
  }
  return new ms()
}

export function getAuroraAudioCodecs() {
  //IE is totally useless:
  if (Utilities.isIE()) {
    return {}
  }
  const codecs_supported = {}
  if (AV && AV.Decoder && AV.Decoder.find) {
    for (const codec_option in AURORA_CODECS) {
      const codec_string = AURORA_CODECS[codec_option]
      const decoder = AV.Decoder.find(codec_string)
      if (decoder) {
        codecs_supported[codec_option] = codec_string
      }
    }
  }
  return codecs_supported
}

export function getMediaSourceAudioCodecs(ignore_blacklist) {
  const media_source_class = getMediaSourceClass()
  if (!media_source_class) {
    return []
  }
  //IE is totally useless:
  if (Utilities.isIE()) {
    return []
  }
  const codecs_supported = {}
  for (const codec_option in CODEC_STRING) {
    const codec_string = CODEC_STRING[codec_option]
    try {
      if (!media_source_class.isTypeSupported(codec_string)) {
        //add whitelisting here?
        continue
      }
      let blacklist = []
      if (Utilities.isFirefox() || Utilities.isSafari()) {
        blacklist += ['opus+mka', 'vorbis+mka']
        if (Utilities.isSafari()) {
          //this crashes Safari!
          blacklist += ['wav']
        }
      } else if (Utilities.isChrome()) {
        blacklist = ['aac+mpeg4']
        if (Utilities.isMacOS()) {
          blacklist += ['opus+mka']
        }
      }
      if (blacklist.includes(codec_option)) {
        if (!ignore_blacklist) {
          continue
        }
      }
      codecs_supported[codec_option] = codec_string
    } catch (e) {
      console.error(
        "audio error probing codec '" +
          codec_string +
          "' / '" +
          codec_string +
          "': " +
          e
      )
    }
  }
  return codecs_supported
}

export function getSupportedAudioCodecs() {
  const codecs_supported = getMediaSourceAudioCodecs()
  const aurora_codecs = getAuroraAudioCodecs()
  for (const codec_option in aurora_codecs) {
    if (codec_option in codecs_supported) {
      //we already have native MediaSource support!
      continue
    }
    codecs_supported[codec_option] = aurora_codecs[codec_option]
  }
  return codecs_supported
}

export function getDefaultAudioCodec(codecs) {
  if (!codecs) {
    return null
  }
  const codec_options = Object.keys(codecs)
  for (let i = 0; i < PREFERRED_CODEC_ORDER.length; i++) {
    const codec_option = PREFERRED_CODEC_ORDER[i]
    if (codec_options.includes(codec_option)) {
      return codec_option
    }
  }
  return Object.keys(codecs)[0]
}

export function get_supported_codecs(
  mediasource,
  aurora,
  ignore_audio_blacklist
) {
  const codecs_supported = {}
  if (mediasource) {
    const mediasource_codecs = getMediaSourceAudioCodecs(ignore_audio_blacklist)
    for (const codec_option in mediasource_codecs) {
      codecs_supported['mediasource:' + codec_option] =
        CODEC_DESCRIPTION[codec_option]
    }
  }
  if (aurora) {
    const aurora_codecs = getAuroraAudioCodecs()
    for (const codec_option in aurora_codecs) {
      if (codec_option in codecs_supported) {
        //we already have native MediaSource support!
        continue
      }
      codecs_supported['aurora:' + codec_option] =
        'legacy: ' + CODEC_DESCRIPTION[codec_option]
    }
  }
  return codecs_supported
}

export function get_best_codec(codecs_supported) {
  let best_codec = null
  let best_distance = PREFERRED_CODEC_ORDER.length
  for (const codec_option in codecs_supported) {
    const cs = codec_option.split(':')[1]
    const distance = PREFERRED_CODEC_ORDER.indexOf(cs)
    if (distance >= 0 && distance < best_distance) {
      best_codec = codec_option
      best_distance = distance
    }
  }
  return best_codec
}
