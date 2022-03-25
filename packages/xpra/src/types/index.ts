/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface XpraCommonCapability {
  digest: string[]
  'salt-digest': string[]
  flush: boolean
  zlib: boolean
  rencode: boolean
  bencode: boolean
  yaml: boolean
  platform: string
  'platform.name': string
  'platform.processor': string
  'platform.platform': string
  'build.revision': string
  'build.local_modifications': number
  'build.branch': string
  version: string
  uuid: string
  bell: boolean
  cursors: boolean
  desktop_size: XpraVector
  display: string
  windows: boolean
  keyboard: boolean
  notifications: boolean
  'notifications.close': boolean
  'notifications.actions': boolean
  clipboard: boolean
  'clipboard.contents-slice-fix': boolean
  'clipboard.preferred-targets': string[]
  'file-transfer': boolean
  'file-size-limit': number
  printing: boolean
  'open-url': boolean
  'xdg-menu-update': boolean
  'connection-data': Record<string, string | number>
  'ping-echo-sourceid': boolean
  encoding: XpraPacketEncoder
  auto_refresh_delay: number
}

export interface XpraBaseCapability {
  'session-type': string
  'session-type.full': string
  namespace: boolean
  share: boolean
  steal: boolean
  client_type: string
  'websocket.multi-packet': boolean
  'setting-change': boolean
  username: string
  argv: string[]
  compression_level: number
  'mouse.show': boolean
  rencodeplus: boolean
  vrefresh: number
  'bandwidth-limit': number
  lz4: boolean
  'encoding.rgb_lz4': boolean
  brotli: boolean
  'start-new-session'?: Partial<XpraStartNewSession>
  randr_notify: boolean
  'sound.server_driven': boolean
  'server-window-resize': boolean
  'screen-resize-bigger': boolean
  'metadata.supported': string[]
  'window.pre-map': boolean
  xkbmap_layout: string
  xkbmap_keycodes: XpraXkbpMapKeycode[]
  xkbmap_print: string
  xkbmap_query: string
  desktop_mode_size: XpraVector
  screen_sizes: XpraScreen[]
  dpi: number
  'clipboard.want_targets': boolean
  'clipboard.greedy': boolean
  'clipboard.selections': XpraClipboardSelection[]
  notifications: boolean
  'notifications.close': boolean
  'notifications.actions': boolean
  system_tray: boolean
  named_cursors: boolean
  challenge_response?: string
  challenge_client_salt?: string
}

export interface XpraCipherCapability {
  cipher?: 'AES' | string
  'cipher.mode'?: 'CBC' | 'CFB' | 'CTR' | string
  'cipher.iv'?: string
  'cipher.key_salt'?: string
  'cipher.key_size'?: number
  'cipher.key_hash'?: 'SHA1' | string
  'cipher.key_stretch_iterations'?: number
  'cipher.padding.options'?: string[]
  'cipher.key_stretch'?: 'PBKDF2' | string
}

export interface XpraSoundCapability {
  'sound.receive': boolean
  'sound.send': boolean
  'sound.decoders': string[]
  'sound.bundle-metadata': boolean
}

export interface XpraEncodingCapability {
  encodings: XpraDrawEncoding[]
  'encoding.scrolling': boolean
  'encoding.icons.max_size': XpraVector
  'encodings.core': XpraDrawEncoding[]
  'encodings.rgb_formats': XpraRGBFormats[]
  'encodings.window-icon': string[]
  'encodings.cursor': string[]
  'encoding.flush': boolean
  'encoding.transparency': boolean
  //'encoding.scrolling.min-percent': number
  'encoding.decoder-speed': { video: number }
  'encodings.packet': boolean
  //'encoding.min-speed': number
  //'encoding.min-quality': number
  'encoding.color-gamut': string
  //'encoding.non-scroll': string[]
  'encoding.video_scaling': boolean
  'encoding.video_max_size': XpraVector
  'encoding.eos': boolean
  'encoding.full_csc_modes': Record<string, string[]>
  'encoding.x264.YUV420P.profile': string
  'encoding.h264.YUV420P.profile': string
  'encoding.h264.YUV420P.level': string
  'encoding.h264.cabac': boolean
  'encoding.h264.deblocking-filter': boolean
  'encoding.h264.fast-decode': boolean
  'encoding.h264+mp4.YUV420P.profile': string
  'encoding.h264+mp4.YUV420P.level': string
  'encoding.h264.score-delta': number
  'encoding.h264+mp4.score-delta': number
  'encoding.h264+mp4.': number
  //'encoding.h264+mp4.fast-decode': boolean
  'encoding.mpeg4+mp4.score-delta': number
  //'encoding.mpeg4+mp4.fast-decode': boolean
  'encoding.vp8+webm.score-delta': number
  'encoding.rgb_zlib': boolean
}

export interface XpraServerBaseCapability extends XpraCommonCapability {
  compressors: string[]
  encoders: XpraCompressor[]
  'zlib.python-zlib': boolean
  'zlib.python-zlib.version': string
  'lz4.version': string
  'lz4.python-lz4': boolean
  'lz4.python-lz4.version': boolean
  none: boolean
  'none.version': string
  'rencode.version': string
  'bencode.version': string
  'yaml.version': string
  'platform.linux_distribution': string
  'platform.release': string
  'platform.sysrelease': string
  'platform.machine': string
  'platform.architecture': string
  'build.version': string
  'build.commit': string
  'build.date': string
  'build.time': string
  'build.bit': string
  'build.cpu': string
  'build.compiler': string
  'build.linker': string
  'build.python': string
  'build.cython': string
  'build.lib.gobject_introspection': string
  'build.lib.gtk': string
  'build.lib.gtk_x11': string
  'build.lib.nvenc': string
  'build.lib.nvfbc': string
  'build.lib.py3cairo': string
  'build.lib.pygobject': string
  'build.lib.python3': string
  'build.lib.vpx': string
  'build.lib.x11': string
  'build.lib.x264': string
  'build.lib.x265': string
  'build.lib.xcomposite': string
  'build.lib.xdamage': string
  'build.lib.xext': string
  'build.lib.xfixes': string
  'build.lib.xkbfile': string
  'build.lib.xrandr': string
  'build.lib.xtst': string
  pid: number
  byteorder: string
  'python.bits': number
  'python.full_version': string
  'python.version': string
  hostname: string
  uid: number
  gid: number
  start_time: number
  current_time: number
  elapsed_time: number
  server_type: string
  'server.mode': string
  'readonly-server': boolean
  readonly: boolean
  'server-log': string
  machine_id: string
  session_name: string
  key_repeat: number[]
  key_repeat_modifiers: boolean
  'xdg-menu': boolean
  subcommands: string[]
  opengl: boolean
  max_desktop_size: XpraVector
  'client-shutdown': boolean
  sharing: boolean
  'sharing-toggle': boolean
  lock: boolean
  'lock-toggle': boolean
  pointer: boolean
  toggle_keyboard_sync: boolean
  webcam: boolean
  'webcam.encodings': string[]
  'virtual-video-devices': string[]
  clipboards: string[]
  'clipboard-direction': string
  'clipboard.enable-selections': boolean
  'clipboard.loop-uuids.CLIPBOARD': string
  'clipboard.loop-uuids.PRIMARY': string
  'clipboard.loop-uuids.SECONDARY': string
  'av-sync': boolean
  'av-sync.enabled': boolean
  'sound.ogg-latency-fix': boolean
  'file-transfer-ask': boolean
  'max-file-size': number
  'file-chunks': number
  'open-files': boolean
  'open-files-ask': boolean
  'printing-ask': boolean
  'open-url-ask': boolean
  'file-ask-timeout': number
  'printer.attributes': string[]
  'request-file': boolean
  'input-devices': string[]
  'pointer.relative': boolean
  'start-new-commands': boolean
  'exit-with-children': boolean
  'server-commands-signals': string[]
  'server-commands-info': boolean
  dbus_proxy: boolean
  'rpc-types': string[]
  'auto-video-encoding': boolean
  'remote-logging': boolean
  'remote-logging.receive': boolean
  'remote-logging.multi-line': boolean
  'remote-logging.send': boolean
  'network.bandwidth-limit-change': boolean
  'network.bandwidth-limit': number
  shell: boolean
  window_refresh_config: boolean
  'window-filters': boolean
  'configure.pointer': boolean
  'cursor.default_size': XpraVector
  'cursor.max_size': XpraVector
  'gobject.version': string
  'gi.version': string
  'gtk.version': string
  'gdk.version': string
  'pixbuf.version': string
  'glib.version': string
  'cairo.version': string
  'pango.version': string
  resize_screen: string
  resize_exact: string
  force_ungrab: string
  'keyboard.fast-switching': boolean
  'wheel.precise': boolean
  'touchpad-device': boolean
  'screen-sizes': XpraVector[]
  'pointer.grabs': boolean
  'window.decorations': boolean
  'window.frame-extents': boolean
  'window.configure.delta': boolean
  'window.signals': string[]
  'window.dragndrop': boolean
  'window.states': string[]
  actual_desktop_size: XpraVector
  root_window_size: XpraVector
  aliases: boolean
  'sound.encoders': string[]
  'sound.sources': string[]
  'sound.source.default': string[]
  'sound.sinks': string[]
  'sound.sink.default': string[]
  'sound.muxers': string[]
  'sound.demuxers': string[]
  'sound.gst.version': string
  'sound.pygst.version': string
  'sound.plugins': string[]
  'sound.python.version': string
  'sound.python.bits': number
  'sound.device.Xpra-Speaker.monitor': string
  'sound.device.Xpra-Microphone.monitor': string
  'sound.device.Xpra-Speaker': string
  'sound.device.Xpra-Microphone': string
  'sound.devices': number
  'sound.pulseaudio.wrapper': string
  'sound.pulseaudio.found': boolean
  'sound.pulseaudio.id': string
  'sound.pulseaudio.server': string
  'sound.pulseaudio.cookie-hash': string
  'sound.codec-full-names': boolean
  modifier_keycodes?: XpraModifierKeycodes
}

export type XpraSendPacketType =
  | 'hello'
  | 'ping'
  | 'ping_echo'
  | 'desktop_size'
  | 'close-window'
  | 'map-window'
  | 'unmap-window'
  | 'configure-window'
  | 'damage-sequence'
  | 'pointer-position'
  | 'wheel-motion'
  | 'button-action'
  | 'key-action'
  | 'focus'
  | 'notification-close'
  | 'suspend'
  | 'resume'
  | 'buffer-refresh'
  | 'connection-data'
  | 'sound-control'
  | 'start-command'
  | 'clipboard-contents-none'
  | 'clipboard-contents'
  | 'clipboard-token'
  | 'logging'
  | 'send-file'
  | 'shutdown-server'
  | 'layout-changed'

export type XpraPacketArguments = any[] // FIXME: Maybe create a type and keyof/valueof dealio

export type XpraSendPacket = [XpraSendPacketType, ...XpraPacketArguments]

export type XpraPacketEncoder = 'bencode' | 'rencode' | 'rencodeplus' | 'auto'

export type XpraCompressor = 'zlib' | 'lz4' | 'none'

export type XpraRecieveHeader = number[]

export type XpraRecievePacket = [XpraRecievePacketType, ...XpraPacketArguments]

export type XpraRecievePacketType =
  | 'hello'
  | 'new-window'
  | 'window-icon'
  | 'startup-complete'
  | 'encodings'
  | 'cursor'
  | 'ping'
  | 'ping_echo'
  | 'draw'
  | 'setting-change'
  | 'window-move-resize'
  | 'window-resized'
  | 'raise-window'
  | 'lost-window'
  | 'window-metadata'
  | 'new-override-redirect'
  | 'configure-override-redirect'
  | 'notify_show'
  | 'notify_close'
  | 'bell'
  | 'initiate-moveresize'
  | 'send-file'
  | 'sound-data'
  | 'clipboard-token'
  | 'set-clipboard-enabled'
  | 'clipboard-request'
  | 'challenge'
  | 'info-response'
  | 'new-tray'
  | 'pointer-position'
  | 'eos'
  | 'disconnect'
  | 'open-url'

export type XpraServerCapabilities = XpraCommonCapability &
  XpraSoundCapability &
  XpraServerBaseCapability

export type XpraCapabilities = XpraCommonCapability &
  XpraBaseCapability &
  XpraCipherCapability &
  XpraEncodingCapability &
  XpraSoundCapability

export type XpraDrawEncoding =
  | 'webp'
  | 'jpeg'
  | 'png'
  | 'png/P'
  | 'png/L'
  | 'rgb32'
  | 'rgb24'
  | 'avif'
  | 'scroll'
  | 'void'
  | 'rgb'
  | 'h264'
  | 'mpeg1'
  | 'vp8+webm'
  | 'h264+mp4'
  | 'mpeg4+mp4'

export type XpraDrawScrollData = [
  number,
  number,
  number,
  number,
  number,
  number
][]

export type XpraVector = [number, number]

export interface XpraConnectionStats {
  lastServerPing: number
  lastClientEcho: number
  clientPingLatency: number
  serverPingLatency: number
  serverLoad: [number, number, number]
}

export interface XpraConnectionOptions {
  reconnect: boolean
  reconnectInterval: number
  reconnectAttempts: number
  pingInterval: number
  startNewSession: XpraStartNewSessionMode | null
  showStartMenu: boolean
  bandWidthLimit: number
  clipboardDirection: XpraClipboardDirection
  clipboardImages: boolean
  clipboard: boolean
  shareSession: boolean
  stealSession: boolean
  username: string
  password: string
  display: string
  fileTransfer: boolean
  printing: boolean
  connectionTimeout: number
  bell: boolean
  audio: boolean
  video: boolean
  nativeVideo: boolean
  cursor: boolean
  keyboard: boolean
  mouse: boolean
  tray: boolean
  notifications: boolean
  ssl: boolean
  encryption: string | null
  encryptionKey: string
  encoder: XpraPacketEncoder
  openUrl: boolean
  swapKeys: boolean
  keyboardLayout: string
  exitWithChildren: boolean
  exitWithClient: boolean
  startCommand: string
  reverseScrollX: boolean
  reverseScrollY: boolean
  debugPackets: string[]
  showStatistics: boolean
}

export interface XpraDrawOptions {
  pts?: number
  csc?: string
  type?: string
  frame?: number
  decode_time?: number
  flush?: number
  zlib?: number
  lz4?: number
}

export interface XpraDraw {
  wid: number
  encoding: XpraDrawEncoding
  position: XpraVector
  dimension: XpraVector
  image: Uint8Array | XpraDrawScrollData
  packetSequence: number
  rowStride: number
  options: XpraDrawOptions
  callback: (error?: Error) => void
}

export interface XpraNotification {
  id: number
  replacesId: number
  summary: string
  body: string
  expires: number
  icon: string | null
  actions: string[]
  hints: string[]
}

export interface XpraCursor {
  dimension: XpraVector
  xhot: number
  yhot: number
  image: string
}

export interface XpraWindowIcon {
  wid: number
  dimension: XpraVector
  image: string
}

export interface XpraWindowClientProperties {
  // TODO: Add types
}

export interface XpraWindowState {
  focused?: boolean
}

export type XpraWindowMetadataType =
  | ''
  | 'NORMAL'
  | 'DIALOG'
  | 'UTILITY'
  | 'DROPDOWN'
  | 'TOOLTIP'
  | 'POPUP_MENU'
  | 'MENU'
  | 'COMBO'
  | 'DESKTOP'

export interface XpraWindowMetadata {
  'has-alpha'?: boolean
  tray?: boolean
  'transient-for'?: number
  'window-type': XpraWindowMetadataType[]
  'class-instance': string[]
  'size-constraints'?: {
    'base-size'?: XpraVector
    'minimum-size'?: XpraVector
    'maximum-size'?: XpraVector
    increment?: XpraVector
    position?: XpraVector
    gravity?: number
  }
  iconic?: boolean
  title: string
  fullscreen?: boolean
  maximized?: boolean
  above?: boolean
  below?: boolean
  opacity?: number
  decorations?: number
  modal?: boolean
}

export interface XpraWindow {
  id: number
  position: XpraVector
  dimension: XpraVector
  metadata: XpraWindowMetadata
  clientProperties: XpraWindowClientProperties
  overrideRedirect: boolean
}

export interface XpraWindowMoveResize {
  wid: number
  position?: XpraVector
  dimension?: XpraVector
}

export interface XpraWindowInitiateMoveResize {
  wid: number
  position: XpraVector
  direction: number
  button: number
  sourceIndication: number
}

export interface XpraWindowMetadataUpdate {
  wid: number
  metadata: Partial<XpraWindowMetadata>
}

export interface XpraSendFile {
  print: boolean
  filename: string
  size: number
  mime: string
  blob: Blob
}

export interface XpraInfoResponse {
  // TODO: Add types
}

export interface XpraPointerPosition {
  wid: number
  position: XpraVector
}

export interface XpraXDGEntryData {
  Categories: string[]
  Comment: string
  Name: string
  Exec: string
  IconData?: string
  IconType?: string
  Type: string
}

export interface XpraXDGMenuData {
  IconData?: string
  IconType?: string
  Name: string
  Entries: Record<string, XpraXDGEntryData>
}

export type XpraXDGMenu = Record<string, XpraXDGMenuData>

export interface XpraXDGReducedMenuEntry {
  name: string
  exec: string
  icon?: string
  attributes: XpraXDGEntryData
}

export type XpraXDGReducedMenu = {
  name: string
  icon?: string
  entries: XpraXDGReducedMenuEntry[]
}[]

export type XpraSettingChangeValue = XpraXDGMenu | Record<string, string>

export type XpraMonitor = [
  string,
  number,
  number,
  number,
  number,
  number,
  number
]

export type XpraScreen = [
  string,
  number,
  number,
  number,
  number,
  XpraMonitor[],
  number,
  number,
  number,
  number
]

export type XpraClipboardDirection = 'to-server' | 'both'

export type XpraClipboardSelection = 'CLIPBOARD' | 'PRIMARY'

export type XpraClipboardTarget =
  | 'UTF8_STRING'
  | 'TEXT'
  | 'STRING'
  | 'text/plain'
  | 'image/png'

export type XpraRGBFormats = 'RGBX' | 'RGBA' | 'RGB'

export type XpraWorkerData = any

export type XpraWorkerMessage =
  | 'connected'
  | 'send'
  | 'recieve'
  | 'failure'
  | 'configure'
  | 'cipher'

export type XpraAudioFramework = 'mediasource' | 'aurora'

export type XpraAudioCodecType = string

export type XpraAudioCodec = string

export type XpraAudioCodecMap = Record<XpraAudioCodecType, XpraAudioCodec>

export type XpraAudioMetadata = string[]

export interface XpraAudioOptions {
  'start-of-stream'?: number
  'end-of-stream'?: number
}

export type XpraStartNewSessionMode = 'shadow' | 'start-desktop' | 'start'

export interface XpraStartNewSession {
  mode: XpraStartNewSessionMode
  'exit-with-children': boolean
  'start-child'?: string[]
  'exit-with-client': boolean
  start?: string[]
}

export type XpraXkbpMapKeycode = [number, string, number, number, number]

export type XpraModifierKeycodes = Record<string, [string, number][]>

export type XpraChallengeCallback = (password: string) => void

export interface XpraChallengePrompt {
  prompt: string
  serverSalt: string
  digest: string
  saltDigest: string
}

export enum XpraLogLevel {
  ERROR = 40,
  WARNING = 30,
  INFO = 20,
  DEBUG = 10,
}

export enum XpraInflateBit {
  ZLIB = 0x1,
  LZ4 = 0x10,
  LZO = 0x20,
  BROTLI = 0x40,
}

export enum XpraEncodeBit {
  BENCODE = 0x0,
  RENCODELEGACY = 0x1,
  RENCODEPLUS = 0x10,
}
