import WS from 'jest-websocket-mock'
import { XpraClient } from '../../src/connection/client'
import { XpraNullWorker } from '../../src/io/worker'
import { XpraEncodeBit } from '../../src/types'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'
import { ord, bencode } from '../../src/lib/bencode'

const options = createDefaultXpraConnectionOptions()

class JestWorker extends XpraNullWorker {}

function createPacket(packet: any) {
  const data = bencode(packet) as any
  const size = data.length
  const flags = XpraEncodeBit.BENCODE
  const actualSize = data.length
  const sendData = new Uint8Array(actualSize + 8)
  const level = 0

  sendData[0] = 'P'.charCodeAt(0)
  sendData[1] = flags
  sendData[2] = level
  sendData[3] = 0

  for (let i = 0; i < 4; i++) {
    sendData[7 - i] = (size >> (8 * i)) & 0xff
  }

  if (data instanceof Uint8Array) {
    sendData.set(data, 8)
  } else {
    for (let i = 0; i < actualSize; i++) {
      sendData[8 + i] = ord(data[i])
    }
  }

  return sendData.buffer
}

jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'debug').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())

jest.mock('xpra-av')

describe('Client', () => {
  describe('Connection', () => {
    const server = new WS('ws://localhost:9999')
    const worker = new JestWorker()
    const client = new XpraClient({ worker })

    afterAll(() => {
      server.close()
      WS.clean()
    })

    it('should initialize', async () => {
      await client.init()
    })

    it('should try to establish connection', async () => {
      const connectFn = jest.fn()
      const postFn = jest.fn()

      worker.on('post', postFn)
      client.on('connect', connectFn)
      client.connect('ws://localhost:9999', options)

      await server.connected

      await new Promise((r) => setTimeout(r, 10))

      expect(client.isReadOnly()).toEqual(false)
      expect(client.isReady()).toEqual(false)

      expect(connectFn).toBeCalledTimes(1)
      expect(postFn).toBeCalledTimes(4)

      expect(postFn).toHaveBeenNthCalledWith(
        1,
        expect.arrayContaining(['configure'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        2,
        expect.arrayContaining(['cipher'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        3,
        expect.arrayContaining(['connected'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        4,
        expect.arrayContaining(['send', expect.arrayContaining(['hello'])])
      )
    })

    it('should respond to handshake actions', async () => {
      const helloFn = jest.fn()
      const pongFn = jest.fn()
      const postFn = jest.fn()

      worker.on('post', postFn)
      client.on('hello', helloFn)
      client.on('pong', pongFn)

      server.send(createPacket(['hello', {}]))
      server.send(createPacket(['ping', {}]))
      server.send(createPacket(['ping_echo', {}]))

      await new Promise((r) => setTimeout(r, 100))

      expect(postFn).toHaveBeenCalledWith(
        expect.arrayContaining(['send', expect.arrayContaining(['ping_echo'])])
      )

      expect(helloFn).toBeCalledTimes(1)
      expect(pongFn).toBeCalledTimes(1)
    })
  })
})
