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
} from '../keycodes'

const DOM_KEY_LOCATION_RIGHT = 2

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
  private modifiers = {
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
    const shifting = event.getModifierState('Shift')
    const keycode = event.which || event.keyCode
    const keyval = keycode
    const group = 0
    const isMac = this.platform.type === 'darwin'
    const isWin = this.platform.type === 'win32'

    let keyname = event.code || ''
    let str = event.key || String.fromCharCode(keycode)

    if (keyname in KEY_TO_NAME) {
      // some special keys are better mapped by name:
      keyname = KEY_TO_NAME[keyname]
    } else if (keyname == '' && str in KEY_TO_NAME) {
      keyname = KEY_TO_NAME[str]
    } else if (keyname != str && str in NUMPAD_TO_NAME) {
      // special case for numpad, try to distinguish arrowpad and numpad:
      keyname = NUMPAD_TO_NAME[str]
    } else if (str in CHAR_TO_NAME) {
      // next try mapping the actual character
      keyname = CHAR_TO_NAME[str]
    } else {
      // fallback to keycode map:
      if (keycode in CHARCODE_TO_NAME) {
        keyname = CHARCODE_TO_NAME[keycode]
      }

      //may override with shifted table:
      if (shifting && keycode in CHARCODE_TO_NAME_SHIFTED) {
        keyname = CHARCODE_TO_NAME_SHIFTED[keycode]
      }
    }

    if (keyname.match('_L$') && event.location == DOM_KEY_LOCATION_RIGHT) {
      keyname = keyname.replace('_L', '_R')
    }

    // AltGr: keep track of pressed state
    if (
      str == 'AltGraph' ||
      (keyname == 'Alt_R' && (isWin || isMac)) ||
      (keyname == 'Alt_L' && isMac)
    ) {
      keyname = 'ISO_Level3_Shift'
      str = 'AltGraph'
    }

    return {
      keyname,
      keycode,
      keyval,
      group,
      str,
    }
  }

  getModifiers(ev: KeyboardEvent | MouseEvent): string[] {
    const original = this.getBaseModifiers(ev)
    const newModifiers = original.slice()

    let index = original.indexOf('meta')
    if (index >= 0 && this.modifiers.meta)
      newModifiers[index] = this.modifiers.meta

    index = original.indexOf('control')
    if (index >= 0 && this.modifiers.ctrl)
      newModifiers[index] = this.modifiers.ctrl

    index = original.indexOf('alt')
    if (index >= 0 && this.modifiers.alt)
      newModifiers[index] = this.modifiers.alt

    index = original.indexOf('numlock')
    if (index >= 0) {
      if (this.modifiers.numlock) {
        newModifiers[index] = this.modifiers.numlock
      } else {
        newModifiers.splice(index, 1)
      }
    }

    index = original.indexOf('capslock')
    if (index >= 0) {
      newModifiers[index] = 'lock'
    }

    if (
      this.altgrState &&
      this.modifiers.altgr &&
      !newModifiers.includes(this.modifiers.altgr)
    ) {
      newModifiers.push(this.modifiers.altgr)

      index = newModifiers.indexOf(this.modifiers.altgr)
      if (index >= 0) newModifiers.splice(index, 1)

      index = newModifiers.indexOf(this.modifiers.ctrl!)
      if (index >= 0) newModifiers.splice(index, 1)
    }

    return newModifiers
  }

  private getBaseModifiers(event: KeyboardEvent | MouseEvent) {
    const modifiers = ['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'NumLock']

    return modifiers
      .filter((str) => event.getModifierState(str))
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
