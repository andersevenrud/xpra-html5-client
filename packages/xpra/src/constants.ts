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

import { XpraClipboardTarget, XpraRGBFormats, XpraDrawEncoding } from './types'

// FIXME: Insert from environmental variables
export const XPRA_HTML5_VERSION = '5.0'
export const XPRA_HTML5_REVISION = '1237'
export const XPRA_HTML5_LOCAL_MODIFICATIONS = 0
export const XPRA_HTML5_BRANCH = 'master'

export const XPRA_DEFAULT_KEYSIZE = 32
export const XPRA_DEFAULT_KEY_HASH = 'SHA1'
export const XPRA_DEFAULT_MODE = 'CBC'

export const XPRA_CHUNK_SZ = 0x8000

export const XPRA_MAX_AUDIO_BUFFERS = 250

export const XPRA_READ_ONLY_PACKETS: string[] = [
  'pointer-position',
  'button-action',
  'key-action',
  'desktop_size',
]

export const XPRA_IMAGE_ENCODERS: XpraDrawEncoding[] = [
  'jpeg',
  'png',
  'png/P',
  'png/L',
  'rgb',
  'rgb32',
  'rgb24',
  'scroll',
  'webp',
  'void',
  'avif',
]

export const XPRA_RGB_FORMATS: XpraRGBFormats[] = ['RGBX', 'RGBA', 'RGB']

export const XPRA_COLOR_GAMUT: Record<string, string> = {
  rec2020: 'rec2020',
  p3: 'P3',
  srgb: 'srgb',
}

export const XPRA_PLATFORM: Record<string, string[]> = {
  Win: ['win32', 'Microsoft Windows'],
  Mac: ['darwin', 'Mac OSX'],
  Linux: ['linux', 'Linux'],
  X11: ['posix', 'Posix'],
}

export const XPRA_CLIPBOARD_TARGETS: XpraClipboardTarget[] = [
  'UTF8_STRING',
  'TEXT',
  'STRING',
  'text/plain',
]

export const XPRA_KEYBOARD_LAYOUTS: Record<string, string> = {
  us: 'English USA',
  gb: 'United Kingdom',
  fr: 'France',
  de: 'Germany',
  es: 'Spain',
  ad: 'Andorra',
  af: 'Afghanistan',
  al: 'Albania',
  ara: 'Arabic',
  am: 'Armenia',
  az: 'Azerbaijan',
  bd: 'Bangladesh',
  by: 'Belarus',
  be: 'Belgium',
  bt: 'Bhutan',
  ba: 'Bosnia',
  br: 'Brazil',
  bg: 'Bulgaria',
  kh: 'Cambodia',
  ca: 'Canada',
  cn: 'China',
  cd: 'Congo,',
  hr: 'Croatia',
  cz: 'Czechia',
  dk: 'Denmark',
  epo: 'Esperanto',
  ee: 'Estonia',
  et: 'Ethiopia',
  ir: 'Iran',
  iq: 'Iraq',
  fo: 'Faroe',
  fi: 'Finland',
  ge: 'Georgia',
  gh: 'Ghana',
  gr: 'Greece',
  gn: 'Guinea',
  hu: 'Hungary',
  is: 'Iceland',
  in: 'India',
  ie: 'Ireland',
  il: 'Israel',
  it: 'Italy',
  jp: 'Japan',
  kz: 'Kazakhstan',
  kr: 'Korea,',
  kg: 'Kyrgyzstan',
  latam: 'Latin',
  lv: 'Latvia',
  la: 'Laos',
  lt: 'Lithuania',
  mao: 'Maori',
  mk: 'Macedonia',
  mv: 'Maldives',
  ml: 'Mali',
  mt: 'Malta',
  mn: 'Mongolia',
  me: 'Montenegro',
  ma: 'Morocco',
  mm: 'Myanmar',
  np: 'Nepal',
  nl: 'Netherlands',
  ng: 'Nigeria',
  no: 'Norway',
  pk: 'Pakistan',
  pl: 'Poland',
  pt: 'Portugal',
  ro: 'Romania',
  ru: 'Russia',
  sn: 'Senegal',
  rs: 'Serbia',
  sk: 'Slovakia',
  si: 'Slovenia',
  za: 'South Africa',
  lk: 'Sri Lanka',
  se: 'Sweden',
  ch: 'Switzerland',
  sy: 'Syria',
  tw: 'Taiwan',
  tj: 'Tajikistan',
  tz: 'Tanzania',
  th: 'Thailand',
  tr: 'Turkey',
  tm: 'Turkmenistan',
  ua: 'Ukraine',
  uz: 'Uzbekistan',
  vn: 'Vietnam',
}

export const XPRA_CLOSE_CODES: Record<number, string> = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
  1004: '(For future)',
  1005: 'No Status Received',
  1006: 'Abnormal Closure',
  1007: 'Invalid frame payload data',
  1008: 'Policy Violation',
  1009: 'Message too big',
  1010: 'Missing Extension',
  1011: 'Internal Error',
  1012: 'Service Restart',
  1013: 'Try Again Later',
  1014: 'Bad Gateway',
  1015: 'TLS Handshake',
}

export const XPRA_AUDIO_CODEC_DESCRIPTION: Record<string, string> = {
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

export const XPRA_AUDIO_CODEC_STRING: Record<string, string> = {
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

export const XPRA_AUDIO_PREFERRED_CODEC_ORDER: string[] = [
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

export const XPRA_AUDIO_AURORA_CODECS: Record<string, string> = {
  wav: 'lpcm',
  'mp3+id3v2': 'mp3',
  flac: 'flac',
  'aac+mpeg4': 'mp4a',
}
