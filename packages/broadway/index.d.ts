export default class Decoder {
  constructor(options: {
    rgb?: boolean
    size?: { width: number; height: number }
  })
  decode(buffer: Uint8Array): void
  onPictureDecoded: (buffer: Uint8Array, w: number, h: number) => void
}
