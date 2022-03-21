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

import { LANGUAGE_TO_LAYOUT } from '../lib/keycodes'
import { XPRA_COLOR_GAMUT, XPRA_PLATFORM } from '../constants'

export interface BrowserFile {
  buffer: Uint8Array
  name: string
  size: number
  type: string
}

const defaultPlatform = ['unknown', ['unknown', 'unknown']]

export function getBrowserLanguages() {
  const layout = LANGUAGE_TO_LAYOUT as Record<string, string>
  function resolve() {
    const keys = [
      'language',
      'browserLanguage',
      'systemLanguage',
      'userLanguage',
    ]

    const found = keys.find(
      (k) => typeof navigator[k as keyof Navigator] === 'string'
    )

    if (navigator.languages) {
      return navigator.languages
    } else if (found) {
      return [found]
    }

    return ['us']
  }

  return resolve().map((str) => {
    const [shortened] = str.split(/-|_/)
    return layout[str] || layout[shortened] || str
  })
}

export function getBrowser() {
  const [layout] = getBrowserLanguages()
  const ua = navigator.userAgent

  const isSafari =
    !!navigator.vendor.match(/apple/i) &&
    !ua.match(/crios/i) &&
    !ua.match(/fxios/i) &&
    !ua.match(/Opera|OPT\//)

  const browsers = [
    ['MSIE', ua.includes('MSIE') || ua.includes('Trident/')],
    ['Firefox', 'firefox'],
    ['Opera', 'opera'],
    ['Safari', isSafari],
    ['Chrome', 'chrome'],
  ]

  const [name] = browsers.find(([, i]) =>
    typeof i === 'boolean' ? i : ua.toLowerCase().includes(i)
  ) || ['', '']

  return {
    agent: navigator.userAgent,
    name: name as string,
    layout,
  }
}

export function getBrowserPlatform() {
  const { appVersion, oscpu, cpuClass } = navigator

  const found = Object.entries(XPRA_PLATFORM).find(([k]) =>
    appVersion?.includes(k)
  )

  const [, [type, name]] = found || defaultPlatform

  return {
    type,
    name,
    platform: appVersion,
    processor: oscpu || cpuClass || 'unknown',
  }
}

export function getBrowserConnectionInfo() {
  const convert = (n?: number | string) =>
    typeof n === 'number' && n > 0 && isFinite(n)
      ? Math.round(n * 1000 * 1000)
      : n

  const result = {
    type: 'unknown',
    downlink: -1,
    downlinkMax: -1,
    effectiveType: '4g',
    rtt: 0,
  }

  if ('connection' in navigator) {
    const append = Object.keys(result)
      .filter((k) => k in navigator.connection)
      .map((k) => [k, navigator.connection[k as keyof NetworkInformation]])

    Object.assign(result, Object.fromEntries(append))
  }

  return {
    ...result,
    downlink: convert(result.downlink),
    downlinkMax: convert(result.downlinkMax),
  } as Record<string, string | number>
}

export const getBrowserSupportsClipboard = () =>
  navigator.clipboard &&
  !!navigator.clipboard.readText &&
  !!navigator.clipboard.writeText

export async function browserLoadFile() {
  const input = document.createElement('input')
  input.type = 'file'

  const load = (blob: Blob) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        resolve(fileReader.result as ArrayBuffer)
      }

      fileReader.onerror = (ev: ProgressEvent) => {
        reject(ev)
      }

      fileReader.readAsArrayBuffer(blob)
    })

  return new Promise<BrowserFile[]>((resolve, reject) => {
    input.onchange = async () => {
      try {
        if (input.files) {
          const promises = Array.from(input.files).map((file) =>
            load(file).then(
              (buffer) =>
                ({
                  buffer,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                } as BrowserFile)
            )
          )

          const result = await Promise.all(promises)
          resolve(result)
        } else {
          resolve([])
        }
      } catch (e) {
        reject(e)
      }
    }

    input.click()
  })
}

export function browserSaveFile(name: string, blob: Blob | string) {
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob as Blob, name)
  } else {
    const url = blob instanceof Blob ? window.URL.createObjectURL(blob) : blob

    try {
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    } finally {
      window.URL.revokeObjectURL(url)
    }
  }
}

export function browserPrintFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)

  try {
    const win = window.open(url)
    if (!win || win.closed || win.closed !== undefined) {
      browserSaveFile(name, url)
    } else {
      win.print()
    }
  } finally {
    window.URL.revokeObjectURL(url)
  }
}

export async function browserReadClipboard(
  textType: string
): Promise<[string, string]> {
  if (navigator.clipboard.read) {
    const read = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = () => {
          resolve(fileReader.result as string)
        }

        fileReader.onerror = (ev: ProgressEvent) => {
          reject(ev)
        }

        fileReader.readAsText(blob)
      })

    const data = await navigator.clipboard.read()
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      for (let j = 0; j < item.types.length; j++) {
        const itemType = item.types[j]
        const blob = await item.getType(itemType)
        const data = await read(blob)

        if (itemType === 'text/plain') {
          return [textType, data]
        } else if (itemType === 'image/png') {
          return [itemType, data]
        }
      }
    }
  }

  const text = await navigator.clipboard.readText()
  return [textType, text]
}

export async function browserWriteClipboard(data: string, binaryType?: string) {
  if (binaryType) {
    if (navigator.clipboard.write) {
      const blob = new Blob([data], { type: binaryType })
      const item = new ClipboardItem({ [binaryType]: blob })
      const items = [item]

      await navigator.clipboard.write(items)

      return true
    }
  } else {
    await navigator.clipboard.writeText(data)
    return true
  }

  return false
}

export async function createNativeNotification(
  title: string,
  options: NotificationOptions
) {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser')
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const notification = new Notification(title, options)

      return notification
    }
  }

  return null
}

export function getBrowserColorGamut() {
  if (window.matchMedia) {
    const found = Object.entries(XPRA_COLOR_GAMUT).find(([k]) =>
      window.matchMedia(`(color-gamut: ${k})`)
    )

    if (found) {
      return found[1]
    }
  }

  return ''
}

export function getBrowserDPI() {
  let dpi = 96

  try {
    if ('deviceXDPI' in screen) {
      dpi = (screen.systemXDPI + screen.systemYDPI) / 2
    } else {
      const el = document.createElement('div') as HTMLDivElement
      el.style.width = '1in'
      el.style.height = '1in'
      el.style.left = '-100%'
      el.style.top = '-100%'
      el.style.position = 'absolute'
      document.body.appendChild(el)
      const { offsetWidth, offsetHeight } = el
      el.remove()

      if (offsetWidth > 0 && offsetHeight > 0) {
        dpi = Math.round((offsetWidth + offsetHeight) / 2.0)
      }
    }
  } catch (e) {
    console.warn('getBrowserDPI', e)
  }

  return dpi
}

// FIXME: Find a modern replacement
export const unescapeUri = (s: string) => unescape(encodeURIComponent(s))

export function parseUrlQuerySearch<T>({
  booleans = [],
  numbers = [],
  lists = [],
  required = [],
}: {
  booleans?: string[]
  numbers?: string[]
  lists?: string[]
  required?: string[]
}): T {
  const { search } = window.location
  const params = new URLSearchParams(search)

  const entries = Array.from(params as unknown as ArrayLike<string>).map(
    ([k, v]) => {
      if (booleans.includes(k)) {
        return [k, ['1', 'true', 'on'].includes(String(v).toLowerCase())]
      } else if (numbers.includes(k)) {
        return [k, parseInt(v)]
      } else if (lists.includes(k)) {
        return [k, v.split(',')]
      }

      return [k, v ? v : undefined]
    }
  )

  return Object.fromEntries(
    entries.filter(
      ([k, v]) => required.includes(k as string) && v !== undefined
    )
  )
}
