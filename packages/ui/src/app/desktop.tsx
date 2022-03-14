/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useCallback,
  createRef,
  RefObject,
  FC,
} from 'react'
import { debounce } from 'lodash-es'
import {
  createCursorCSS,
  createCursorBackgroundCSS,
  useDrag,
  detectCorner,
} from './utils'
import { ActionTypes, AppWindowState } from './store'
import { XpraWindowManagerWindow, XpraVector } from 'xpra-html5-client'
import { FadeInOutTransition } from './transitions'
import { AppContext } from './context'
import defaultCursor from './cursor.png'

export const INPUT_DEBOUNCE_TIME = 10

export const DRAG_CORNER_SIZE = 16

let isDragging = false

/**
 * Window Buttons Component
 */
export const AppWindowButtons: FC<{
  winstance: XpraWindowManagerWindow
  win: AppWindowState
  bar: RefObject<HTMLDivElement>
  outer: RefObject<HTMLDivElement>
}> = ({ win, bar, winstance }) => {
  const { oldPosition, oldDimension } = win
  const { wm, xpra, root, dispatch } = useContext(AppContext)
  const buttonClassNames =
    'w-4 h-4 rounded-full cursor-pointer bg-gradient-to-b shadow-inner hover:shadow'

  const onMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation()
    ev.preventDefault()
  }

  const onMaximize = () => {
    if (bar.current && root) {
      if (win.maximized) {
        if (oldPosition && oldDimension) {
          wm.maximize(winstance, oldPosition, oldDimension)

          dispatch({
            type: ActionTypes.MaximizeWindow,
            payload: {
              wid: win.id,
              maximize: false,
            },
          })
        }
      } else {
        const x = 0
        const y = bar.current.offsetHeight
        const w = root.offsetWidth
        const h = root.offsetHeight - y

        wm.maximize(winstance, [x, y], [w, h])

        dispatch({
          type: ActionTypes.MaximizeWindow,
          payload: {
            wid: win.id,
            position: [x, y],
            dimension: [w, h],
            maximize: true,
          },
        })
      }
    }
  }

  return (
    <div className="flex items-center space-x-2" onMouseDown={onMouseDown}>
      <div
        title="Minimize"
        className={`${buttonClassNames} from-green-300 to-green-500 hover:from-green-400`}
        onClick={() => wm.minimize(winstance)}
      />
      <div
        title="Maximize"
        className={`${buttonClassNames} from-blue-300 to-blue-500 hover:from-blue-400`}
        onClick={onMaximize}
      />
      {!xpra.isReadOnly() && (
        <div
          title="Close"
          className={`${buttonClassNames} from-red-300 to-red-500 hover:from-red-400`}
          onClick={() => wm.close(winstance)}
        />
      )}
    </div>
  )
}

export const AppWindowIcon: FC<{ win: AppWindowState }> = ({
  win: { icon, title },
}) => {
  return (
    <>
      {icon && <img alt={title} src={icon.image} className="max-h-full" />}
      {!icon && <div className="w-full h-full bg-gray-500 rounded" />}
    </>
  )
}

/**
 * Window canvas Component
 */
export const AppWindowCanvas: FC<{
  id: number
}> = ({ id }) => {
  const root = useRef<HTMLDivElement | null>(null)
  const { wm, state } = useContext(AppContext)
  const winstance = wm.getWindow(id) as XpraWindowManagerWindow

  const canvasClassNames =
    state.draggingWindow >= 0 ? 'pointer-events-none' : ''

  const onMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
    wm.mouseButton(winstance, ev.nativeEvent, true)
  }

  const onMouseUp = (ev: React.MouseEvent<HTMLDivElement>) => {
    wm.mouseButton(winstance, ev.nativeEvent, false)
  }

  const onMouseMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()
    wm.mouseMove(winstance, ev.nativeEvent)
  }

  useEffect(() => {
    if (root.current) {
      root.current.appendChild(winstance.canvas)
    }
  }, [root.current])

  return (
    <div
      ref={root}
      className={canvasClassNames}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    />
  )
}

/**
 * Window Component
 */
export const AppWindow: FC<{ win: AppWindowState }> = ({ win }) => {
  const {
    id,
    position,
    dimension,
    title,
    minimized,
    maximized,
    opacity,
    zIndex,
    minDimension,
    maxDimension,
  } = win

  const [resizeCursor, setResizeCursor] = useState<string>('default')
  const { wm, dispatch, xpra } = useContext(AppContext)
  const root = useRef<HTMLDivElement | null>(null)
  const bar = useRef<HTMLDivElement | null>(null)
  const resizer = useRef<HTMLDivElement | null>(null)
  const winstance = wm.getWindow(id) as XpraWindowManagerWindow

  const style = {
    opacity,
    zIndex,
  }

  const resizerStyle = {
    cursor: resizeCursor,
  }

  const transitionParams = {
    toggled: !minimized,
    mountOnEnter: false,
    unmountOnExit: false,
  }

  const setSizeFromAction = (
    x: number,
    y: number,
    w: number,
    h: number,
    store = false
  ) => {
    if (root.current) {
      Object.assign(root.current.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      })
    }

    if (winstance?.canvas) {
      Object.assign(winstance.canvas.style, {
        width: `${w}px`,
        height: `${h}px`,
      })
    }

    if (store) {
      dispatch({
        type: ActionTypes.MoveResizeWindow,
        payload: {
          wid: id,
          position: [x, y],
          dimension: [w, h],
        },
      })
    }
  }

  const setSizeFromStore = (store = false) => {
    const [x, y] = position
    const [w, h] = dimension
    setSizeFromAction(x, y, w, h, store)
  }

  const roundValues =
    (
      cb: (x: number, y: number, w: number, h: number, moved?: boolean) => void
    ) =>
    (x: number, y: number, w: number, h: number, moved?: boolean) => {
      const [minW, minH] = minDimension || [100, 100]
      const [maxW, maxH] = maxDimension || [Number.MAX_VALUE, Number.MAX_VALUE]

      w = Math.min(maxW, Math.max(minW, w))
      h = Math.min(maxH, Math.max(minH, h))
      // x = Math.max(0, x)
      // y = Math.max(0, y)

      cb(x, y, w, h, moved)
    }

  const dragMoveMove = roundValues(
    (x: number, y: number, w: number, h: number) => {
      if (!xpra.isReadOnly() && !maximized) {
        setSizeFromAction(x, y, w, h)
      }

      setDragging(true)
    }
  )

  const dragMoveRelease = roundValues(
    (x: number, y: number, w: number, h: number, moved?: boolean) => {
      setDragging(false)

      if (!xpra.isReadOnly() && !maximized) {
        setSizeFromAction(x, y, w, h, true)

        if (moved) {
          wm.moveResize(winstance, [x, y], [w, h])
        }
      }
    }
  )

  const setDragging = (value: boolean) => {
    if (!isDragging) {
      dispatch({
        type: ActionTypes.SetDraggingWindow,
        payload: value ? id : -1,
      })
    }

    isDragging = value
  }

  const onRootMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    wm.raise(winstance)
    wm.mouseButton(null, ev.nativeEvent, true)

    dispatch({
      type: ActionTypes.RaiseWindow,
      payload: winstance.attributes,
    })
  }

  const onRootMouseMove = debounce((ev: React.MouseEvent<HTMLDivElement>) => {
    if (resizer.current) {
      const corner = detectCorner(
        resizer.current,
        [ev.pageX, ev.pageY],
        DRAG_CORNER_SIZE
      )
      setResizeCursor(`${corner}-resize`)
    } else {
      setResizeCursor('default')
    }
  }, INPUT_DEBOUNCE_TIME)

  const onDragMouseDown = useCallback(
    useDrag(() => {
      const [w, h] = dimension
      let [newX, newY] = position

      return {
        onMove(_, diffX, diffY) {
          newX = position[0] + diffX
          newY = position[1] + diffY

          dragMoveMove(newX, newY, w, h)
          setDragging(true)
        },
        onRelease(_, moved) {
          dragMoveRelease(newX, newY, w, h, moved)
        },
      }
    }),
    [position, dimension]
  )

  const onResizeMouseDown = useCallback(
    useDrag(() => {
      let corner = ''
      let [newX, newY] = position
      let [newW, newH] = dimension

      return {
        onDown(_, startX, startY) {
          if (resizer.current) {
            corner = detectCorner(
              resizer.current,
              [startX, startY],
              DRAG_CORNER_SIZE
            )
          }
        },

        onMove(_, diffX, diffY) {
          if (corner.startsWith('n')) {
            newH = dimension[1] - diffY
            newY = position[1] + diffY
          } else if (corner.startsWith('s')) {
            newH = dimension[1] + diffY
          }

          if (corner.endsWith('w')) {
            newW = dimension[0] - diffX
            newX = position[0] + diffX
          } else if (corner.endsWith('e')) {
            newW = dimension[0] + diffX
          }

          dragMoveMove(newX, newY, newW, newH)
        },
        onRelease(_, moved) {
          dragMoveRelease(newX, newY, newW, newH, moved)
        },
      }
    }),
    [resizer, position, dimension]
  )

  useEffect(() => {
    setSizeFromStore()
  }, [position, dimension])

  useEffect(() => {
    setSizeFromStore()
  }, [root])

  useEffect(() => {
    const [x, y] = position
    const [w, h] = dimension

    if (!xpra.isReadOnly()) {
      // TODO: Clamp position in all directions
      if (x <= 0 || y <= 0) {
        const newX = 100
        const newY = 100

        wm.moveResize(winstance, [newX, newY], [w, h])
        setSizeFromAction(newX, newY, w, h, true)
      }
    }
  }, [])

  if (winstance?.attributes?.overrideRedirect) {
    return (
      <FadeInOutTransition {...transitionParams}>
        <div
          className="absolute bg-black cursor-default shadow"
          ref={root}
          style={style}
          onMouseDown={onRootMouseDown}
        >
          <AppWindowCanvas id={id} />
        </div>
      </FadeInOutTransition>
    )
  }

  return (
    <FadeInOutTransition {...transitionParams}>
      <div
        ref={root}
        style={style}
        className="absolute"
        onMouseDown={onRootMouseDown}
        onMouseMove={onRootMouseMove}
      >
        <div
          ref={resizer}
          className="absolute z-10 -left-2 -top-10 -bottom-2 -right-2"
          style={resizerStyle}
          onMouseDown={onResizeMouseDown}
        />

        <div className="relative w-full h-full z-20 outline outline-1 outline-gray-200 shadow-xl">
          <div
            className="absolute -top-8 w-full flex items-center p-1 px-2 h-8 space-x-2 outline outline-1 outline-gray-200 bg-gray-100 cursor-default"
            ref={bar}
            onMouseDown={onDragMouseDown}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: '16px', height: '16px' }}
            >
              <AppWindowIcon win={win} />
            </div>
            <div className="flex-grow truncate text-sm">
              <span>{title || id}</span>
            </div>
            <AppWindowButtons
              winstance={winstance}
              win={win}
              bar={bar}
              outer={root}
            />
          </div>

          <div className="xpra-window-canvas w-full h-full bg-black">
            <AppWindowCanvas id={id} />
          </div>
        </div>
      </div>
    </FadeInOutTransition>
  )
}

/**
 * Desktop Component
 */
export const AppDesktop: FC = ({ children }) => {
  const root = createRef<HTMLDivElement>()
  const cursor = createRef<HTMLDivElement>()
  const { wm, state, setRoot, setCursor } = useContext(AppContext)

  const onMouseMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    wm.mouseMove(null, ev.nativeEvent)
  }

  const onContextMenu = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
  }

  const onMouseDown = useCallback((ev) => {
    wm.mouseButton(null, ev, true)
  }, [])

  const onMouseUp = useCallback((ev) => {
    wm.mouseButton(null, ev, false)
  }, [])

  const sharedCursor = {
    dimension: [32, 32] as XpraVector,
    xhot: 8,
    yhot: 3,
    image: defaultCursor,
    ...(state.cursor || {}),
  }

  const style = `
.xpra-cursor {
  background: ${createCursorBackgroundCSS(sharedCursor)};
}

.xpra-window-canvas {
  cursor: ${createCursorCSS(state.cursor, 'default')};
}
`

  const windows = state.windows.filter((w) => !w.tray)

  useEffect(() => {
    if (root.current) {
      setRoot(root.current)
    }
  }, [root.current])

  useEffect(() => {
    if (cursor.current) {
      setCursor(cursor.current)
    }
  }, [cursor.current])

  return (
    <>
      <div
        id="xpra-desktop"
        className="absolute inset-0 z-30 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-300 to-emerald-500"
        ref={root}
        onMouseMove={onMouseMove}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {state.connected &&
          windows.map((w) => <AppWindow key={w.id} win={w} />)}

        {children}
      </div>
      <div ref={cursor} className="xpra-cursor absolute z-50" />
      <style>{style}</style>
    </>
  )
}