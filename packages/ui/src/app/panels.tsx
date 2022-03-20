/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, { useContext, useState, useRef, useEffect, FC } from 'react'
import { ValueOf } from './types'
import { AppContext } from './context'
import { FadeInOutTransition } from './transitions'
import { ActionTypes, AppWindowState } from './store'
import { AppCheckbox, AppTextField, AppButton, AppSelect } from './inputs'
import { AppWindowCanvas, AppWindowIcon } from './desktop'
import {
  XPRA_KEYBOARD_LAYOUTS,
  XpraConnectionOptions,
  browserLoadFile,
} from 'xpra-html5-client'

interface AppMenuItem {
  icon?: string
  title: string
  callback?: () => void
  items?: AppMenuItem[]
}

const panelClassNames = [
  'shadow-lg',
  'bg-emerald-100/50',
  'opacity-90',
  'rounded',
]

const cs = (...args: string[]) => args.join(' ')

export const AppMenu: FC<{
  items: AppMenuItem[]
  root?: boolean
  onCallback?: () => void
}> = ({
  items,
  onCallback = () => {
    /*noop */
  },
  root = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hovering, setHovering] = useState(-1)

  const classNames = ['max-h-96', 'max-w-xs']
  if (root) {
    classNames.push('top-full', 'left-0')
  } else {
    classNames.push('top-0', 'left-full', 'overflow-auto')
  }

  const onMouseOver = (i: number) => setHovering(i)
  const onMouseLeave = () => setHovering(-1)
  const onClose = (fn?: () => void) => {
    if (fn) {
      fn()
    }
    onCallback()
  }

  if (root) {
    const checkOutsideClick = (ev: MouseEvent) => {
      if (ref.current) {
        const target = ev.target as HTMLElement
        const hit =
          target &&
          (ref.current.contains(target) || target === ref.current.parentNode)

        if (!hit) {
          onClose()
        }
      }
    }

    useEffect(() => {
      document.addEventListener('click', checkOutsideClick)

      return () => {
        document.removeEventListener('click', checkOutsideClick)
      }
    }, [ref])
  }

  return (
    <div
      ref={ref}
      className={cs('absolute', 'shadow', 'bg-emerald-100/80', ...classNames)}
      onMouseLeave={onMouseLeave}
    >
      {items.map(({ icon, title, items, callback }, i) => (
        <div key={i} className="relative text-left">
          <div
            className="p-2 hover:bg-white truncate flex space-x-2 items-center"
            onClick={() => onClose(callback)}
            onMouseOver={() => onMouseOver(i)}
          >
            {icon && <img src={icon} className="w-4 h-4" />}
            <span>{title}</span>
          </div>
          {hovering === i && items && items.length > 0 && (
            <AppMenu root={false} items={items} />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Panel Wrapper
 */
export const AppPanel: FC<{ classNames: string[] }> = ({
  classNames,
  children,
}) => {
  const className = cs('absolute', 'z-50', ...panelClassNames, ...classNames)

  return <div className={className}>{children}</div>
}

export const AppConnectionPanel: FC = () => {
  const { xpra, state, dispatch } = useContext(AppContext)

  const optionsLabel = state.showOptions ? 'Hide options' : 'Show options'

  const updateOption = (
    key: keyof XpraConnectionOptions,
    value: ValueOf<XpraConnectionOptions>
  ) =>
    dispatch({
      type: ActionTypes.SetOption,
      payload: [key, value],
    })

  const enc = Object.fromEntries(
    ['CBC', 'CFB', 'CTR'].map((k) => `AES-${k}`).map((k) => [k, k])
  )

  const inputs = [
    {
      key: 'reconnect',
      label: 'Automatically reconnect',
      component: AppCheckbox,
    },
    {
      key: 'shareSession',
      label: 'Share Session',
      component: AppCheckbox,
    },
    {
      key: 'stealSession',
      label: 'Steal Session',
      component: AppCheckbox,
    },
    {
      key: 'clipboard',
      label: 'Clipboard',
      component: AppCheckbox,
    },
    {
      key: 'clipboardImages',
      label: 'Clipboard Images',
      component: AppCheckbox,
    },
    {
      key: 'fileTransfer',
      label: 'File Transfer',
      component: AppCheckbox,
    },
    {
      key: 'printing',
      label: 'Printing',
      component: AppCheckbox,
    },
    {
      key: 'bell',
      label: 'Bell',
      component: AppCheckbox,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      component: AppCheckbox,
    },
    {
      key: 'openUrl',
      label: 'Open URLs',
      component: AppCheckbox,
    },
    {
      key: 'audio',
      label: 'Audio',
      component: AppCheckbox,
    },
    {
      key: 'showStartMenu',
      label: 'XDG Menu',
      component: AppCheckbox,
    },
    {
      key: 'swapKeys',
      label: 'Swap Ctrl and Cmd key',
      component: AppCheckbox,
    },
    {
      key: 'reverseScrollX',
      label: 'Reverse X scroll',
      component: AppCheckbox,
    },
    {
      key: 'reverseScrollY',
      label: 'Reverse Y scroll',
      component: AppCheckbox,
    },
    {
      key: 'keyboardLayout',
      label: 'Keyboard Layout',
      component: AppSelect,
      options: XPRA_KEYBOARD_LAYOUTS,
    },
  ].map((input) => ({
    ...input,
    value: state.options[input.key as keyof XpraConnectionOptions],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) =>
      updateOption(input.key as keyof XpraConnectionOptions, ev.target.value),
  }))

  const onHostChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: ActionTypes.SetHost,
      payload: ev.target.value,
    })

  const onUsernameChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    updateOption('username', ev.target.value)

  const onPasswordChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    updateOption('password', ev.target.value)

  const onEncChange = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    updateOption('encryption', ev.target.value || null)

  const onKeyChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    updateOption('encryptionKey', ev.target.value)

  const onConnect = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    dispatch({
      type: ActionTypes.SetError,
      payload: '',
    })

    xpra.connect(state.host, state.options)
  }

  const onOptionsClick = () =>
    dispatch({
      type: ActionTypes.SetShowOptions,
      payload: !state.showOptions,
    })

  return (
    <AppPanel
      classNames={[
        'p-8',
        'top-1/2',
        'left-1/2 transform',
        '-translate-x-1/2',
        '-translate-y-1/2',
        'w-11/12',
        'max-w-xl',
        'max-h-full',
        'overflow-auto',
      ]}
    >
      <form className="space-y-4" onSubmit={onConnect}>
        <div className="space-y-2">
          <AppTextField
            required
            placeholder="Host"
            value={state.host}
            onChange={onHostChange}
          />

          <div className="grid gap-2 grid-cols-2">
            <AppTextField
              placeholder="Username"
              value={state.options.username}
              onChange={onUsernameChange}
            />

            <AppTextField
              type="password"
              placeholder="Password"
              value={state.options.password}
              onChange={onPasswordChange}
            />

            <AppSelect
              disabled
              value={state.options.encryption || ''}
              options={{ '': 'No encryption', ...enc }}
              onChange={onEncChange}
            />

            <AppTextField
              disabled
              type="password"
              placeholder="Encryption key"
              value={state.options.encryptionKey}
              onChange={onKeyChange}
            />
          </div>
        </div>

        {state.error && (
          <div className="bg-red-300 border border-red-500 text-red-500 p-2 rounded">
            {state.error}
          </div>
        )}

        <div className="flex space-x-2">
          <AppButton label="Connect" type="submit" />
          <AppButton label={optionsLabel} onClick={onOptionsClick} />
        </div>

        <FadeInOutTransition toggled={state.showOptions}>
          <div className="px-2 text-sm">
            {inputs.map(({ component, key, ...input }) => {
              const Component = component as FC
              return <Component key={key} {...input} />
            })}
          </div>
        </FadeInOutTransition>
      </form>
    </AppPanel>
  )
}

/**
 * Connection panel
 */
export const AppDebugPanel: FC = () => {
  const { state } = useContext(AppContext)

  const rows = [
    ['Last server ping', state.stats.lastServerPing],
    ['Last client echo', state.stats.lastClientEcho],
    ['Client ping latency', state.stats.clientPingLatency],
    ['Server ping latency', state.stats.serverPingLatency],
    ['Server load', state.stats.serverLoad.join(' / ')],
    ['Window count', state.windows.length],
  ]

  return (
    <div className="absolute bottom-1 left-1 p-1 z-0 opacity-50 bg-emerald-100 rounded">
      <table className="text-xs">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="p-1">{label}</td>
              <td className="p-1 text-right text-gray-500">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Minimized window tray
 */
export const AppTrayPanel: FC = () => {
  const { wm, state, dispatch, xpra } = useContext(AppContext)

  const [menuVisible, setMenuVisible] = useState(false)
  const minimized = state.windows.filter((w) => w.minimized)
  const trays = state.windows.filter((w) => w.tray)

  const menu = [
    ...state.menu.map((sub) => ({
      title: sub.name,
      icon: sub.icon,
      items: sub.entries.map((entry) => ({
        title: entry.name,
        icon: entry.icon,
        callback: () => {
          xpra.sendStartCommand(entry.name, entry.exec, false)
        },
      })),
    })),
    {
      title: 'Server',
      items: [
        {
          title: 'Shutdown server',
          callback: () => {
            if (confirm('Are you sure you want to shut down the server ?')) {
              xpra.sendShutdown()
            }
          },
        },
      ],
    },
  ]

  const onDisconnect = () => xpra.disconnect()

  const onClick =
    (w: AppWindowState) => (ev: React.MouseEvent<HTMLButtonElement>) => {
      ev.stopPropagation()
      ev.preventDefault()

      const win = wm.getWindow(w.id)
      if (win) {
        wm.restore(win)
        wm.raise(win)

        dispatch({
          type: ActionTypes.RaiseWindow,
          payload: win.attributes,
        })
      }
    }

  const onMenuToggle = () => setMenuVisible(!menuVisible)

  const onMenuCallback = () => {
    setMenuVisible(false)
  }

  const onPollClipboard = () => xpra.clipboard.poll()

  const onFileUpload = async () => {
    const files = await browserLoadFile()
    files.forEach(({ buffer, name, size, type }) =>
      xpra.sendFile(name, type, size, buffer)
    )
  }

  return (
    <AppPanel
      classNames={[
        'top-1',
        'left-1/2',
        '-translate-x-1/2',
        'p-1',
        'select-none',
      ]}
    >
      <div className="flex space-x-4 px-2">
        <div className="flex space-x-1">
          {state.menu.length > 0 && (
            <AppButton transparent={true} onClick={onMenuToggle}>
              <i className="fa fa-bars pointer-events-none" />
              <FadeInOutTransition toggled={menuVisible}>
                <AppMenu items={menu} onCallback={onMenuCallback} />
              </FadeInOutTransition>
            </AppButton>
          )}

          <AppButton transparent={true} onClick={onDisconnect}>
            <i className="fa fa-unlink" />
          </AppButton>

          {state.options.clipboard && (
            <AppButton transparent={true} onClick={onPollClipboard}>
              <i className="fa fa-clipboard" />
            </AppButton>
          )}
          {state.options.fileTransfer && (
            <AppButton transparent={true} onClick={onFileUpload}>
              <i className="fa fa-upload" />
            </AppButton>
          )}
        </div>

        {minimized.length > 0 && (
          <div className="flex space-x-1">
            {minimized.map((win) => (
              <AppButton key={win.id} transparent={true} onClick={onClick(win)}>
                <div
                  className="flex space-x-1 items-center"
                  style={{ maxWidth: '128px' }}
                >
                  <div className="w-4 h-4">
                    <AppWindowIcon win={win} />
                  </div>
                  <div className="truncate text-center text-sm">
                    {win.title}
                  </div>
                </div>
              </AppButton>
            ))}
          </div>
        )}

        {trays.length > 0 && (
          <div className="flex space-x-1">
            {trays.map((win) => (
              <div key={win.id} className="flex space-x-1 items-center">
                <div
                  className="flex items-center justify-center w-4 h-4 overflow-hidden"
                  title={win.title}
                >
                  <AppWindowCanvas id={win.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppPanel>
  )
}

export const AppConnectingPanel: FC = () => {
  const { state, xpra } = useContext(AppContext)

  const onDisconnect = () => xpra.disconnect()
  return (
    <AppPanel
      classNames={[
        'p-8',
        'top-1/2',
        'left-1/2 transform',
        '-translate-x-1/2',
        '-translate-y-1/2',
        'w-96',
      ]}
    >
      <div className="space-y-4">
        <div className="text-center">Connecting to {state.host}</div>
        <div>
          <AppButton onClick={onDisconnect}>Cancel</AppButton>
        </div>
      </div>
    </AppPanel>
  )
}
