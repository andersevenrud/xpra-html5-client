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

import { XpraPacketWorker, XpraDecodeWorker } from '../worker'
import { XpraWorkerData } from '../../types'

/**
 * Local decode worker instance.
 * Runs in main thread so this has performance impacts.
 */
export class XpraDecodeNullWorker extends XpraDecodeWorker {
  constructor() {
    super()
    console.warn(
      'XpraNullDecodeWorker',
      'using null worker impacts performance'
    )
  }

  protected init() {
    this.on('post', ([cmd, data]) => this.processMessage(cmd, data))
  }

  protected send(cmd: string, data: XpraWorkerData) {
    this.emit('message', [cmd, data])
  }
}

/**
 * Local packet worker instance.
 * Runs in main thread so this has performance impacts.
 */
export class XpraPacketNullWorker extends XpraPacketWorker {
  constructor() {
    super()
    console.warn(
      'XpraNullPacketWorker',
      'using null worker impacts performance'
    )
  }

  protected init() {
    this.on('post', ([cmd, data]) => this.processMessage(cmd, data))
  }

  protected send(cmd: string, data: XpraWorkerData) {
    this.emit('message', [cmd, data])
  }
}
