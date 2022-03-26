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

import { KEYSYM_TO_UNICODE } from './keysym'

/**
 * Map javascript key names to the X11 naming convention the server expects:
 */
export const KEY_TO_NAME: Record<string, string> = {
  Escape: 'Escape',
  Tab: 'Tab',
  CapsLock: 'Caps_Lock',
  ShiftLeft: 'Shift_L',
  ControlLeft: 'Control_L',
  MetaLeft: 'Meta_L',
  AltLeft: 'Alt_L',
  Space: 'space',
  AltRight: 'Alt_R',
  MetaRight: 'Meta_R',
  ContextMenu: 'Menu_R',
  ControlRight: 'Control_L',
  ShiftRight: 'Shift_R',
  Enter: 'Return',
  Backspace: 'BackSpace',
  //special keys:
  ScrollLock: 'Scroll_Lock',
  Pause: 'Pause',
  NumLock: 'Num_Lock',
  //Arrow pad:
  Insert: 'Insert',
  Home: 'Home',
  PageUp: 'Prior',
  Delete: 'Delete',
  End: 'End',
  PageDown: 'Next',
}

export const NUMPAD_TO_NAME: Record<string, string> = {
  //Num pad:
  NumpadDivide: 'KP_Divide',
  NumpadMultiply: 'KP_Multiply',
  NumpadSubstract: 'KP_Substract',
  NumpadAdd: 'KP_Add',
  NumpadEnter: 'KP_Enter',
  NumpadDecimal: 'KP_Decimal', //TODO: send KP_Delete when Num_Lock is off
  //Num_Lock off:
  Insert: 'KP_Insert',
  End: 'KP_End',
  ArrowDown: 'KP_Down',
  PageDown: 'KP_Next',
  ArrowLeft: 'KP_Left',
  Clear: 'KP_Begin',
  ArrowRight: 'KP_Right',
  Home: 'KP_Home',
  ArrowUp: 'KP_Up',
  PageUp: 'KP_Prior',
}

export const CHAR_TO_NAME: Record<string, string> = {
  ' ': 'space',
}

//some keysyms require specific layouts
export const KEYSYM_TO_LAYOUT: Record<string, string> = {
  kana: 'jp',
  Farsi: 'ir',
  Arabic: 'ar',
  Cyrillic: 'ru',
  Ukrainian: 'ua',
  Macedonia: 'mk',
  Greek: 'gr',
  hebrew: 'he',
  Thai: 'th',
  Armenian: 'am',
  Georgian: 'ge',
  braille: 'brai',
}

export const LANGUAGE_TO_LAYOUT: Record<string, string> = {
  en_GB: 'gb',
  en: 'us',
  zh: 'cn',
  af: 'za',
  sq: 'al',
  //"ar"	: "ar",
  //"eu"	: "eu",
  //"bg"	: "bg",
  //"be"	: "be",
  ca: 'ca',
  'zh-TW': 'tw',
  'zh-CN': 'cn',
  //"zh-HK"	: ??
  //"zh-SG"	: ??
  //"hr"	: "hr",
  cs: 'cz',
  da: 'dk',
  //"nl"	: "nl",
  'nl-BE': 'be',
  'en-US': 'us',
  //"en-EG"	: ??
  'en-AU': 'us',
  'en-GB': 'gb',
  'en-CA': 'ca',
  'en-NZ': 'us',
  'en-IE': 'ie',
  'en-ZA': 'za',
  'en-JM': 'us',
  //"en-BZ"	: ??
  'en-TT': 'tr',
  et: 'ee',
  //"fo"	: "fo",
  fa: 'ir',
  //"fi"	: "fi",
  //"fr"	: "fr",
  'fr-BE': 'be',
  'fr-CA': 'ca',
  'fr-CH': 'ch',
  'fr-LU': 'fr',
  //"gd"	: ??
  'gd-IE': 'ie',
  //"de"	: "de",
  'de-CH': 'ch',
  'de-AT': 'at',
  'de-LU': 'de',
  'de-LI': 'de',
  he: 'il',
  hi: 'in',
  //"hu"	: "hu",
  //"is"	: "is",
  //"id"	: ??,
  //"it"	: "it",
  'it-CH': 'ch',
  ja: 'jp',
  ko: 'kr',
  //"lv"	: "lv",
  //"lt"	: "lt",
  //"mk"	: "mk",
  //"mt"	: "mt",
  //"no"	: "no",
  //"pl"	: "pl",
  'pt-BR': 'br',
  pt: 'pt',
  //"rm"	: ??,
  //"ro"	: "ro",
  //"ro-MO"	: ??,
  //"ru"	: "ru",
  ///"ru-MI"	: ??,
  //"sz"	: ??,
  sr: 'rs',
  //"sk"	: "sk",
  sl: 'si',
  //"sb"	: ??,
  es: 'es',
  //"es-AR", "es-GT", "es-CR", "es-PA", "es-DO", "es-MX", "es-VE", "es-CO",
  //"es-PE", "es-EC", "es-CL", "es-UY", "es-PY", "es-BO", "es-SV", "es-HN",
  //"es-NI", "es-PR",
  //"sx"	: ??,
  sv: 'se',
  'sv-FI': 'fi',
  //"th"	: "th",
  //"ts"	: ??,
  //"tn"	: ??,
  tr: 'tr',
  uk: 'ua',
  ur: 'pk',
  //"ve"	: ??,
  vi: 'vn',
  //"xh"	: "??",
  //"ji"	: "??",
  //"zu"	: "??",
}

/**
 * Maps web keycodes to the corresponding X11 keysym:
 *
 * TODO: some values are missing..
 */
export const CHARCODE_TO_NAME: Record<number, string> = {
  8: 'BackSpace',
  9: 'Tab',
  12: 'KP_Begin',
  13: 'Return',
  16: 'Shift_L',
  17: 'Control_L',
  18: 'Alt_L',
  19: 'Pause', //pause/break
  20: 'Caps_Lock',
  27: 'Escape',
  31: 'Mode_switch',
  32: 'space',
  33: 'Prior', //Page Up
  34: 'Next', //Page Down
  35: 'End',
  36: 'Home',
  37: 'Left',
  38: 'Up',
  39: 'Right',
  40: 'Down',
  42: 'Print',
  45: 'Insert',
  46: 'Delete',
  58: 'colon',
  59: 'semicolon',
  60: 'less',
  61: 'equal',
  62: 'greater',
  63: 'question',
  64: 'at',
  91: 'Menu', //Left Window Key
  92: 'Menu', //Right Window Key
  93: 'KP_Enter', //"select key"?
  106: 'KP_Multiply',
  107: 'KP_Add',
  109: 'KP_Subtract',
  110: 'KP_Delete',
  111: 'KP_Divide',
  144: 'Num_Lock',
  145: 'Scroll_Lock',
  160: 'dead_circumflex',
  161: 'exclam',
  162: 'quotedbl',
  163: 'numbersign',
  164: 'dollar',
  165: 'percent',
  166: 'ampersand',
  167: 'underscore',
  168: 'parenleft',
  169: 'parenright',
  170: 'asterisk',
  171: 'plus',
  172: 'bar',
  173: 'minus',
  174: 'braceleft',
  175: 'braceright',
  176: 'asciitilde',
  186: 'semicolon',
  187: 'equal',
  188: 'comma',
  189: 'minus',
  190: 'period',
  191: 'slash',
  192: 'grave',
  219: 'bracketleft',
  220: 'backslash',
  221: 'bracketright',
  222: 'apostrophe',
}

for (let i = 0; i <= 9; i++) {
  KEY_TO_NAME['Numpad' + i] = '' + i
  KEY_TO_NAME['KP' + i] = 'KP' + i
}

for (let i = 1; i <= 20; i++) {
  KEY_TO_NAME['F' + i] = 'F' + i
}

for (const keysym in KEYSYM_TO_UNICODE) {
  const u = (KEYSYM_TO_UNICODE as Record<string, number>)[keysym]
  const character = String.fromCharCode(u)
  CHAR_TO_NAME[character] = keysym
}

for (let i = 0; i < 26; i++) {
  CHARCODE_TO_NAME[65 + i] = 'abcdefghijklmnopqrstuvwxyz'[i]
}

for (let i = 0; i < 10; i++) {
  CHARCODE_TO_NAME[48 + i] = '' + i
  CHARCODE_TO_NAME[96 + i] = '' + i
  //fix for OSX numpad?
  //CHARCODE_TO_NAME[96+i] = "KP_"+i;
}

for (let i = 1; i <= 24; i++) {
  CHARCODE_TO_NAME[111 + i] = 'F' + i
}

//overrides: only for 'de' layout?
CHARCODE_TO_NAME[192] = 'dead_circumflex'
CHARCODE_TO_NAME[219] = 'backtick'
CHARCODE_TO_NAME[221] = 'dead_acute'
CHARCODE_TO_NAME[220] = 'dead_circumflex'
CHARCODE_TO_NAME[187] = 'dead_acute'

export const CHARCODE_TO_NAME_SHIFTED: Record<number, string> = {}
CHARCODE_TO_NAME_SHIFTED[187] = 'dead_grave'
CHARCODE_TO_NAME_SHIFTED[221] = 'dead_grave'
