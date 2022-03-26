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

export const getBrowserSupportsClipboard = () =>
  navigator.clipboard &&
  !!navigator.clipboard.readText &&
  !!navigator.clipboard.writeText

export async function browserReadClipboard(
  textType: string
): Promise<[string, string]> {
  if (navigator.clipboard.read) {
    const read = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader()

        fileReader.onload = () => {
          resolve(fileReader.result as string)
        }

        fileReader.onerror = (ev: ProgressEvent) => {
          reject(ev)
        }

        fileReader.readAsText(blob)
      })

    const data = await navigator.clipboard.read()
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      for (let j = 0; j < item.types.length; j++) {
        const itemType = item.types[j]
        const blob = await item.getType(itemType)
        const data = await read(blob)

        if (itemType === 'text/plain') {
          return [textType, data]
        } else if (itemType === 'image/png') {
          return [itemType, data]
        }
      }
    }
  }

  const text = await navigator.clipboard.readText()
  return [textType, text]
}

export async function browserWriteClipboard(data: string, binaryType?: string) {
  if (binaryType) {
    if (navigator.clipboard.write) {
      const blob = new Blob([data], { type: binaryType })
      const item = new ClipboardItem({ [binaryType]: blob })
      const items = [item]

      await navigator.clipboard.write(items)

      return true
    }
  } else {
    await navigator.clipboard.writeText(data)
    return true
  }

  return false
}
