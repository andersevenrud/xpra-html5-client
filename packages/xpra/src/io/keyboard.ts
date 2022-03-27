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

const CAPABILITY_MODIFIERS: Record<string, string> = {
  Alt_L: 'alt',
  Meta_L: 'meta',
  ISO_Level3_Shift: 'altgr',
  Mode_switch: 'altgr',
  Control_L: 'ctrl',
  Num_Lock: 'numlock',
}

export type XpraKeyboardEventEmitters = {
  layoutChanged: (layout: string) => void
}

/**
 * Keyboard wrapper to handle input across a range of platforms
 * as well as translate into native input data.
 * @noInheritDoc
 */
export class XpraKeyboard extends (EventEmitter as unknown as new () => TypedEmitter<XpraKeyboardEventEmitters>) {
  private altgrState = false
  private keyboardLayout = 'us'
  private readonly platform = getBrowserPlatform()
  private readonly modifiers: Record<string, string | null> = {
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
    const serverModifiers = capabilities.modifier_keycodes
    if (serverModifiers) {
      const modifiers = { ...this.modifiers }

      Object.entries(serverModifiers).forEach(([mod, keys]) => {
        keys
          .flat()
          .filter((key) => !!CAPABILITY_MODIFIERS[key])
          .forEach((key) => (modifiers[CAPABILITY_MODIFIERS[key]] = mod))
      })

      if (options.swapKeys) {
        Object.assign(modifiers, {
          meta: modifiers.ctrl,
          ctrl: modifiers.meta,
        })
      }

      Object.assign(this.modifiers, modifiers)
    }

    this.keyboardLayout = options.keyboardLayout
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
      name = KEY_TO_NAME[name]
    } else if (name !== key && key in NUMPAD_TO_NAME) {
      name = NUMPAD_TO_NAME[key]
    } else if (key in CHAR_TO_NAME) {
      name = CHAR_TO_NAME[key]
    } else if (shifting && code in CHARCODE_TO_NAME_SHIFTED) {
      name = CHARCODE_TO_NAME_SHIFTED[code]
    } else if (code in CHARCODE_TO_NAME) {
      name = CHARCODE_TO_NAME[code]
    }

    if (name.match(/_L$/) && event.location === DOM_KEY_LOCATION_RIGHT) {
      name = name.replace('_L', '_R')
    }

    if (
      key === 'AltGraph' ||
      (name === 'Alt_R' && (isWin || isMac)) ||
      (name === 'Alt_L' && isMac)
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
    if (this.keyboardLayout !== layout) {
      this.emit('layoutChanged', layout)
    }

    if (str === 'AltGraph') {
      this.altgrState = pressed
    }
  }
}
