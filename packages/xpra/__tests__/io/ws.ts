import WS from 'jest-websocket-mock'
import { XpraWebsocket } from '../../src/io/ws'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'
import { XpraChallengeError, XpraDisconnectionError } from '../../src/errors'

const options = createDefaultXpraConnectionOptions()

jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn())

describe('WebSocket connection', () => {
  afterEach(() => {
    WS.clean()
  })

  it('should not connect', () => {
    const server = new WS('ws://localhost:9999')
    const ws = new XpraWebsocket()
    const openFn = jest.fn()
    const closeFn = jest.fn()
    const errorFn = jest.fn()
    const disconnectFn = jest.fn()
    const connectFn = jest.fn()
    const messageFn = jest.fn()

    ws.on('open', openFn)
    ws.on('close', closeFn)
    ws.on('error', errorFn)
    ws.on('disconnect', disconnectFn)
    ws.on('connect', connectFn)
    ws.on('message', messageFn)

    ws.connect('ws://localhost:9999', options)
    server.close()

    expect(openFn).toBeCalledTimes(0)
    expect(closeFn).toBeCalledTimes(1)
    expect(errorFn).toBeCalledTimes(0)
    expect(disconnectFn).toBeCalledTimes(0)
    expect(connectFn).toBeCalledTimes(1)
    expect(messageFn).toBeCalledTimes(0)
  })

  it('should try to reconnect X times', async () => {
    const server = new WS('ws://localhost:9999')
    const ws = new XpraWebsocket()
    const disconnect = (error?: Error) => {
      const skipReconnect =
        error instanceof XpraChallengeError ||
        error instanceof XpraDisconnectionError

      const reconnect = options.reconnect && !skipReconnect && !!error

      ws.disconnect(reconnect)
    }

    ws.on('error', (err: Error) => disconnect(err))
    ws.on('close', (err?: Error) => disconnect(err))

    const openFn = jest.fn()
    const closeFn = jest.fn()
    const errorFn = jest.fn()
    const disconnectFn = jest.fn()
    const connectFn = jest.fn()
    const messageFn = jest.fn()

    ws.on('open', openFn)
    ws.on('close', closeFn)
    ws.on('error', errorFn)
    ws.on('disconnect', disconnectFn)
    ws.on('connect', connectFn)
    ws.on('message', messageFn)

    ws.connect('ws://localhost:9999', {
      ...options,
      reconnectAttempts: 3,
      reconnectInterval: 0,
    })

    await server.connected

    server.close()

    await new Promise((r) => setTimeout(r, 200))

    expect(openFn).toBeCalledTimes(1)
    expect(closeFn).toBeCalledTimes(4)
    expect(errorFn).toBeCalledTimes(3)
    expect(disconnectFn).toBeCalledTimes(5)
    expect(connectFn).toBeCalledTimes(4)
    expect(messageFn).toBeCalledTimes(0)
  })

  it('should connect', async () => {
    const server = new WS('ws://localhost:9999')
    const ws = new XpraWebsocket()
    const openFn = jest.fn()
    const closeFn = jest.fn()
    const errorFn = jest.fn()
    const disconnectFn = jest.fn()
    const connectFn = jest.fn()
    const messageFn = jest.fn()

    ws.on('open', openFn)
    ws.on('close', closeFn)
    ws.on('error', errorFn)
    ws.on('disconnect', disconnectFn)
    ws.on('connect', connectFn)
    ws.on('message', messageFn)

    ws.connect('ws://localhost:9999', options)

    await server.connected
    server.close()

    await new Promise((r) => setTimeout(r, 200))

    expect(openFn).toBeCalledTimes(1)
    expect(closeFn).toBeCalledTimes(1)
    expect(errorFn).toBeCalledTimes(0)
    expect(disconnectFn).toBeCalledTimes(0)
    expect(connectFn).toBeCalledTimes(1)
    expect(messageFn).toBeCalledTimes(0)
  })

  it('should recieve message', async () => {
    const server = new WS('ws://localhost:9999')
    const ws = new XpraWebsocket()
    const openFn = jest.fn()
    const closeFn = jest.fn()
    const errorFn = jest.fn()
    const disconnectFn = jest.fn()
    const connectFn = jest.fn()
    const messageFn = jest.fn()

    ws.on('open', openFn)
    ws.on('close', closeFn)
    ws.on('error', errorFn)
    ws.on('disconnect', disconnectFn)
    ws.on('connect', connectFn)
    ws.on('message', messageFn)

    ws.connect('ws://localhost:9999', options)

    await server.connected
    server.send('Hello world')
    server.close()

    await new Promise((r) => setTimeout(r, 200))

    expect(openFn).toBeCalledTimes(1)
    expect(closeFn).toBeCalledTimes(1)
    expect(errorFn).toBeCalledTimes(0)
    expect(disconnectFn).toBeCalledTimes(0)
    expect(connectFn).toBeCalledTimes(1)
    expect(messageFn).toBeCalledTimes(1)
  })
})
