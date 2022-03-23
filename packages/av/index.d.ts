export class XpraSource {
  play(): void
  start(): void
  pause(): void
  reset(): void
  context?: {
    close: () => void
  }
  asset: {
    source: {
      _on_data: (buffer: Uint8Array) => void
    }
  }
  _on_data(data: ArrayBuffer): void
}

export namespace Decoder {
  export function find(str: string): string
}
export namespace Player {
  export function fromXpraSource(): XpraSource
}
export namespace Asset {
  export function fromXpraSource(): XpraSource
}
