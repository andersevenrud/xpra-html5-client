import { parseUrlQuerySearch } from '../../src/utils/url'

describe('Url utilities', () => {
  describe('parseUrlQuerySearch', () => {
    const search =
      '?number=1&booleanString=on&booleanNumber=1&booleanBoolean=true&list=a,b,c'

    const options = {
      numbers: ['number'],
      booleans: ['booleanString', 'booleanNumber', 'booleanBoolean'],
      lists: ['list'],
    }

    it('should return all values', () => {
      expect(parseUrlQuerySearch(search, options)).toEqual({
        number: 1,
        booleanString: true,
        booleanNumber: true,
        booleanBoolean: true,
        list: ['a', 'b', 'c'],
      })
    })

    it('should return required values', () => {
      expect(
        parseUrlQuerySearch(search, { ...options, required: ['number'] })
      ).toEqual({
        number: 1,
      })
    })
  })
})
