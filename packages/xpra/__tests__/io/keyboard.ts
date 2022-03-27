import { XpraKeyboard } from '../../src/io/keyboard'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'

const options = createDefaultXpraConnectionOptions()

describe('Keyboard', () => {
  const keyboard = new XpraKeyboard()

  it('should configure', () => {
    expect(
      keyboard.configure(options, {
        modifier_keycodes: {
          shift: [
            ['Shift_L', 0],
            ['Shift_R', 0],
          ],
          lock: [['Caps_Lock', 0]],
          control: [
            ['Control_L', 0],
            ['Control_R', 0],
          ],
          mod1: [
            ['Meta_L', 1],
            ['Meta_R', 1],
            ['Alt_L', 1],
            [0, 'Meta_L'],
          ],
          mod2: [['Num_Lock', 0]],
          mod3: [
            ['Super_L', 0],
            ['Super_R', 0],
            ['Super_L', 1],
          ],
          mod4: [
            ['Hyper_L', 1],
            ['Hyper_R', 0],
          ],
          mod5: [['ISO_Level3_Shift', 0]],
        },
      } as any)
    ).toEqual(undefined)
  })

  describe('detect keys', () => {
    it('should detect letters', () => {
      const ev = new KeyboardEvent('keydown', {
        code: 'KeyA',
        keyCode: 97,
      })

      expect(keyboard.getKey(ev)).toEqual({
        name: 'a',
        code: 97,
        group: 0,
        key: 'a',
      })
    })

    it('should translate names', () => {
      const ev = new KeyboardEvent('keydown', {
        code: 'Escape',
        keyCode: 27,
      })

      expect(keyboard.getKey(ev)).toEqual({
        name: 'Escape',
        code: 27,
        group: 0,
        key: '\x1B',
      })
    })

    it('should translate codes', () => {
      const ev = new KeyboardEvent('keydown', {
        keyCode: 32,
      })

      expect(keyboard.getKey(ev)).toEqual({
        name: 'space',
        code: 32,
        group: 0,
        key: ' ',
      })
    })

    it('should translate numpad', () => {
      const ev = new KeyboardEvent('keydown', {
        key: 'NumpadDivide',
        keyCode: 111,
      })

      expect(keyboard.getKey(ev)).toEqual({
        name: 'KP_Divide',
        code: 111,
        group: 0,
        key: 'NumpadDivide',
      })
    })

    it('should translate names (fallback)', () => {
      const ev = new KeyboardEvent('keydown', {
        key: 'invalid',
        keyCode: 8,
      })

      expect(keyboard.getKey(ev)).toEqual({
        name: 'BackSpace',
        code: 8,
        group: 0,
        key: 'invalid',
      })

      const ev2 = new KeyboardEvent('keydown', {
        key: 'invalid',
        keyCode: 187,
        shiftKey: true,
      })

      expect(keyboard.getKey(ev2)).toEqual({
        name: 'dead_grave',
        code: 187,
        group: 0,
        key: 'invalid',
      })
    })
  })

  describe('detect modifiers', () => {
    it('should get no modifiers', () => {
      const ev = new KeyboardEvent('keydown', {})
      expect(keyboard.getModifiers(ev)).toEqual([])
    })

    it('should get modifiers', () => {
      const ev = new KeyboardEvent('keydown', {
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        metaKey: true,
        modifierNumLock: true,
        modifierCapsLock: true,
      })

      expect(keyboard.getModifiers(ev)).toEqual([
        'control',
        'mod1',
        'mod1',
        'shift',
        'lock',
        'mod2',
      ])

      // FIXME: This does not actually set location :(
      const ev2 = new KeyboardEvent('keydown', {
        key: 'Control_L',
        code: 'ControlLeft',
        ctrlKey: true,
        location: 2,
      })

      expect(keyboard.getModifiers(ev2)).toEqual(['control'])
    })

    it('should detect altgr state', () => {
      const ev = new KeyboardEvent('keydown', {
        modifierAltGraph: true,
      })

      expect(keyboard.getModifiers(ev)).toEqual(['altgraph'])

      const ev2 = new KeyboardEvent('keydown', {
        ctrlKey: true,
        modifierAltGraph: true,
      })

      keyboard.onKeyPress('AltGraph', true)

      expect(keyboard.getModifiers(ev2)).toEqual(['altgraph'])
    })
  })
})
