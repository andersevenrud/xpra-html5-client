/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBars,
  faClipboard,
  faUpload,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

const additions = [faBars, faClipboard, faUpload, faChevronRight]
additions.forEach((icon) => library.add(icon))
