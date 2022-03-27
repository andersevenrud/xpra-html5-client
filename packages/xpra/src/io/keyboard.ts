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
import { getBrowserPlatform, getBrowserLanguages } from '../utils/platform'
import { XpraConnectionOptions, XpraServerCapabilities } from '../types'
import {
  KEY_TO_NAME,
  NUMPAD_TO_NAME,
  CHAR_TO_NAME,
  CHARCODE_TO_NAME,
  CHARCODE_TO_NAME_SHIFTED,
} from '../constants/keycodes'

const DOM_KEY_LOCATION_RIGHT = 2

const TRANSLATIONS = ['', '', '', '', 'lock', '', 'altgr']

const MODIFIERS = [
  'Control',
  'Alt',
  'Meta',
  'Shift',
  'CapsLock',
  'NumLock',
  'AltGraph',
]

export type XpraKeyboardEventEmitters = {
  layoutChanged: (layout: string) => void
}

/**
 * Keyboard wrapper to handle input across a range of platforms
 * as well as translate into native input data.
 * @noInheritDoc
 */
export class XpraKeyboard extends (EventEmitter as unknown as new () => TypedEmitter<XpraKeyboardEventEmitters>) {
  private platform = getBrowserPlatform()
  private altgrState = false
  private keyboardKayout = 'us'
  private swapKeys = false
  private modifiers: Record<string, string | null> = {
    numlock: null,
    alt: null,
    ctrl: null,
    meta: null,
    altgr: null,
  }

  configure(
    options: XpraConnectionOptions,
    capabilities: XpraServerCapabilities
  ) {
    this.keyboardKayout = options.keyboardLayout
    this.swapKeys = options.swapKeys

    const modifiers = capabilities.modifier_keycodes
    let numlockModifier = null
    let altModifier = null
    let ctrlModifier = null
    let metaModifier = null
    let altgrModifier = null

    if (modifiers) {
      for (const mod in modifiers) {
        const keys = modifiers[mod]
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          for (let j = 0; j < key.length; j++) {
            if ('Alt_L' == key[j]) altModifier = mod
            else if ('Meta_L' == key[j]) metaModifier = mod
            else if ('ISO_Level3_Shift' == key[j] || 'Mode_switch' == key[j])
              altgrModifier = mod
            else if ('Control_L' == key[j]) ctrlModifier = mod
            else if ('Num_Lock' === key[j]) numlockModifier = mod
          }
        }
      }

      if (this.swapKeys) {
        ;[metaModifier, ctrlModifier] = [ctrlModifier, metaModifier]
      }
    }

    Object.assign(this.modifiers, {
      numlock: numlockModifier,
      alt: altModifier,
      ctrl: ctrlModifier,
      meta: metaModifier,
      altgr: altgrModifier,
    })
  }

  getKey(event: KeyboardEvent) {
    const group = 0
    const shifting = event.getModifierState('Shift') || event.shiftKey
    const code = event.which || event.keyCode
    const isMac = this.platform.type === 'darwin'
    const isWin = this.platform.type === 'win32'

    let name = event.code
    let key = event.key || String.fromCharCode(code)

    if (name in KEY_TO_NAME) {
      // some special keys are better mapped by name:
      name = KEY_TO_NAME[name]
    } else if (name != key && key in NUMPAD_TO_NAME) {
      // special case for numpad, try to distinguish arrowpad and numpad:
      name = NUMPAD_TO_NAME[key]
    } else if (key in CHAR_TO_NAME) {
      // next try mapping the actual character
      name = CHAR_TO_NAME[key]
    } else if (shifting && code in CHARCODE_TO_NAME_SHIFTED) {
      // may override with shifted table:
      name = CHARCODE_TO_NAME_SHIFTED[code]
    } else if (code in CHARCODE_TO_NAME) {
      // fallback to keycode map:
      name = CHARCODE_TO_NAME[code]
    }

    if (name.match('_L$') && event.location == DOM_KEY_LOCATION_RIGHT) {
      name = name.replace('_L', '_R')
    }

    if (
      key == 'AltGraph' ||
      (name == 'Alt_R' && (isWin || isMac)) ||
      (name == 'Alt_L' && isMac)
    ) {
      name = 'ISO_Level3_Shift'
      key = 'AltGraph'
    }

    return {
      name,
      code,
      group,
      key,
    }
  }

  getModifiers(ev: KeyboardEvent | MouseEvent): string[] {
    const original = this.getBaseModifiers(ev)
    const newModifiers = original.map((str) => {
      return this.modifiers[str] || str
    })

    if (
      this.altgrState &&
      this.modifiers.altgr &&
      !newModifiers.includes(this.modifiers.altgr)
    ) {
      newModifiers.push(this.modifiers.altgr)

      return newModifiers.filter((str) => {
        return ![this.modifiers.altgr, this.modifiers.ctrl].includes(str)
      })
    }

    return newModifiers
  }

  private getBaseModifiers(event: KeyboardEvent | MouseEvent) {
    const fallbacks = [
      event.ctrlKey,
      event.altKey,
      event.metaKey,
      event.shiftKey,
    ]

    return MODIFIERS.filter(
      (str, index) => event.getModifierState(str) || fallbacks[index]
    )
      .map((str, index) => TRANSLATIONS[index] || str)
      .map((str) => str.toLowerCase())
  }

  onKeyPress(str: string, pressed: boolean) {
    const [layout] = getBrowserLanguages()
    if (this.keyboardKayout !== layout) {
      this.emit('layoutChanged', layout)
    }

    if (str === 'AltGraph') {
      this.altgrState = pressed
    }
  }
}
