/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import './style.css'
import ReactDOM from 'react-dom'
import { createElement } from 'react'
import { XpraClient, XpraWindowManager } from './xpra'
import { App } from './ui/App'
import XpraWorker from './xpra/workers/webworker?worker'

async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')
  const worker = new XpraWorker()
  const xpra = new XpraClient(worker)
  const wm = new XpraWindowManager(xpra)

  await xpra.init()
  wm.init()

  if (app) {
    ReactDOM.render(createElement(App, { xpra, wm }), app)
  }

  window.xpra = { xpra }
}

window.addEventListener('DOMContentLoaded', () => {
  main()
})
