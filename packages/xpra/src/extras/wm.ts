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
import { browserSaveFile, browserPrintFile } from '../utils/file'
import { createNativeNotification } from '../utils/notification'
import { getBrowserConnectionInfo } from '../utils/platform'
import {
  XpraWindow,
  XpraDraw,
  XpraVector,
  XpraSendFile,
  XpraWindowMoveResize,
  XpraNotification,
  XpraDrawScrollData,
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
    this.xpra.on('bell', () => this.playBell())
    this.xpra.on('openUrl', (url: string) => this.openUrl(url))

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

    this.xpra.on(
      'drawBuffer',
      (draw: XpraDraw, buffer: ImageData | ImageBitmap | null) => {
        const found = this.getWindow(draw.wid)
        if (found) {
          this.renderWindow(found, draw, buffer)
        }
      }
    )

    this.xpra.on('drawScroll', (draw: XpraDraw) => {
      const found = this.getWindow(draw.wid)
      if (found) {
        this.renderWindow(found, draw)
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

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        if (this.xpra.isReady()) {
          const info = getBrowserConnectionInfo()
          this.xpra.sendConnectionData(info)
        }
      })
    }
  }

  private openUrl(url: string) {
    window.open(url, '_blank')
  }

  private playBell() {
    const snd = new Audio(
      'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
    )
    snd.play()
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
    this.xpra.sendMapWindow(attributes)
  }

  private async renderWindow(
    win: XpraWindowManagerWindow,
    draw: XpraDraw,
    buffer?: ImageData | ImageBitmap | null
  ) {
    const canvas = win.canvas
    const context = win.canvas?.getContext('2d')

    if (canvas && context) {
      if (buffer) {
        const [x, y] = draw.position
        const [w, h] = draw.dimension

        if (buffer instanceof ImageData) {
          context.putImageData(buffer, x, y, 0, 0, w, h)
        } else {
          context.clearRect(x, y, w, h)
          context.drawImage(buffer, x, y)
        }
      } else if (draw.encoding === 'scroll') {
        ;(draw.image as XpraDrawScrollData).forEach(
          ([sx, sy, sw, sh, xdelta, ydelta]) => {
            context.drawImage(
              canvas,
              sx,
              sy,
              sw,
              sh,
              sx + xdelta,
              sy + ydelta,
              sw,
              sh
            )
          }
        )
      }
    }

    const decodeTime = Math.round(
      1000 * performance.now() - 1000 * draw.startTime
    )

    this.xpra.sendDamageSequence(
      draw.packetSequence,
      draw.wid,
      draw.dimension,
      decodeTime,
      ''
    )
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
