/* eslint-disable @typescript-eslint/no-explicit-any */
interface Screen {
  systemXDPI: number
  systemYDPI: number
}

interface Navigator {
  oscpu?: string
  cpuClass?: string
  msSaveOrOpenBlob?: (blob: Blob, name: string) => void
}

interface WheelEvent {
  wheelDelta: number
  wheelDeltaX: number
  wheelDeltaY: number
}

interface Window {
  xpra: any
  mscrypto: any
  WebKitMediaSource: MediaSource
}
