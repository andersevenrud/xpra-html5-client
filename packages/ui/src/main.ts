/**
 * Xpra Typescript Client Example
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import '@fontsource/inter'
import './style.css'
import './app/icons'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'
import { initDarkMode } from './app/utils'
import { App } from './app/App'
import XpraWorker from './worker?worker'
import XpraDecoder from './decoder?worker'

async function main() {
  const app = document.querySelector<HTMLDivElement>('#app')
  const worker = new XpraWorker()
  const decoder = new XpraDecoder()
  const xpra = new XpraClient({ worker, decoder })
  const wm = new XpraWindowManager(xpra)

  await xpra.init()
  wm.init()

  if (app) {
    const root = createRoot(app)
    root.render(createElement(App, { xpra, wm }))
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initDarkMode()
  main()
})
