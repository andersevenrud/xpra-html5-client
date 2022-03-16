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
import { get_key, get_modifiers } from '../lib/keycodes'
import { getBrowserLanguages } from '../utils/browser'
import { XpraConnectionOptions, XpraServerCapabilities } from '../types'

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

  getKey(ev: KeyboardEvent | MouseEvent) {
    return get_key(ev)
  }

  getModifiers(ev: KeyboardEvent | MouseEvent): string[] {
    const original = get_modifiers(ev)
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

      index = newModifiers.indexOf(this.modifiers.ctrl)
      if (index >= 0) newModifiers.splice(index, 1)
    }

    return newModifiers
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
