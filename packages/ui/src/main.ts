/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import '@fontsource/inter'
import './style.css'
import './app/icons'
import ReactDOM from 'react-dom'
import { createElement } from 'react'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'
import { initDarkMode } from './app/utils'
import { App } from './app/App'
import XpraWorker from './worker?worker'

async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')
  const worker = new XpraWorker()
  const xpra = new XpraClient({ worker })
  const wm = new XpraWindowManager(xpra)

  await xpra.init()
  wm.init()

  if (app) {
    ReactDOM.render(createElement(App, { xpra, wm }), app)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initDarkMode()
  main()
})
