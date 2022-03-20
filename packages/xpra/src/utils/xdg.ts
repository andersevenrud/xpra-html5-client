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

import { XpraXDGMenu, XpraXDGReducedMenu } from '../types'
import { imageSourceFromData } from '../utils/image'

const createIcon = (type?: string, data?: string) =>
  data && type ? imageSourceFromData(type, data) : undefined

/**
 * Creates an array-based data structure from the XDG data recieced
 * from the server. This makes it a lot easier to use in states, etc.
 */
export const createXDGMenu = (value: XpraXDGMenu): XpraXDGReducedMenu =>
  Object.values(value as XpraXDGMenu).map((sub) => {
    const keys = Object.keys(sub.Entries)
    const collator = new Intl.Collator()
    keys.sort((a, b) => collator.compare(a, b))

    const mapped = Object.fromEntries(keys.map((k) => [k, sub.Entries[k]]))

    const entries = Object.entries(mapped).map(
      ([name, { IconType, IconData, ...attributes }]) => ({
        name,
        exec: attributes.Exec.replace(/%[uUfF]/g, ''),
        icon: createIcon(IconType, IconData),
        attributes,
      })
    )

    return {
      name: sub.Name,
      icon: createIcon(sub.IconType, sub.IconData),
      entries,
    }
  })
