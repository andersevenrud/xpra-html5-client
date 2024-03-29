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
import { XPRA_READ_ONLY_PACKETS } from '../constants/xpra'
import { createDefaultXpraConnectionOptions } from './options'
import { createXpraChallengeResponse } from './auth'
import { createXDGMenu } from '../utils/xdg'
import { imageSourceFromData } from '../utils/image'
import { uint8toString, unescapeUri } from '../utils/data'
import { XpraWebsocket, XpraConnectionStatus } from '../io/ws'
import { XpraClipboard } from '../io/clipboard'
import { XpraAudio } from '../io/audio'
import { XpraKeyboard } from '../io/keyboard'
import { XpraMouse } from '../io/mouse'
import { XpraWorkerProxy } from './proxy'
import { XpraPacketWorker, XpraDecodeWorker } from '../io/worker'
import { XpraPacketNullWorker, XpraDecodeNullWorker } from '../io/workers/null'
import { XpraLogger, XpraLoggerArguments } from '../io/logger'
import {
  XpraConnectionError,
  XpraChallengeError,
  XpraDisconnectionError,
} from '../errors'
import {
  createXpraScreen,
  createXpraCapabilities,
  createXpraCapabilitiesFromOptions,
} from './capabilities'
import {
  XpraDrawEncoding,
  XpraDrawScrollData,
  XpraConnectionStats,
  XpraConnectionOptions,
  XpraDrawOptions,
  XpraDraw,
  XpraNotification,
  XpraCursor,
  XpraWindowIcon,
  XpraWindowClientProperties,
  XpraWindowState,
  XpraWindowMetadata,
  XpraWindow,
  XpraWindowMoveResize,
  XpraWindowInitiateMoveResize,
  XpraWindowMetadataUpdate,
  XpraCapabilities,
  XpraServerCapabilities,
  XpraVector,
  XpraSendPacket,
  XpraRecievePacket,
  XpraRecievePacketType,
  XpraPacketArguments,
  XpraSettingChangeValue,
  XpraSendFile,
  XpraLogLevel,
  XpraAudioOptions,
  XpraAudioMetadata,
  XpraAudioCodecType,
  XpraClipboardSelection,
  XpraClipboardTarget,
  XpraInfoResponse,
  XpraPointerPosition,
  XpraXDGReducedMenu,
  XpraCipherCapability,
  XpraChallengePrompt,
  XpraChallengeCallback,
  XpraXDGMenu,
} from '../types'

export interface XpraClientConfiguration {
  worker?: Worker | XpraPacketWorker
  decoder?: Worker | XpraDecodeWorker
}

export type XpraClientEventEmitters = {
  connect: (status: XpraConnectionStatus) => void
  disconnect: (status: XpraConnectionStatus) => void
  error: (message: string) => void
  sessionStarted: () => void
  newWindow: (win: XpraWindow) => void
  removeWindow: (wid: number) => void
  windowIcon: (icon: XpraWindowIcon) => void
  moveResizeWindow: (data: XpraWindowMoveResize) => void
  initiateMoveResize: (data: XpraWindowInitiateMoveResize) => void
  updateWindowMetadata: (data: XpraWindowMetadataUpdate) => void
  raiseWindow: (wid: number) => void
  showNotification: (notification: XpraNotification) => void
  hideNotification: (id: number) => void
  pong: (stats: XpraConnectionStats) => void
  cursor: (cursor: XpraCursor | null) => void
  draw: (draw: XpraDraw) => void
  drawScroll: (draw: XpraDraw) => void
  drawBuffer: (draw: XpraDraw, buffer: ImageBitmap | null) => void
  hello: (capabilities: XpraServerCapabilities) => void
  sendFile: (file: XpraSendFile) => void
  infoResponse: (info: XpraInfoResponse) => void
  newTray: (win: XpraWindow) => void
  eos: (wid: number) => void
  pointerPosition: (pointer: XpraPointerPosition) => void
  updateXDGMenu: (menu: XpraXDGReducedMenu) => void
  bell: () => void
  openUrl: (url: string) => void
  challengePrompt: (
    args: XpraChallengePrompt,
    cb: XpraChallengeCallback
  ) => void
}

export const initialXpraConnectionStats: XpraConnectionStats = {
  lastServerPing: 0,
  lastClientEcho: 0,
  clientPingLatency: 0,
  serverPingLatency: 0,
  serverLoad: [0, 0, 0],
}

/**
 * The Xpra Client.
 * Handles connections and I/O for Xpra sessions.
 * @noInheritDoc
 */
export class XpraClient extends (EventEmitter as unknown as new () => TypedEmitter<XpraClientEventEmitters>) {
  private capabilities: XpraCapabilities = createXpraCapabilities({}, false)
  private options: XpraConnectionOptions = createDefaultXpraConnectionOptions()
  private stats: XpraConnectionStats = { ...initialXpraConnectionStats }
  private serverCapabilities: XpraServerCapabilities | null = null
  private connectionCheckTimeout = 0
  private pingInterval = 0
  private inited = false
  private started = false
  private readonly proxy = new XpraWorkerProxy()
  private readonly audio = new XpraAudio()
  private readonly ws = new XpraWebsocket()
  public readonly clipboard = new XpraClipboard()
  public readonly keyboard = new XpraKeyboard()
  public readonly mouse = new XpraMouse()
  public readonly logger = new XpraLogger()

  private processorBindings: Record<
    XpraRecievePacketType,
    (...args: XpraPacketArguments) => void
  > = {
    'new-window': this.processNewWindow,
    'window-icon': this.processWindowIcon,
    'startup-complete': this.processStartupComplete,
    'setting-change': this.processSettingChange,
    'window-move-resize': this.processWindowMoveResize,
    'window-resized': this.processWindowResized,
    'raise-window': this.processWindowRaise,
    'lost-window': this.processWindowLost,
    'window-metadata': this.processWindowMetadata,
    'new-override-redirect': this.processNewOverrideRedirect,
    'configure-override-redirect': this.processConfigureOverrideRedirect,
    'initiate-moveresize': this.processInitiateMoveResize,
    'send-file': this.processSendFile,
    'sound-data': this.processSoundData,
    'clipboard-token': this.processClipboardToken,
    'set-clipboard-enabled': this.processSetClipboardEnabled,
    'clipboard-request': this.processClipboardRequest,
    'info-response': this.processInfoResponse,
    'new-tray': this.processNewTray,
    'pointer-position': this.processPointerPosition,
    'open-url': this.processOpenUrl,
    notify_show: this.processShowNotification,
    notify_close: this.processCloseNotification,
    encodings: this.processEncodings,
    cursor: this.processCursor,
    hello: this.processHello,
    ping: this.processPing,
    ping_echo: this.processPingEcho,
    draw: this.processDraw,
    bell: this.processBell,
    challenge: this.processChallenge,
    eos: this.processEos,
    disconnect: this.processDisconnect,
  }

  constructor(config: Partial<XpraClientConfiguration>) {
    super()

    const { worker, decoder } = config
    this.proxy.setWorker(worker || new XpraPacketNullWorker())
    this.proxy.setDecodeWorker(decoder || new XpraDecodeNullWorker())
  }

  async init() {
    if (this.inited) {
      return
    }

    this.inited = true

    await this.audio.init()

    this.ws.on('open', () => this.handshake())
    this.ws.on('error', (err: Error) => this.disconnect(err))
    this.ws.on('close', (err?: Error) => this.disconnect(err))
    this.ws.on('connect', (s) => this.emit('connect', s))
    this.ws.on('disconnect', (s) => this.emit('disconnect', s))
    this.ws.on('message', (d: Uint8Array) => this.proxy.pushRecieve(d))

    this.on('draw', (draw: XpraDraw) => this.proxy.pushDecode(draw))

    this.proxy.on('recieve', (p: XpraRecievePacket) => this.recieve(p))
    this.proxy.on('send', (d: ArrayBuffer) => this.ws.send(d))
    this.proxy.on('failure', (e: Error) => this.disconnect(e))
    this.proxy.on('draw', (draw: XpraDraw, buffer: ImageBitmap | null) =>
      this.emit('drawBuffer', draw, buffer)
    )

    this.audio.on('start', () => this.sendSoundStart())
    this.audio.on('stop', () => this.sendSoundStop())

    this.clipboard.on('send', (...args) => this.sendClipboard(...args))
    this.clipboard.on('token', (data) => this.sendClipboardToken(data))

    this.keyboard.on('layoutChanged', (l: string) => this.sendLayoutChanged(l))

    this.logger.on('log', (level: XpraLogLevel, args: XpraLoggerArguments) => {
      this.sendLog(level, args)
    })
  }

  connect(host: string, options: Partial<XpraConnectionOptions> = {}) {
    if (!this.inited) {
      throw new XpraConnectionError('Xpra instance not initialized')
    } else if (this.ws.connected) {
      throw new XpraConnectionError('Xpra connection already open')
    }

    this.options = {
      ...createDefaultXpraConnectionOptions(),
      ...options,
    }

    try {
      this.started = false

      this.createCapabilities()
      this.clipboard.configure(this.options)
      this.proxy.configure(this.options)

      if (this.options.encryption) {
        this.proxy.setupRecieveCipher(
          this.capabilities,
          this.options.encryptionKey
        )
      }

      this.proxy.setConnected(true)
      this.ws.connect(host, this.options)
    } catch (e) {
      this.emit('error', (e as Error).message)
    }
  }

  disconnect(error?: Error) {
    if (error) {
      console.error('XpraConnection#disconnect', error)
    }

    // FIXME: This should probably be controlled by the websocket abstraction
    const skipReconnect =
      error instanceof XpraChallengeError ||
      error instanceof XpraDisconnectionError

    const reconnect = this.options.reconnect && !skipReconnect && !!error

    if (skipReconnect) {
      this.emit('error', error.message)
    }

    this.clearTimers()
    this.audio.stop()
    this.proxy.setConnected(false)
    this.clipboard.reset()
    this.ws.disconnect(reconnect)
    this.serverCapabilities = null
    this.started = false
  }

  private handshake() {
    this.connectionCheckTimeout = setTimeout(() => {
      this.disconnect(new XpraConnectionError('Not a valid xpra server?'))
    }, this.options.connectionTimeout) as unknown as number

    this.sendHello()
  }

  private recieve(packet: XpraRecievePacket) {
    const [name, ...args] = packet as [
      XpraRecievePacketType,
      ...XpraPacketArguments
    ]

    if (this.ws.connected) {
      if (this.processorBindings[name]) {
        this.processorBindings[name].apply(this, args)
      } else {
        console.debug('Unhandled message', name, args)
      }
    }
  }

  private send(packet: XpraSendPacket) {
    if (this.ws.connected) {
      if (this.isReadOnly() && XPRA_READ_ONLY_PACKETS.includes(packet[0])) {
        return
      }

      const unstartedPackets = ['hello', 'ping', 'ping_echo', 'logging']
      if (!this.started && !unstartedPackets.includes(packet[0])) {
        return
      }

      this.proxy.pushSend(packet)
    }
  }

  private challenge(
    serverSalt: string,
    digest: string,
    saltDigest: string,
    password: string
  ) {
    try {
      const challengeDigest = digest.startsWith('keycloak') ? 'xor' : digest

      const challengeResponse = createXpraChallengeResponse(
        serverSalt,
        challengeDigest,
        saltDigest,
        password,
        this.options.ssl,
        this.options.encryption
      )

      if (challengeResponse) {
        const [response, clientSalt] = challengeResponse

        this.createCapabilities({
          challenge_response: response,
          challenge_client_salt: clientSalt,
        })

        if (this.options.encryption) {
          this.proxy.setupRecieveCipher(
            this.capabilities,
            this.options.encryptionKey
          )
        }

        this.sendHello()
      }
    } catch (e) {
      this.disconnect(e as Error)
    }
  }

  private clearTimers() {
    clearTimeout(this.connectionCheckTimeout)
    clearInterval(this.pingInterval)
  }

  private createCapabilities(append: Partial<XpraCapabilities> = {}) {
    this.capabilities = createXpraCapabilities({
      ...createXpraCapabilitiesFromOptions(this.options),
      'sound.decoders': XpraAudio.getAudioCodecs(),
      ...append,
    })
  }

  getOptions() {
    return { ...this.options }
  }

  getCapabilities() {
    return { ...this.capabilities }
  }

  getServerCapabilities() {
    return this.serverCapabilities ? { ...this.serverCapabilities } : null
  }

  isReady() {
    return this.started
  }

  isReadOnly() {
    return !!this.serverCapabilities?.readonly
  }

  sendResize(iw: number, ih: number) {
    const w = Math.round(iw)
    const h = Math.round(ih)
    this.send(['desktop_size', w, h, createXpraScreen(w, h)])
  }

  sendCloseWindow(wid: number) {
    this.send(['close-window', wid])
  }

  sendMapWindow(win: XpraWindow) {
    const [x, y] = win.position
    const [w, h] = win.dimension
    this.send([
      'map-window',
      win.id,
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
      win.clientProperties,
    ])
  }

  sendUnmapWindow(win: XpraWindow) {
    this.send(['unmap-window', win.id, true])
  }

  sendGeometryWindow(wid: number, position: XpraVector, dimension: XpraVector) {
    const [x, y] = position
    const [w, h] = dimension

    this.send([
      'configure-window',
      wid,
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
      {},
    ])
  }

  sendConfigureWindow(
    wid: number,
    position: XpraVector,
    dimension: XpraVector,
    clientProperties: XpraWindowClientProperties,
    state: XpraWindowState,
    skipGeometry: boolean
  ) {
    const [x, y] = position
    const [w, h] = dimension

    this.send([
      'configure-window',
      wid,
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
      clientProperties,
      0,
      state,
      skipGeometry,
    ])
  }

  sendDamageSequence(
    packetSequence: number,
    wid: number,
    dimension: XpraVector,
    decodeTime: number,
    message = ''
  ) {
    if (decodeTime < 0) {
      console.warn('XpraConnection#sendDamageSequence', decodeTime)
    }

    this.send([
      'damage-sequence',
      packetSequence,
      wid,
      ...dimension,
      decodeTime,
      message,
    ])
  }

  sendMouseMove(wid: number, position: XpraVector, modifiers: string[]) {
    const [x, y] = position
    const buttons: number[] = []

    if (this.options.mouse) {
      this.send([
        'pointer-position',
        wid,
        [Math.round(x), Math.round(y)],
        modifiers,
        buttons,
      ])
    }
  }

  sendMouseWheel(
    wid: number,
    button: number,
    distance: number,
    position: XpraVector,
    modifiers: string[]
  ) {
    if (!this.options.mouse || !this.serverCapabilities) {
      return
    }

    const buttons: number[] = []
    const precise = !!this.serverCapabilities['wheel.precise']

    if (precise) {
      this.send([
        'wheel-motion',
        wid,
        button,
        distance,
        position,
        modifiers,
        buttons,
      ])
    } else {
      this.send([
        'button-action',
        wid,
        button,
        true,
        position,
        modifiers,
        buttons,
      ])
      this.send([
        'button-action',
        wid,
        button,
        false,
        position,
        modifiers,
        buttons,
      ])
    }
  }

  sendMouseButton(
    wid: number,
    position: XpraVector,
    button: number,
    pressed: boolean,
    modifiers: string[]
  ) {
    const [x, y] = position
    const buttons: number[] = []

    if (this.options.mouse) {
      this.send([
        'button-action',
        wid,
        button,
        pressed,
        [Math.round(x), Math.round(y)],
        modifiers,
        buttons,
      ])
    }
  }

  sendKeyAction(
    wid: number,
    name: string,
    pressed: boolean,
    modifiers: string[],
    key: string,
    code: number,
    group: number
  ) {
    if (this.options.keyboard) {
      this.keyboard.onKeyPress(key, pressed)

      this.send([
        'key-action',
        wid,
        name,
        pressed,
        modifiers,
        code,
        key,
        code,
        group,
      ])
    }
  }

  sendLayoutChanged(layout: string) {
    this.send(['layout-changed', layout, ''])
  }

  sendWindowRaise(wid: number, windows: XpraWindow[]) {
    this.send(['focus', wid, []])

    windows.forEach((win) => {
      this.sendConfigureWindow(
        win.id,
        win.position,
        win.dimension,
        win.clientProperties,
        { focused: win.id === wid },
        true
      )
    })
  }

  sendWindowClose(wid: number) {
    this.send(['close-window', wid])
  }

  sendNotificationClose(nid: number) {
    this.send(['notification-close', nid, 2, ''])
  }

  sendSuspend(wids: number[]) {
    this.send(['suspend', true, wids])
  }

  sendResume(wids: number[]) {
    this.send(['resume', true, wids])
    this.sendBufferRefresh(-1)

    // TODO: Request window redraw
  }

  sendBufferRefresh(wid: number) {
    this.send([
      'buffer-refresh',
      wid,
      0,
      100,
      {
        'refresh-now': true,
        batch: { reset: true },
      },
      {},
    ])
  }

  sendConnectionData(info: Record<string, string | number>) {
    this.send(['connection-data', info])
  }

  sendSoundStart() {
    this.send(['sound-control', 'start'])
  }

  sendSoundStop() {
    this.send(['sound-control', 'stop'])
  }

  sendStartCommand(name: string, command: string, ignore: boolean) {
    this.send(['start-command', name, command, ignore ? 'True' : 'False'])
  }

  sendFile(
    filename: string,
    mime: string,
    size: number,
    buffer: ArrayBuffer | Uint8Array
  ) {
    if (this.serverCapabilities) {
      const old = this.options.encoder === 'rencodeplus'
      const open = !!this.serverCapabilities['open-files']
      const converted =
        buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer

      const file = old ? uint8toString(converted) : converted

      this.send(['send-file', filename, mime, false, open, size, file, {}])
    }
  }

  sendShutdown() {
    this.send(['shutdown-server'])
  }

  private sendClipboardToken(data: string) {
    if (this.clipboard.isEnabled()) {
      const claim = true
      const greedy = true
      const synchronous = true
      const type = data ? 'UTF8_STRING' : ''
      const targets = data ? ['UTF8_STRING', 'text/plain'] : []

      this.send([
        'clipboard-token',
        'CLIPBOARD',
        targets,
        type,
        type,
        8,
        'bytes',
        data,
        claim,
        greedy,
        synchronous,
      ])
    }
  }

  private sendLog(level: XpraLogLevel, ...args: XpraLoggerArguments) {
    if (
      this.serverCapabilities &&
      this.serverCapabilities['remote-logging.multi-line']
    ) {
      const sargs = args.map((str) => unescapeUri(String(str)))
      this.send(['logging', level, sargs])
    }
  }

  private sendHello() {
    this.send(['hello', this.capabilities])
  }

  private sendPing() {
    const now = Math.ceil(performance.now())
    this.send(['ping', now])
  }

  private sendClipboard(
    requestId: number,
    selection: string,
    buffer: string,
    dataType = 'UTF8_STRING',
    dataFormat = 8,
    encoding = 'bytes'
  ) {
    if (buffer === '') {
      this.send(['clipboard-contents-none', requestId, selection])
    } else {
      this.send([
        'clipboard-contents',
        requestId,
        selection,
        dataType,
        dataFormat,
        encoding,
        buffer,
      ])
    }
  }

  private processHello(capabilities: XpraServerCapabilities) {
    clearTimeout(this.connectionCheckTimeout)

    this.started = true
    this.serverCapabilities = capabilities

    this.mouse.configure(this.options)
    this.keyboard.configure(this.options, capabilities)

    if (this.options.audio) {
      this.audio.setup(this.serverCapabilities)
    }

    if (this.options.encryption) {
      this.proxy.setupSendCipher(capabilities, this.options.encryptionKey)
    }

    this.emit('hello', this.serverCapabilities)
  }

  private processNewWindow(
    id: number,
    ix: number | string,
    iy: number | string,
    iw: number | string,
    ih: number | string,
    metadata: XpraWindowMetadata,
    clientProperties: XpraWindowClientProperties = {}
  ) {
    const x = parseInt(ix as string)
    const y = parseInt(iy as string)
    const w = parseInt(iw as string)
    const h = parseInt(ih as string)

    this.emit('newWindow', {
      id,
      position: [x, y],
      dimension: [w, h],
      overrideRedirect: false,
      metadata,
      clientProperties,
    })
  }

  private processWindowIcon(
    wid: number,
    w: number,
    h: number,
    encoding: string,
    data: Uint8Array
  ) {
    const image = imageSourceFromData(encoding, data)

    this.emit('windowIcon', {
      wid,
      dimension: [w, h],
      image,
    })
  }

  private processStartupComplete() {
    this.emit('sessionStarted')
    this.sendPing()
    this.pingInterval = setInterval(
      () => this.sendPing(),
      this.options.pingInterval
    ) as unknown as number

    this.logger.info('Connection from Xpra HTML client')
  }

  private processEncodings(caps: string[]) {
    console.debug('XpraConnection#processEncodings', caps)
  }

  private processCursor(
    encoding: string,
    _unknown1: number,
    _unknown2: number,
    w: number,
    h: number,
    xhot: number,
    yhot: number,
    _unknown3: number,
    data: string
  ) {
    if (!this.options.cursor) {
      return
    }

    if (arguments.length < 8) {
      this.emit('cursor', null)
    } else if (encoding === 'png') {
      const image = imageSourceFromData(encoding, data)
      this.emit('cursor', {
        dimension: [w, h],
        image,
        xhot,
        yhot,
      })
    }
  }

  private processPing(...packet: number[]) {
    const echotime = packet.length > 1 ? packet[1] : packet[0]
    const sid = packet.length >= 3 ? packet[2] : ''

    this.stats.lastServerPing = echotime
    this.send(['ping_echo', echotime, 0, 0, 0, 0, sid || ''])
  }

  private processPingEcho(
    last: number,
    l1: number,
    l2: number,
    l3: number,
    latency: number
  ) {
    this.stats.lastClientEcho = last
    this.stats.clientPingLatency = latency
    this.stats.serverPingLatency =
      Math.ceil(performance.now()) - this.stats.lastClientEcho
    this.stats.serverLoad = [l1 / 1000.0, l2 / 1000.0, l3 / 1000.0]

    this.emit('pong', { ...this.stats })
  }

  private processDraw(
    wid: number,
    x: number,
    y: number,
    width: number,
    height: number,
    encoding: XpraDrawEncoding,
    image: Uint8Array | XpraDrawScrollData,
    packetSequence: number,
    rowStride: number,
    options: XpraDrawOptions
  ) {
    const draw: XpraDraw = {
      wid,
      image,
      encoding,
      packetSequence,
      rowStride,
      options: options || {},
      position: [x, y],
      dimension: [width, height],
      startTime: performance.now(),
    }

    if (encoding === 'scroll') {
      this.emit('drawScroll', draw)
    } else if (encoding !== 'void') {
      this.emit('draw', draw)
    }
  }

  private processSettingChange(setting: string, value: XpraSettingChangeValue) {
    switch (setting) {
      case 'xdg-menu':
        const menu = createXDGMenu(value as XpraXDGMenu)
        this.emit('updateXDGMenu', menu)
        break

      default:
        console.debug(
          'XpraConnection#processSettingChange',
          'uncaught',
          setting,
          value
        )
        break
    }
  }

  private processWindowMoveResize(
    wid: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    this.emit('moveResizeWindow', {
      wid,
      position: [x, y],
      dimension: [w, h],
    })
  }

  private processWindowResized(wid: number, w: number, h: number) {
    this.emit('moveResizeWindow', {
      wid,
      dimension: [w, h],
    })
  }

  private processWindowRaise(wid: number) {
    this.emit('raiseWindow', wid)
  }

  private processWindowLost(wid: number) {
    this.emit('removeWindow', wid)
  }

  private processWindowMetadata(
    wid: number,
    metadata: Partial<XpraWindowMetadata>
  ) {
    this.emit('updateWindowMetadata', {
      wid,
      metadata,
    })
  }

  private processNewOverrideRedirect(
    id: number,
    x: number,
    y: number,
    w: number,
    h: number,
    metadata: XpraWindowMetadata,
    clientProperties: XpraWindowClientProperties = {}
  ) {
    this.emit('newWindow', {
      id,
      position: [x, y],
      dimension: [w, h],
      overrideRedirect: true,
      metadata,
      clientProperties,
    })
  }

  private processConfigureOverrideRedirect(
    wid: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    this.emit('moveResizeWindow', {
      wid,
      dimension: [w, h],
      position: [x, y],
    })
  }

  private processShowNotification(
    _unknown1: string,
    id: number,
    _unknown2: string,
    replacesId: number,
    _unknown3: string,
    summary: string,
    body: string,
    expires: number,
    icon: [string, number, number, string | Uint8Array] | null,
    actions: string[],
    hints: string[]
  ) {
    this.emit('showNotification', {
      id,
      replacesId,
      expires,
      actions,
      hints,
      icon: icon ? imageSourceFromData(icon[0], icon[3]) : null,
      summary,
      body,
    })
  }

  private processCloseNotification(id: number) {
    this.emit('hideNotification', id)
  }

  private processBell() {
    if (this.options.bell) {
      this.emit('bell')
    }
  }

  private processInitiateMoveResize(
    wid: number,
    xRoot: number,
    yRoot: number,
    direction: number,
    button: number,
    sourceIndication: number
  ) {
    this.emit('initiateMoveResize', {
      wid,
      position: [xRoot, yRoot],
      direction,
      button,
      sourceIndication,
    })
  }

  private processSendFile(
    filename: string,
    mime: string,
    print: number,
    size: number,
    data: Uint8Array
  ) {
    if (data.length !== size) {
      console.warn(
        'XpraConnection#processSendFile',
        'Invalid length for',
        filename
      )
      return
    }

    const blob = new Blob([data], { type: mime })

    this.emit('sendFile', {
      filename,
      mime,
      size,
      blob,
      print: !!print,
    })
  }

  private processSoundData(
    codec: XpraAudioCodecType,
    buffer: Uint8Array | null,
    options: XpraAudioOptions,
    metadata: XpraAudioMetadata
  ) {
    try {
      if (!this.options.audio || !this.audio.validate(codec)) {
        return
      }

      if (options['start-of-stream'] === 1) {
        this.audio.start()
      }

      if (buffer && buffer.length > 0) {
        this.audio.addQueue(buffer, metadata)
      }

      if (options['end-of-stream'] === 1) {
        this.audio.stop()
      }
    } catch (e) {
      console.error('XpraConnection#processSoundData', e)
      this.audio.stop()
    }
  }

  private async processClipboardToken(
    selection: XpraClipboardSelection,
    targets: XpraClipboardTarget[],
    target: XpraClipboardTarget,
    type: XpraClipboardTarget,
    format: number,
    wireEncoding: string,
    wireData: string | Uint8Array
  ) {
    await this.clipboard.write(
      this.capabilities,
      selection,
      targets,
      target,
      type,
      format,
      wireEncoding,
      wireData
    )
  }

  private processSetClipboardEnabled(enabled: boolean | number) {
    this.clipboard.setEnabled(!!enabled)
  }

  private async processClipboardRequest(
    requestId: number,
    selection: XpraClipboardSelection
  ) {
    await this.clipboard.read(requestId, selection)
  }

  private processChallenge(
    serverSalt: string,
    cipherOutCaps: XpraCipherCapability,
    digest: string,
    saltDigest: string,
    prompt: string
  ) {
    prompt = (prompt || 'password').replace(/[^a-zA-Z0-9\.,:\+/]/gi, '')
    saltDigest = saltDigest || 'xor'

    if (this.options.encryption && cipherOutCaps) {
      this.proxy.setupSendCipher(cipherOutCaps, this.options.encryptionKey)
    }

    const callback = (password: string) => {
      try {
        this.challenge(serverSalt, digest, saltDigest, password)
      } catch (e) {
        this.disconnect(e as Error)
      }
    }

    if (!this.options.password && this.listenerCount('challengePrompt') > 0) {
      this.emit(
        'challengePrompt',
        {
          prompt,
          serverSalt,
          digest,
          saltDigest,
        },
        callback
      )
    } else {
      callback(this.options.password)
    }
  }

  private processInfoResponse(info: XpraInfoResponse) {
    this.emit('infoResponse', info)
  }

  private processNewTray(
    id: number,
    iw: number | string,
    ih: number | string,
    metadata: XpraWindowMetadata
  ) {
    const w = parseInt(iw as string)
    const h = parseInt(ih as string)

    this.emit('newTray', {
      id,
      metadata,
      position: [0, 0],
      dimension: [w, h],
      overrideRedirect: false,
      clientProperties: {},
    })
  }

  private processPointerPosition(
    wid: number,
    ix: number | string,
    iy: number | string
  ) {
    const x = parseInt(ix as string)
    const y = parseInt(iy as string)

    this.emit('pointerPosition', {
      wid,
      position: [x, y],
    })
  }

  private processEos(wid: number) {
    this.emit('eos', wid)
  }

  private processDisconnect(message: string) {
    this.disconnect(new XpraDisconnectionError(`Disconnected: ${message}`))
  }

  private processOpenUrl(url: string) {
    if (this.options.openUrl) {
      this.emit('openUrl', url)
    }
  }
}
