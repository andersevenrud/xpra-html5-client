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

export function parseUrlQuerySearch<T>(
  search: string,
  {
    booleans = [],
    numbers = [],
    lists = [],
    required = [],
  }: {
    booleans?: string[]
    numbers?: string[]
    lists?: string[]
    required?: string[]
  }
): T {
  const params = new URLSearchParams(search)

  const entries = Array.from(params as unknown as ArrayLike<string>).map(
    ([k, v]) => {
      if (booleans.includes(k)) {
        return [k, ['1', 'true', 'on'].includes(String(v).toLowerCase())]
      } else if (numbers.includes(k)) {
        return [k, parseInt(v)]
      } else if (lists.includes(k)) {
        return [k, v.split(',')]
      }

      return [k, v ? v : undefined]
    }
  )

  return Object.fromEntries(
    entries.filter(
      ([k, v]) =>
        !required.length || (required.includes(k as string) && v !== undefined)
    )
  )
}
