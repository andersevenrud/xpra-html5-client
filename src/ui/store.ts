/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import { ActionMap, ValueOf } from './types'
import { createOpacity } from './utils'
import {
  XpraWindow,
  XpraWindowIcon,
  XpraConnectionStats,
  XpraWindowMoveResize,
  XpraWindowMetadataUpdate,
  XpraCursor,
  XpraNotification,
  XpraVector,
  XpraConnectionOptions,
  XpraXDGReducedMenu,
  defaultXpraConnectionOptions,
  initialXpraConnectionStats,
  createXpraWindowBaseZindex,
} from '../xpra'

export interface AppWindowState {
  id: number
  title: string
  minimized: boolean
  maximized: boolean
  position: XpraVector
  dimension: XpraVector
  icon?: XpraWindowIcon
  zIndex: number
  tray: boolean
  opacity?: number
  maxDimension?: XpraVector
  minDimension?: XpraVector
  oldPosition?: XpraVector
  oldDimension?: XpraVector
}

export interface AppState {
  connect: boolean
  host: string
  showOptions: boolean
  connected: boolean
  cursor: XpraCursor | null
  stats: XpraConnectionStats
  windows: AppWindowState[]
  draggingWindow: number
  activeWindow: number
  notifications: [XpraNotification, Notification | null][]
  actualDesktopSize: XpraVector
  options: XpraConnectionOptions
  menu: XpraXDGReducedMenu
  error: string
  started: boolean
}

export interface AppMaximizeWindow {
  wid: number
  position?: XpraVector
  dimension?: XpraVector
  maximize: boolean
}

export enum ActionTypes {
  SetHost = 'SET_HOST',
  SetShowOptions = 'SET_SHOW_OPTIONS',
  AddWindow = 'ADD_WINDOW',
  RemoveWindow = 'REMOVE_WINDOW',
  SetWindowIcon = 'SET_WINDOW_ICON',
  SetConnected = 'SET_CONNECTED',
  SetCursor = 'SET_CURSOR',
  UpdateStats = 'UPDATE_STATS',
  MoveResizeWindow = 'MOVE_RESIZE_WINDOW',
  MaximizeWindow = 'MAXIMIZE_WINDOW',
  UpdateMetadata = 'UPDATE_METADATA',
  RaiseWindow = 'RAISE_WINDOW',
  AddNotification = 'ADD_NOTIFICATION',
  RemoveNotification = 'REMOVE_NOTIFICATION,',
  SetDraggingWindow = 'SET_DRAGGING_WINDOW',
  ClearWindows = 'CLEAR_WINDOWS',
  SetOption = 'SET_OPTION',
  UpdateMenu = 'UPDATE_MENU',
  SetError = 'SET_ERROR',
  SetStarted = 'SET_STARTED',
}

export type AppStatePayload = {
  [ActionTypes.SetHost]: string
  [ActionTypes.SetShowOptions]: boolean
  [ActionTypes.AddWindow]: XpraWindow
  [ActionTypes.RemoveWindow]: number
  [ActionTypes.SetWindowIcon]: XpraWindowIcon
  [ActionTypes.SetConnected]: boolean
  [ActionTypes.SetCursor]: XpraCursor | null
  [ActionTypes.UpdateStats]: XpraConnectionStats
  [ActionTypes.MoveResizeWindow]: XpraWindowMoveResize
  [ActionTypes.MaximizeWindow]: AppMaximizeWindow
  [ActionTypes.UpdateMetadata]: XpraWindowMetadataUpdate
  [ActionTypes.RaiseWindow]: XpraWindow
  [ActionTypes.AddNotification]: [XpraNotification, Notification | null]
  [ActionTypes.RemoveNotification]: number
  [ActionTypes.SetDraggingWindow]: number
  [ActionTypes.ClearWindows]: undefined
  [ActionTypes.SetOption]: [
    keyof XpraConnectionOptions,
    ValueOf<XpraConnectionOptions>
  ]
  [ActionTypes.UpdateMenu]: XpraXDGReducedMenu
  [ActionTypes.SetError]: string
  [ActionTypes.SetStarted]: boolean
}

export type AppStateActions =
  ActionMap<AppStatePayload>[keyof ActionMap<AppStatePayload>]

let lastZindex = 1

export const initialState: AppState = {
  connect: false,
  host: 'ws://127.0.0.1:10000',
  showOptions: false,
  connected: false,
  cursor: null,
  windows: [],
  notifications: [],
  activeWindow: 0,
  draggingWindow: -1,
  actualDesktopSize: [0, 0],
  stats: { ...initialXpraConnectionStats },
  options: { ...defaultXpraConnectionOptions },
  menu: [],
  error: '',
  started: false,
}

export function stateReducer(state: AppState, action: AppStateActions) {
  const newWindowState = (
    wid: number,
    append: (data: AppWindowState) => Partial<AppWindowState>
  ) => {
    const windows = state.windows
    const found = windows.find((w) => w.id === wid)
    if (found) {
      Object.assign(found, append(found))
    }

    return {
      ...state,
      windows,
    }
  }

  switch (action.type) {
    case ActionTypes.SetHost:
      return {
        ...state,
        host: action.payload,
      }

    case ActionTypes.SetShowOptions:
      return {
        ...state,
        showOptions: action.payload,
      }

    case ActionTypes.AddWindow:
      const isTray = !!action.payload.metadata.tray
      return {
        ...state,
        activeWindow: action.payload.id,
        windows: [
          ...state.windows,
          {
            id: action.payload.id,
            minimized: action.payload.metadata.iconic === true,
            maximized: false,
            title: action.payload.metadata.title || String(action.payload.id),
            position: action.payload.position,
            dimension: action.payload.dimension,
            minDimension:
              action.payload.metadata['size-constraints']?.['minimum-size'],
            maxDimension:
              action.payload.metadata['size-constraints']?.['maximum-size'],
            opacity: createOpacity(action.payload.metadata),
            tray: isTray,
            zIndex: isTray
              ? 0
              : createXpraWindowBaseZindex(action.payload, ++lastZindex),
          },
        ],
      }

    case ActionTypes.RemoveWindow:
      const { windows } = state
      const foundIndex = windows.findIndex((w) => w.id === action.payload)
      if (foundIndex !== -1) {
        windows.splice(foundIndex, 1)
      }

      const nextActiveWindow =
        windows.length > 0 ? windows[windows.length - 1].id : 0

      return {
        ...state,
        activeWindow: nextActiveWindow,
        windows,
      }

    case ActionTypes.SetWindowIcon:
      const icon = action.payload
      return newWindowState(icon.wid, () => ({ icon }))

    case ActionTypes.SetConnected:
      return {
        ...state,
        started: false,
        windows: action.payload ? state.windows : [],
        connected: action.payload,
      }

    case ActionTypes.SetCursor:
      return {
        ...state,
        cursor: action.payload,
      }

    case ActionTypes.UpdateStats:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      }

    case ActionTypes.MoveResizeWindow:
      const { wid, position, dimension } = action.payload
      return newWindowState(wid, (win) => ({
        position: position || win.position,
        dimension: dimension || win.dimension,
      }))

    case ActionTypes.MaximizeWindow:
      const { maximize } = action.payload
      return newWindowState(action.payload.wid, (win) => ({
        oldPosition: maximize ? win.position : undefined,
        oldDimension: maximize ? win.dimension : undefined,
        position: maximize ? action.payload.position : win.oldPosition,
        dimension: maximize ? action.payload.dimension : win.oldDimension,
        maximized: maximize,
      }))

    case ActionTypes.UpdateMetadata:
      const { title, iconic } = action.payload.metadata

      return newWindowState(action.payload.wid, (win) => ({
        opacity: createOpacity(action.payload.metadata),
        minimized: iconic === undefined ? win.minimized : iconic === true,
        title: title === undefined ? win.title : title,
      }))

    case ActionTypes.RaiseWindow:
      return {
        ...newWindowState(action.payload.id, () => ({
          zIndex: createXpraWindowBaseZindex(action.payload, ++lastZindex),
        })),
        activeWindow: action.payload.id,
      }

    case ActionTypes.AddNotification:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }

    case ActionTypes.RemoveNotification:
      const { notifications } = state
      const foundNotificationIndex = notifications.findIndex(
        ([n]) => n.id === action.payload
      )

      if (foundNotificationIndex !== -1) {
        notifications.splice(foundNotificationIndex, 1)
      }

      return { ...state, notifications }

    case ActionTypes.SetDraggingWindow:
      return {
        ...state,
        draggingWindow: action.payload,
      }

    case ActionTypes.ClearWindows:
      return {
        ...state,
        cursor: null,
        windows: [],
        notifications: [],
        draggingWindow: -1,
      }

    case ActionTypes.SetOption:
      const [key, value] = action.payload

      return {
        ...state,
        options: {
          ...state.options,
          [key]: value,
        },
      }

    case ActionTypes.UpdateMenu:
      return {
        ...state,
        menu: action.payload,
      }

    case ActionTypes.SetError:
      return {
        ...state,
        error: action.payload,
      }

    case ActionTypes.SetStarted:
      return {
        ...state,
        started: action.payload,
      }

    default:
      return state
  }
}
