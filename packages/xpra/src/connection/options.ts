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

import { getBrowserLanguages } from '../utils/platform'
import { parseUrlQuerySearch } from '../utils/url'
import { XpraConnectionOptions } from '../types'

/**
 * Complete set of default connection options
 */
export const createDefaultXpraConnectionOptions = (): XpraConnectionOptions => {
  const [defaultKeyboardLayout] = getBrowserLanguages()

  return {
    reconnect: true,
    connectionTimeout: 30000,
    reconnectInterval: 5000,
    reconnectAttempts: 3,
    pingInterval: 5000,
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
    debugPackets: ['general', 'window', 'notification', 'clipboard'],
    showStatistics: false,
  }
}

/**
 * Creates a partial connection option set from the current URL
 */
export const createXpraConnectionOptionsFromUrl = (
  search = window.location.search
) =>
  parseUrlQuerySearch<Partial<XpraConnectionOptions>>(search, {
    required: Object.keys(createDefaultXpraConnectionOptions()),
    lists: ['debugPackets'],
    booleans: [
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
    ],
    numbers: [
      'bandWidthLimit',
      'connectionTimeout',
      'reconnectAttempts',
      'reconnectInterval',
    ],
  })
