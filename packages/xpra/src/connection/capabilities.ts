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

import forge from 'node-forge'
import { get_key_codes } from '../lib/keycodes'
import { rencode_selftest } from '../lib/rencode'
import { XpraCapabilityError } from '../errors'
import {
  XPRA_CLIPBOARD_TARGETS,
  XPRA_RGB_FORMATS,
  XPRA_IMAGE_ENCODERS,
  XPRA_HTML5_VERSION,
  XPRA_HTML5_REVISION,
  XPRA_HTML5_LOCAL_MODIFICATIONS,
  XPRA_HTML5_BRANCH,
} from '../constants'
import {
  XpraVector,
  XpraCapabilities,
  XpraConnectionOptions,
  XpraMonitor,
  XpraScreen,
  XpraClipboardSelection,
  XpraStartNewSessionMode,
  XpraStartNewSession,
  XpraXkbpMapKeycode,
} from '../types'
import { createRandomSecureString, createHexUUID } from '../utils/data'
import {
  getBrowserDPI,
  getBrowser,
  getBrowserPlatform,
  getBrowserConnectionInfo,
  getBrowserSupportsClipboard,
  getBrowserColorGamut,
} from '../utils/browser'

/**
 * Creates a set of gigest types to use in challenges
 */
const getSupportedDigests = () => {
  const additions = Object.keys(forge.md.algorithms).map((s) => `hmac+${s}`)
  return ['hmac', 'hmac+md5', 'xor', ...additions]
}

/**
 * Creates a set of compatible clipboard types
 */
const getSupportedClipboard = (images: boolean) =>
  images ? [...XPRA_CLIPBOARD_TARGETS, 'image/png'] : XPRA_CLIPBOARD_TARGETS

/**
 * Creates session data that determines how the session should
 * start and stop
 */
function createNewSessionData({
  startNewSession,
  exitWithChildren,
  exitWithClient,
  startCommand,
}: XpraConnectionOptions): Partial<XpraStartNewSession> {
  if (startNewSession) {
    const startKey = exitWithChildren ? 'start-child' : 'start'
    return {
      mode: startNewSession as XpraStartNewSessionMode,
      'exit-with-children': exitWithChildren,
      'exit-with-client': exitWithClient,
      [startKey]: exitWithClient ? [startCommand] : [],
    }
  }

  return {}
}

/**
 * Creates a (single) new screen with display information
 * generated from browser data.
 */
export function createXpraScreen(w: number, h: number): XpraScreen[] {
  const dpi = getBrowserDPI()
  const wmm = Math.round((w * 25.4) / dpi)
  const hmm = Math.round((h * 25.4) / dpi)

  const monitor = ['Canvas', 0, 0, w, h, wmm, hmm] as XpraMonitor
  const screen = ['HTML', w, h, wmm, hmm, [monitor], 0, 0, w, h] as XpraScreen

  return [screen]
}

/**
 * Build a set of capabilities to be sent in a hello
 * message
 */
export function createXpraCapabilities(
  capabilities: Partial<XpraCapabilities> = {},
  check = true
): XpraCapabilities {
  const size = [window.innerWidth, window.innerHeight] as XpraVector

  const digests = getSupportedDigests()
  const platform = getBrowserPlatform()
  const browser = getBrowser()

  const selections: XpraClipboardSelection[] = getBrowserSupportsClipboard()
    ? ['CLIPBOARD']
    : ['CLIPBOARD', 'PRIMARY']

  const rencode = rencode_selftest()
  const supportedEncodings = XPRA_IMAGE_ENCODERS

  const result: XpraCapabilities = {
    version: XPRA_HTML5_VERSION,
    'build.revision': XPRA_HTML5_REVISION,
    'build.local_modifications': XPRA_HTML5_LOCAL_MODIFICATIONS,
    'build.branch': XPRA_HTML5_BRANCH,
    platform: platform.type,
    'platform.name': platform.name,
    'platform.processor': platform.processor,
    'platform.platform': platform.platform,
    'session-type': browser.name,
    'session-type.full': browser.agent,
    namespace: true,
    'clipboard.contents-slice-fix': true,
    client_type: 'HTML5',
    'websocket.multi-packet': true,
    'setting-change': true,
    uuid: createHexUUID(),
    argv: [window.location.href],
    digest: digests,
    'salt-digest': digests,
    zlib: true,
    compression_level: 1,
    'file-transfer': false,
    printing: false,
    share: false,
    steal: false,
    username: '',
    display: '',
    'mouse.show': true,
    rencode: rencode,
    rencodeplus: rencode,
    bencode: true,
    yaml: false,
    'open-url': true,
    'ping-echo-sourceid': true,
    vrefresh: -1,
    'xdg-menu-update': true,
    'bandwidth-limit': 0,
    'connection-data': getBrowserConnectionInfo(),
    lz4: true,
    'encoding.rgb_lz4': true,
    brotli: true,
    'clipboard.preferred-targets': [],
    'start-new-session': undefined,
    auto_refresh_delay: 500,
    randr_notify: true,
    'sound.server_driven': true,
    'server-window-resize': true,
    'screen-resize-bigger': false,
    'metadata.supported': [
      'fullscreen',
      'maximized',
      'iconic',
      'above',
      'below',
      //'set-initial-position', 'group-leader',
      'title',
      'size-hints',
      'class-instance',
      'transient-for',
      'window-type',
      'has-alpha',
      'decorations',
      'override-redirect',
      'tray',
      'modal',
      'opacity',
      //'shadow', 'desktop',
    ],
    encoding: 'auto',
    encodings: supportedEncodings,
    'encoding.icons.max_size': [30, 30],
    'encodings.core': supportedEncodings,
    'encodings.rgb_formats': XPRA_RGB_FORMATS,
    'encodings.window-icon': ['png'],
    'encodings.cursor': ['png'],
    'encoding.flush': true,
    'encoding.transparency': true,
    'encoding.scrolling': supportedEncodings.includes('scroll'),
    //'encoding.scrolling.min-percent': 30,
    'encoding.decoder-speed': { video: 0 },
    'encodings.packet': true,
    //'encoding.min-speed': 80,
    //'encoding.min-quality': 50,
    'encoding.color-gamut': getBrowserColorGamut(),
    //'encoding.non-scroll': ['rgb32', 'png', 'jpeg'],
    //video stuff:
    'encoding.video_scaling': true,
    'encoding.video_max_size': [1024, 768],
    'encoding.eos': true,
    'encoding.full_csc_modes': {
      mpeg1: ['YUV420P'],
      h264: ['YUV420P'],
      'mpeg4+mp4': ['YUV420P'],
      'h264+mp4': ['YUV420P'],
      'vp8+webm': ['YUV420P'],
      webp: ['BGRX', 'BGRA'],
      jpeg: [
        'BGRX',
        'BGRA',
        'BGR',
        'RGBX',
        'RGBA',
        'RGB',
        'YUV420P',
        'YUV422P',
        'YUV444P',
      ],
    },
    //this is a workaround for server versions between 2.5.0 to 2.5.2 only:
    'encoding.x264.YUV420P.profile': 'baseline',
    'encoding.h264.YUV420P.profile': 'baseline',
    'encoding.h264.YUV420P.level': '2.1',
    'encoding.h264.cabac': false,
    'encoding.h264.deblocking-filter': false,
    'encoding.h264.fast-decode': true,
    'encoding.h264+mp4.YUV420P.profile': 'baseline',
    'encoding.h264+mp4.YUV420P.level': '3.0',
    //prefer native video in mp4/webm container to broadway plain h264:
    'encoding.h264.score-delta': -20,
    'encoding.h264+mp4.score-delta': 50,
    'encoding.h264+mp4.': 50,
    //'encoding.h264+mp4.fast-decode': true,
    'encoding.mpeg4+mp4.score-delta': 40,
    //'encoding.mpeg4+mp4.fast-decode': true,
    'encoding.vp8+webm.score-delta': 40,
    'sound.receive': true,
    'sound.send': false,
    'sound.decoders': [],
    'sound.bundle-metadata': true,
    'encoding.rgb_zlib': true,
    windows: true,
    'window.pre-map': true,
    keyboard: true,
    xkbmap_layout: browser.layout,
    xkbmap_keycodes: get_key_codes() as XpraXkbpMapKeycode[],
    xkbmap_print: '',
    xkbmap_query: '',
    desktop_size: size,
    desktop_mode_size: size,
    screen_sizes: createXpraScreen(size[0], size[1]),
    dpi: getBrowserDPI(),
    clipboard: true,
    'clipboard.want_targets': true,
    'clipboard.greedy': true,
    'clipboard.selections': selections,
    notifications: true,
    'notifications.close': true,
    'notifications.actions': true,
    cursors: true,
    bell: true,
    system_tray: true,
    named_cursors: false,
    'file-size-limit': 10,
    flush: true,

    // Encryption
    cipher: undefined,
    'cipher.mode': undefined,
    'cipher.iv': undefined,
    'cipher.key_salt': undefined,
    'cipher.key_size': undefined,
    'cipher.key_hash': undefined,
    'cipher.key_stretch_iterations': undefined,
    'cipher.padding.options': undefined,

    ...capabilities,
  }

  if (check) {
    Object.entries(result).forEach(([k, v]) => {
      if (v === null) {
        throw new XpraCapabilityError(
          `Invalid value ('${v}') for capability '${k}'`
        )
      }
    })
  }

  return Object.fromEntries(
    Object.entries(result).filter(([, v]) => v !== undefined)
  ) as unknown as XpraCapabilities
}

/**
 * Build a new partial set of capabilities based on options
 * given to the client
 */
export function createXpraCapabilitiesFromOptions(
  options: XpraConnectionOptions
): Partial<XpraCapabilities> {
  const size = [window.innerWidth, window.innerHeight] as XpraVector
  const startNewSession = createNewSessionData(options)

  const capabilities = {
    'clipboard.preferred-targets': getSupportedClipboard(
      options.clipboardImages
    ),
    'bandwidth-limit': options.bandWidthLimit,
    'xdg-menu-update': options.showStartMenu,
    'start-new-session': startNewSession,
    share: options.shareSession,
    steal: options.stealSession,
    username: options.username,
    display: options.display,
    'file-transfer': options.fileTransfer,
    'open-url': options.openUrl,
    printing: options.printing,
    clipboard: options.clipboard,
    desktop_size: size,
    desktop_mode_size: size,
    cursors: options.cursor,
    bell: options.bell,
    system_tray: options.tray,
    notifications: options.notifications,
    xkbmap_layout: options.keyboardLayout,
    encoding: options.encoder,
  }

  if (options.encryption) {
    const [enc, mode] = options.encryption.split('-')

    if (enc !== 'AES') {
      throw new XpraCapabilityError(`Invalid encryption: ${enc} (${mode})`)
    }

    Object.assign(capabilities, {
      cipher: enc,
      'cipher.mode': mode,
      'cipher.iv': createRandomSecureString(16),
      'cipher.key_salt': createRandomSecureString(32),
      'cipher.key_size': 32, // 256 bits
      'cipher.key_hash': 'SHA1',
      'cipher.key_stretch_iterations': 1000,
      'cipher.padding.options': ['PKCS#7'],
    })
  }

  if (options.video) {
    const encodings = [...XPRA_IMAGE_ENCODERS, 'mpeg1', 'h264']

    if (options.nativeVideo) {
      encodings.push('vp8+webm', 'h264+mp4', 'mpeg4+mp4')
    }

    Object.assign(capabilities, {
      encodings,
      'encodings.core': encodings,
    })
  }

  return capabilities
}
