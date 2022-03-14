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
  const { state } = useContext(AppContext)
  return (
    <>
      <FadeInOutTransition toggled={!state.connected}>
        <AppConnectionPanel />
      </FadeInOutTransition>

      <FadeInOutTransition toggled={!state.started && state.connected}>
        <AppConnectingPanel />
      </FadeInOutTransition>

      <AppDesktop>{state.connected && <AppDebugPanel />}</AppDesktop>

      <FadeInOutTransition toggled={state.started}>
        <AppTrayPanel />
      </FadeInOutTransition>
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
