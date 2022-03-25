import {
  decodeXpraPacketData,
  encodeXpraPacket,
} from '../../src/connection/encoding'
import { XpraEncodeBit, XpraSendPacket } from '../../src/types'

describe('Encodings', () => {
  const s = 'l5:hello5:worlddelee'

  const p = ['hello', 'world', {}, []] as XpraSendPacket

  const u = new Uint8Array([
    196, 133, 104, 101, 108, 108, 111, 133, 119, 111, 114, 108, 100, 102, 192,
  ])

  describe('Decode packet', () => {
    it('rdecodelegacy', () => {
      expect(decodeXpraPacketData(u, XpraEncodeBit.RENCODELEGACY)).toEqual(p)
    })

    it('rdecodeplus', () => {
      expect(decodeXpraPacketData(u, XpraEncodeBit.RENCODEPLUS)).toEqual(p)
    })

    it('bdecode', () => {
      expect(decodeXpraPacketData(s as any, XpraEncodeBit.BENCODE)).toEqual(p)
    })
  })

  describe('Encode packet', () => {
    it('bencode', () => {
      expect(encodeXpraPacket(p, 'bencode')).toEqual([s, XpraEncodeBit.BENCODE])
    })

    it('rencode', () => {
      expect(encodeXpraPacket(p, 'rencode')).toEqual([
        u,
        XpraEncodeBit.RENCODELEGACY,
      ])
    })

    it('rencodeplus', () => {
      expect(encodeXpraPacket(p, 'rencodeplus')).toEqual([
        u,
        XpraEncodeBit.RENCODEPLUS,
      ])
    })

    it('should throw exception', () => {
      expect(() =>
        encodeXpraPacket(['shutdown-server'], 'invalid' as any)
      ).toThrowError()
    })
  })
})
