/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, { useContext } from 'react'
import { AppContext, AppContextProvider } from './context'
import { AppDesktop } from './desktop'
import {
  AppConnectionPanel,
  AppDebugPanel,
  AppTrayPanel,
  AppConnectingPanel,
} from './panels'
import { FadeInOutTransition } from './transitions'
import { XpraClient, XpraWindowManager } from 'xpra-html5-client'

export function AppInner() {
  const { state, xpra } = useContext(AppContext)
  const enableStats = xpra.getOptions().showStatistics

  return (
    <>
      <FadeInOutTransition toggled={!state.connected}>
        <AppConnectionPanel />
      </FadeInOutTransition>

      <FadeInOutTransition toggled={!state.started && state.connected}>
        <AppConnectingPanel />
      </FadeInOutTransition>

      <AppDesktop>
        {state.connected && enableStats && <AppDebugPanel />}
      </AppDesktop>

      <FadeInOutTransition toggled={state.started}>
        <AppTrayPanel />
      </FadeInOutTransition>

      <div className="fixed z-50 bottom-0 right-0 text-xs text-right opacity-50 p-2">
        <a
          className="underline"
          rel="noreferrer"
          target="_blank"
          href="https://github.com/andersevenrud/xpra-html5-client"
        >
          xpra-html5-client on Github
        </a>
      </div>
    </>
  )
}

export function App({ xpra, wm }: { xpra: XpraClient; wm: XpraWindowManager }) {
  return (
    <AppContextProvider wm={wm} xpra={xpra}>
      <AppInner />
    </AppContextProvider>
  )
}
