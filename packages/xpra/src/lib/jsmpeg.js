/**
 * From jsmppeg source
 * Chroma values are the same for each block of 4 pixels, so we proccess
 * 2 lines at a time, 2 neighboring pixels each.
 * I wish we could use 32bit writes to the RGBA buffer instead of writing
 * each byte separately, but we need the automatic clamping of the RGBA
 * buffer.
 */
export function YCbCrToRGBA(width, height, rgba, y, cb, cr) {
  const w = ((width + 15) >> 4) << 4
  const w2 = w >> 1

  let yIndex1 = 0
  let yIndex2 = w
  const yNext2Lines = w + (w - width)

  let cIndex = 0
  const cNextLine = w2 - (width >> 1)

  let rgbaIndex1 = 0
  let rgbaIndex2 = width * 4
  const rgbaNext2Lines = width * 4

  const cols = width >> 1
  const rows = height >> 1

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ccb = cb[cIndex]
      const ccr = cr[cIndex]
      cIndex++

      const r = ccb + ((ccb * 103) >> 8) - 179
      const g = ((ccr * 88) >> 8) - 44 + ((ccb * 183) >> 8) - 91
      const b = ccr + ((ccr * 198) >> 8) - 227

      // Line 1
      const y1 = y[yIndex1++]
      const y2 = y[yIndex1++]
      rgba[rgbaIndex1] = y1 + r
      rgba[rgbaIndex1 + 1] = y1 - g
      rgba[rgbaIndex1 + 2] = y1 + b
      rgba[rgbaIndex1 + 4] = y2 + r
      rgba[rgbaIndex1 + 5] = y2 - g
      rgba[rgbaIndex1 + 6] = y2 + b
      rgbaIndex1 += 8

      // Line 2
      const y3 = y[yIndex2++]
      const y4 = y[yIndex2++]
      rgba[rgbaIndex2] = y3 + r
      rgba[rgbaIndex2 + 1] = y3 - g
      rgba[rgbaIndex2 + 2] = y3 + b
      rgba[rgbaIndex2 + 4] = y4 + r
      rgba[rgbaIndex2 + 5] = y4 - g
      rgba[rgbaIndex2 + 6] = y4 + b
      rgbaIndex2 += 8
    }

    yIndex1 += yNext2Lines
    yIndex2 += yNext2Lines
    rgbaIndex1 += rgbaNext2Lines
    rgbaIndex2 += rgbaNext2Lines
    cIndex += cNextLine
  }
}

export class NullSurface {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.imageData = null
  }

  destroy() {}
  resize() {}
  renderProgress() {}

  render(y, cb, cr) {
    const imageData = new ImageData(this.width, this.height)
    YCbCrToRGBA(this.width, this.height, imageData.data, y, cb, cr)
    this.imageData = imageData
  }
}
