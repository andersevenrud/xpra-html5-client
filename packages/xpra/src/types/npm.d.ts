declare module 'lz4js' {
  export function decompressBlock(
    src: Uint8Array,
    dest: Uint8Array,
    sindex: number,
    slength: number,
    dindex: number
  ): void
}
