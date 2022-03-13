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

export const createXDGMenu = (value: XpraXDGMenu): XpraXDGReducedMenu =>
  Object.values(value as XpraXDGMenu).map((sub) => ({
    name: sub.Name,
    icon:
      sub.IconData && sub.IconType
        ? imageSourceFromData(sub.IconType, sub.IconData)
        : undefined,
    entries: Object.entries(sub.Entries).map(
      ([name, { IconType, IconData, ...attributes }]) => ({
        name,
        exec: attributes.Exec.replace(/%[uUfF]/g, ''),
        icon:
          IconData && IconType
            ? imageSourceFromData(IconType, IconData)
            : undefined,
        attributes,
      })
    ),
  }))
