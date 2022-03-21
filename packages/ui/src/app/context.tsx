/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, {
  useEffect,
  useReducer,
  useState,
  createContext,
  FC,
  Dispatch,
} from 'react'
import {
  XpraClient,
  XpraWindow,
  XpraWindowIcon,
  XpraConnectionStats,
  XpraWindowMoveResize,
  XpraWindowMetadataUpdate,
  XpraCursor,
  XpraWindowManager,
  XpraNotification,
  XpraWindowInitiateMoveResize,
  XpraConnectionStatus,
  XpraPointerPosition,
  XpraXDGReducedMenu,
  XpraClientChallengePrompt,
  createXpraConnectionOptionsFromUrl,
  parseUrlQuerySearch,
} from 'xpra-html5-client'
import {
  ActionTypes,
  AppState,
  AppStateActions,
  initialState,
  stateReducer,
} from './store'

export type AppContextProps = {
  xpra: XpraClient
  wm: XpraWindowManager
}

export const AppContext = createContext<{
  wm: XpraWindowManager
  xpra: XpraClient
  state: AppState
  root: HTMLElement | null
  dispatch: Dispatch<AppStateActions>
  setRoot: Dispatch<HTMLElement | null>
  setCursor: Dispatch<HTMLElement | null>
}>({
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  wm: null!,
  xpra: null!,
  state: initialState,
  root: null,
  setRoot: () => {
    /*placeholder*/
  },
  setCursor: () => {
    /*placeholder*/
  },
  dispatch: () => {
    /*placeholder */
  },
})

const otherOptions = parseUrlQuerySearch<{
  connect: boolean
  host: string
}>({
  booleans: ['connect'],
  required: ['connect', 'host'],
})

const createdOptions = createXpraConnectionOptionsFromUrl()

const initialCreatedState = {
  ...initialState,
  ...otherOptions,
  options: {
    ...initialState.options,
    ...createdOptions,
  },
}

export const AppContextProvider: FC<AppContextProps> = ({
  children,
  wm,
  xpra,
}) => {
  const [state, dispatch] = useReducer(stateReducer, initialCreatedState)
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const [cursor, setCursor] = useState<HTMLElement | null>(null)

  const setConnected = () => {
    dispatch({
      type: ActionTypes.SetConnected,
      payload: true,
    })

    dispatch({
      type: ActionTypes.SetError,
      payload: '',
    })
  }

  const setDisconnected = (s: XpraConnectionStatus) => {
    dispatch({
      type: ActionTypes.SetConnected,
      payload: s !== 'disconnected',
    })
    dispatch({
      type: ActionTypes.ClearWindows,
    })
  }

  const addWindow = (attributes: XpraWindow) =>
    dispatch({
      type: ActionTypes.AddWindow,
      payload: attributes,
    })

  const removeWindow = (wid: number) =>
    dispatch({
      type: ActionTypes.RemoveWindow,
      payload: wid,
    })

  const addWindowIcon = (icon: XpraWindowIcon) =>
    dispatch({
      type: ActionTypes.SetWindowIcon,
      payload: icon,
    })

  const updateStats = (stats: XpraConnectionStats) =>
    dispatch({
      type: ActionTypes.UpdateStats,
      payload: stats,
    })

  const updateCursor = (cursor: XpraCursor | null) =>
    dispatch({
      type: ActionTypes.SetCursor,
      payload: cursor,
    })

  const resizeMoveWindow = (data: XpraWindowMoveResize) =>
    dispatch({
      type: ActionTypes.MoveResizeWindow,
      payload: data,
    })

  const raiseWindow = (wid: number) => {
    const win = wm.getWindow(wid)
    if (win) {
      dispatch({
        type: ActionTypes.RaiseWindow,
        payload: win.attributes,
      })
    }
  }

  const updateMetadata = (data: XpraWindowMetadataUpdate) =>
    dispatch({
      type: ActionTypes.UpdateMetadata,
      payload: data,
    })

  const initiateMoveResize = (_: XpraWindowInitiateMoveResize) => {
    /* TODO: Implement */
  }

  const showNotification = async (notif: XpraNotification) =>
    dispatch({
      type: ActionTypes.AddNotification,
      payload: [notif, await wm.createNotification(notif)],
    })

  const hideNotification = (nid: number) =>
    dispatch({
      type: ActionTypes.RemoveNotification,
      payload: nid,
    })

  const pointerPosition = (pointer: XpraPointerPosition) => {
    if (cursor) {
      const [x, y] = pointer.position
      Object.assign(cursor.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    }
  }

  const setError = (error: string) =>
    dispatch({
      type: ActionTypes.SetError,
      payload: error,
    })

  const updateMenu = (payload: XpraXDGReducedMenu) =>
    dispatch({
      type: ActionTypes.UpdateMenu,
      payload,
    })

  const sessionStarted = () =>
    dispatch({
      type: ActionTypes.SetStarted,
      payload: true,
    })

  const challengePrompt = (
    _prompt: XpraClientChallengePrompt,
    cb: (password: string) => void
  ) => {
    const password = prompt('Login password')
    cb(password || '')
  }

  useEffect(() => {
    xpra.on('connect', setConnected)
    xpra.on('disconnect', setDisconnected)
    xpra.on('newWindow', addWindow)
    xpra.on('removeWindow', removeWindow)
    xpra.on('windowIcon', addWindowIcon)
    xpra.on('pong', updateStats)
    xpra.on('cursor', updateCursor)
    xpra.on('moveResizeWindow', resizeMoveWindow)
    xpra.on('updateWindowMetadata', updateMetadata)
    xpra.on('raiseWindow', raiseWindow)
    xpra.on('initiateMoveResize', initiateMoveResize)
    xpra.on('showNotification', showNotification)
    xpra.on('hideNotification', hideNotification)
    xpra.on('pointerPosition', pointerPosition)
    xpra.on('newTray', addWindow)
    xpra.on('updateXDGMenu', updateMenu)
    xpra.on('error', setError)
    xpra.on('sessionStarted', sessionStarted)
    xpra.on('challengePrompt', challengePrompt)

    return () => {
      xpra.off('connect', setConnected)
      xpra.off('disconnect', setDisconnected)
      xpra.off('newWindow', addWindow)
      xpra.off('removeWindow', removeWindow)
      xpra.off('windowIcon', addWindowIcon)
      xpra.off('pong', updateStats)
      xpra.off('cursor', updateCursor)
      xpra.off('moveResizeWindow', resizeMoveWindow)
      xpra.off('updateWindowMetadata', updateMetadata)
      xpra.off('raiseWindow', raiseWindow)
      xpra.off('initiateMoveResize', initiateMoveResize)
      xpra.off('showNotification', showNotification)
      xpra.off('hideNotification', hideNotification)
      xpra.off('pointerPosition', pointerPosition)
      xpra.off('newTray', addWindow)
      xpra.off('updateXDGMenu', updateMenu)
      xpra.off('error', setError)
      xpra.off('sessionStarted', sessionStarted)
      xpra.off('challengePrompt', challengePrompt)
    }
  }, [])

  useEffect(() => {
    if (state.connect) {
      xpra.connect(state.host, state.options)
    }
  }, [])

  useEffect(() => {
    wm.setDesktopElement(root)
  }, [root])

  useEffect(() => {
    wm.setActiveWindow(state.activeWindow)
  }, [state.activeWindow])

  return (
    <AppContext.Provider
      value={{ state, dispatch, root, wm, xpra, setRoot, setCursor }}
    >
      {children}
    </AppContext.Provider>
  )
}
