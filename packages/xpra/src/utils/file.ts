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

export interface BrowserFile {
  buffer: Uint8Array
  name: string
  size: number
  type: string
}

export async function browserLoadFile() {
  const input = document.createElement('input')
  input.type = 'file'

  const load = (blob: Blob) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        resolve(fileReader.result as ArrayBuffer)
      }

      fileReader.onerror = (ev: ProgressEvent) => {
        reject(ev)
      }

      fileReader.readAsArrayBuffer(blob)
    })

  return new Promise<BrowserFile[]>((resolve, reject) => {
    input.onchange = async () => {
      try {
        if (input.files) {
          const promises = Array.from(input.files).map((file) =>
            load(file).then(
              (buffer) =>
                ({
                  buffer,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                } as BrowserFile)
            )
          )

          const result = await Promise.all(promises)
          resolve(result)
        } else {
          resolve([])
        }
      } catch (e) {
        reject(e)
      }
    }

    input.click()
  })
}

export function browserSaveFile(name: string, blob: Blob | string) {
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob as Blob, name)
  } else {
    const url = blob instanceof Blob ? window.URL.createObjectURL(blob) : blob

    try {
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    } finally {
      window.URL.revokeObjectURL(url)
    }
  }
}

export function browserPrintFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)

  try {
    const win = window.open(url)
    if (!win || win.closed || win.closed !== undefined) {
      browserSaveFile(name, url)
    } else {
      win.print()
    }
  } finally {
    window.URL.revokeObjectURL(url)
  }
}
