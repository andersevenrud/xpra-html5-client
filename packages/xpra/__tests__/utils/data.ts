import {
  arrayBufferToBase64,
  uint8toString,
  uint8fromString,
  uint8fromStringOrString,
  uint8fromStringOrUint8,
  createHexUUID,
  createRandomSecureString,
  xorString,
} from '../../src/utils/data'

describe('Data utilities', () => {
  const hello = new Uint8Array([
    72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
  ])

  describe('arrayBufferToBase64', () => {
    it('should create base64', () => {
      expect(arrayBufferToBase64(hello)).toEqual('SGVsbG8gd29ybGQ=')
    })
  })

  describe('uint8toString', () => {
    it('should create string from uint8', () => {
      expect(uint8toString(hello)).toEqual('Hello world')
    })
  })

  describe('uint8fromString', () => {
    it('should create utin8 from string', () => {
      expect(uint8fromString('Hello world')).toEqual(hello)
    })
  })

  describe('uint8fromStringOrString', () => {
    it('should return string from uint8', () => {
      expect(uint8fromStringOrString(hello)).toEqual('Hello world')
    })
    it('should return string from string', () => {
      expect(uint8fromStringOrString('Hello world')).toEqual('Hello world')
    })
  })

  describe('uint8fromStringOrUint8', () => {
    it('should return uint8 from string', () => {
      expect(uint8fromStringOrUint8('Hello world')).toEqual(hello)
    })

    it('should return uint8 from uint8', () => {
      expect(uint8fromStringOrUint8(hello)).toEqual(hello)
    })
  })

  describe('createHexUUID', () => {
    it('should create a uuid', () => {
      expect(createHexUUID().length).toEqual(36)
    })
  })

  describe('createRandomSecureString', () => {
    it('should create random string', () => {
      expect(createRandomSecureString(32).length).toEqual(32)
    })
  })

  describe('xorString', () => {
    it('should xor string', () => {
      expect(xorString('hello', 'mommy')).toEqual('\x05\n\x01\x01\x16')
    })

    it('should throw error', () => {
      expect(() => xorString('a', 'bc')).toThrowError(
        'strings must be equal length'
      )
    })
  })
})
