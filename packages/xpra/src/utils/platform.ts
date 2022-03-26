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

import { LANGUAGE_TO_LAYOUT } from '../constants/keycodes'
import { XPRA_COLOR_GAMUT, XPRA_PLATFORM } from '../constants/xpra'

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
