/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 *
 * ---
 *
 * Based on original Xpra source
 * Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
 * Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
 * Original source: https://github.com/Xpra-org/xpra-html5
 */

import { debounce } from 'lodash-es'
import { XpraClient } from '../connection/client'
import { renderXpraDrawData } from '../io/render'
import {
  browserSaveFile,
  browserPrintFile,
  createNativeNotification,
} from '../utils/browser'
import {
  XpraWindow,
  XpraDraw,
  XpraVector,
  XpraSendFile,
  XpraWindowMoveResize,
  XpraNotification,
} from '../types'

export interface XpraWindowManagerWindow {
  attributes: XpraWindow
  renderQueue: XpraDraw[]
  renderPending: number
  canvas: HTMLCanvasElement
  inited: boolean
  destroyed: boolean
}

/**
 * Creates a new z-index for a window (or surface).
 * This is calculated from a base index which is derived
 * from the window type(s).
 */
export function createXpraWindowBaseZindex(win: XpraWindow, zIndex: number) {
  let baseIndex = 5000

  if (win.overrideRedirect) {
    baseIndex = 30000
  } else {
    const type = win.metadata['window-type'] || []

    switch (type[0]) {
      case 'DROPDOWN':
      case 'TOOLTIP':
      case 'POPUP_MENU':
      case 'MENU':
      case 'COMBO':
        baseIndex = 20000
        break

      case 'UTILITY':
      case 'DIALOG':
        baseIndex = 15000
        break
    }
  }

  if (win.metadata.above) {
    baseIndex += 5000
  } else if (win.metadata.below) {
    baseIndex -= 5000
  }

  return baseIndex + zIndex
}

/**
 * A basic abstraction to make integraion of custom user interfaces
 * a bit simpler by providing some glue for general events and input.
 */
export class XpraWindowManager {
  private windows: XpraWindowManagerWindow[] = []
  private xpra: XpraClient
  private activeWindow = -1
  private $desktop: HTMLElement | null = null

  constructor(xpra: XpraClient) {
    this.xpra = xpra
  }

  init() {
    const resize = debounce(() => {
      if (this.$desktop) {
        const { offsetWidth, offsetHeight } = this.$desktop
        this.xpra.sendResize(offsetWidth, offsetHeight)
      }
    }, 200)

    this.xpra.on('sessionStarted', resize)
    this.xpra.on('sendFile', this.sendFile.bind(this))
    this.xpra.on('newWindow', this.createWindow.bind(this))
    this.xpra.on('newTray', this.createWindow.bind(this))

    this.xpra.on('eos', () => {
      /* TODO */
    })

    this.xpra.on('connect', () => {
      Notification.requestPermission()
    })

    this.xpra.on('moveResizeWindow', (data: XpraWindowMoveResize) => {
      if (data.dimension) {
        this.onResize(data.wid, data.dimension)
      }
    })

    this.xpra.on('draw', (draw: XpraDraw) => {
      const found = this.getWindow(draw.wid)
      if (found) {
        const len = found.renderQueue.push(draw)

        // FIXME: This is temporarily just a solution for handling unfocused tab
        if (len > 60) {
          console.debug(
            'XpraWindowManager <- draw',
            'truncated draw queue for',
            draw.wid
          )

          const removed = found.renderQueue.splice(-60)
          removed.forEach((d) => d.callback())
        }
      }
    })

    this.xpra.on('disconnect', () => {
      this.clearWindows()
    })

    window.addEventListener('resize', resize)
    window.addEventListener('keydown', this.onKeyAction.bind(this))
    window.addEventListener('keyup', this.onKeyAction.bind(this))
    window.addEventListener('wheel', this.onScrollAction.bind(this))
    window.addEventListener('mousewheel', this.onScrollAction.bind(this))
    window.addEventListener('DOMMouseScroll', this.onScrollAction.bind(this))
  }

  private onKeyAction(ev: KeyboardEvent) {
    if (this.xpra.isReady() && ev.target === document.body) {
      ev.preventDefault()
      ev.stopPropagation()
    } else {
      return
    }

    const win = this.getWindow(this.activeWindow)
    this.keyPress(win, ev, ev.type === 'keydown')
  }

  private onScrollAction(ev: WheelEvent | MouseEvent | Event) {
    const win = this.getWindow(this.activeWindow)
    if (win) {
      this.mouseWheel(win, ev)
    }
  }

  private onResize(wid: number, dimension: XpraVector) {
    const win = this.getWindow(wid)
    if (win) {
      const [w, h] = dimension
      if (win.canvas.width !== w) {
        win.canvas.width = w
      }

      if (win.canvas.height !== h) {
        win.canvas.height = h
      }
    }
  }

  private sendFile(file: XpraSendFile) {
    if (file.print) {
      browserPrintFile(file.filename, file.blob)
    } else {
      browserSaveFile(file.filename, file.blob)
    }
  }

  async createNotification(notif: XpraNotification) {
    const nnotif = await createNativeNotification(notif.summary, {
      body: notif.body,
      icon: notif.icon || undefined,
    })

    if (nnotif) {
      const onclose = () => this.xpra.sendNotificationClose(notif.id)
      nnotif.addEventListener('close', onclose)
    }

    return nnotif
  }

  clearWindows() {
    this.windows = []
  }

  createWindow(attributes: XpraWindow) {
    const [w, h] = attributes.dimension
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h

    const instance = {
      canvas,
      attributes,
      renderQueue: [],
      renderPending: 0,
      inited: false,
      destroyed: false,
    }

    this.windows.push(instance)

    const anim = async () => {
      if (!instance.destroyed) {
        await this.renderWindow(instance)

        window.requestAnimationFrame(anim)
      }
    }

    window.requestAnimationFrame(anim)

    this.xpra.sendMapWindow(attributes)
  }

  private async renderWindow(win: XpraWindowManagerWindow) {
    const draw = win.renderQueue.shift()
    if (draw && win.canvas) {
      try {
        await renderXpraDrawData(win.canvas, draw)
        draw.callback()
      } catch (e) {
        draw.callback(e as Error)
      }
    }
  }

  removeWindow(id: number) {
    const foundIndex = this.windows.findIndex((w) => w.attributes.id === id)
    if (foundIndex !== -1) {
      this.windows[foundIndex].destroyed = true
      this.windows.splice(foundIndex, 1)
    }
  }

  updateWindow(attributes: XpraWindow) {
    const found = this.getWindow(attributes.id)
    if (found) {
      Object.assign(found.attributes, attributes)
    }
  }

  moveResize(
    win: XpraWindowManagerWindow,
    position: XpraVector,
    dimension: XpraVector
  ) {
    this.onResize(win.attributes.id, dimension)
    this.xpra.sendGeometryWindow(win.attributes.id, position, dimension)
  }

  mouseButton(
    win: XpraWindowManagerWindow | null,
    ev: MouseEvent,
    pressed: boolean
  ) {
    const modifiers = this.xpra.keyboard.getModifiers(ev)
    const button = this.xpra.mouse.getButton(ev)
    const position = this.xpra.mouse.getPosition(ev)

    this.xpra.sendMouseButton(
      win ? win.attributes.id : -1,
      position,
      button,
      pressed,
      modifiers
    )
  }

  mouseWheel(
    win: XpraWindowManagerWindow,
    ev: WheelEvent | MouseEvent | Event
  ) {
    const modifiers = this.xpra.keyboard.getModifiers(ev as MouseEvent)
    const position = this.xpra.mouse.getPosition(ev as MouseEvent)
    const wheel = this.xpra.mouse.getScroll(ev)

    this.xpra.sendMouseWheel(win.attributes.id, wheel, position, modifiers)
  }

  mouseMove(win: XpraWindowManagerWindow | null, ev: MouseEvent) {
    const wid = win ? win.attributes.id : 0
    const modifiers = this.xpra.keyboard.getModifiers(ev)
    const position = this.xpra.mouse.getPosition(ev)

    this.xpra.sendMouseMove(wid, position, modifiers)
  }

  keyPress(
    win: XpraWindowManagerWindow | null,
    ev: KeyboardEvent,
    pressed: boolean
  ) {
    const wid = win ? win.attributes.id : 0
    const modifiers = this.xpra.keyboard.getModifiers(ev)
    const { keyname, keycode, keyval, group, str } =
      this.xpra.keyboard.getKey(ev)

    this.xpra.sendKeyAction(
      wid,
      keyname,
      pressed,
      modifiers,
      keyval,
      str,
      keycode,
      group
    )
  }

  raise(win: XpraWindowManagerWindow) {
    const wins = this.windows.map((w) => w.attributes)
    this.xpra.sendWindowRaise(win.attributes.id, wins)
  }

  minimize(win: XpraWindowManagerWindow) {
    this.xpra.sendUnmapWindow(win.attributes)
  }

  maximize(
    win: XpraWindowManagerWindow,
    position: XpraVector,
    dimension: XpraVector
  ) {
    this.restore(win)
    this.moveResize(win, position, dimension)
  }

  restore(win: XpraWindowManagerWindow) {
    this.xpra.sendMapWindow(win.attributes)
  }

  close(win: XpraWindowManagerWindow) {
    this.xpra.sendCloseWindow(win.attributes.id)
  }

  getWindow(id: number): XpraWindowManagerWindow | null {
    return this.windows.find((w) => w.attributes.id === id) || null
  }

  setDesktopElement(el: HTMLElement | null) {
    this.$desktop = el
  }

  setActiveWindow(wid: number) {
    this.activeWindow = wid
  }
}
