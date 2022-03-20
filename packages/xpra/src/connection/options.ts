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

import { getBrowserLanguages, parseUrlQuerySearch } from '../utils/browser'
import { XpraConnectionOptions } from '../types'

const [defaultKeyboardLayout] = getBrowserLanguages()

/**
 * Complete set of default connection options
 */
export const defaultXpraConnectionOptions: XpraConnectionOptions = {
  reconnect: true,
  connectionTimeout: 30000,
  reconnectInterval: 5000,
  reconnectAttempts: 3,
  bandWidthLimit: 0,
  startNewSession: null,
  shareSession: false,
  stealSession: false,
  username: '',
  display: '',
  password: '',
  showStartMenu: true,
  fileTransfer: true,
  clipboardImages: false,
  clipboardDirection: 'both',
  clipboard: true,
  printing: false,
  bell: true,
  audio: true,
  video: false,
  nativeVideo: false,
  cursor: true,
  keyboard: true,
  mouse: true,
  tray: true,
  notifications: true,
  ssl: false,
  encryption: null,
  encryptionKey: '',
  encoder: 'auto',
  openUrl: true,
  swapKeys: false,
  keyboardLayout: defaultKeyboardLayout,
  exitWithChildren: false,
  exitWithClient: false,
  startCommand: '',
  reverseScrollX: false,
  reverseScrollY: false,
}

const booleanParams: string[] = [
  'reconnect',
  'showStartMenu',
  'clipboardImages',
  'clipboard',
  'shareSession',
  'stealSession',
  'fileTransfer',
  'printing',
  'bell',
  'audio',
  'cursor',
  'keyboard',
  'mouse',
  'tray',
  'notifications',
  'ssl',
  'openUrl',
  'video',
  'nativeVideo',
  'swapKeys',
  'exitWithChildren',
  'exitWithClient',
  'reverseScrollX',
  'reverseScrollY',
]

const numberParams: string[] = [
  'bandWidthLimit',
  'connectionTimeout',
  'reconnectAttempts',
  'reconnectInterval',
]

/**
 * Creates a partial connection option set from the current URL
 */
export const createXpraConnectionOptionsFromUrl = () =>
  parseUrlQuerySearch<Partial<XpraConnectionOptions>>(
    booleanParams,
    numberParams,
    Object.keys(defaultXpraConnectionOptions)
  )
