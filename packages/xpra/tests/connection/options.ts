import {
  createDefaultXpraConnectionOptions,
  createXpraConnectionOptionsFromUrl,
} from '../../src/connection/options'

describe('Connection options', () => {
  describe('createDefaultXpraConnectionOptions', () => {
    it('should create default options', () => {
      expect(createDefaultXpraConnectionOptions()).toEqual(
        expect.objectContaining({
          reconnect: true,
        })
      )
    })
  })

  describe('createXpraConnectionOptionsFromUrl', () => {
    it('should create default options from url', () => {
      expect(createXpraConnectionOptionsFromUrl('?reconnect=false')).toEqual(
        expect.objectContaining({
          reconnect: false,
        })
      )
    })
  })
})
