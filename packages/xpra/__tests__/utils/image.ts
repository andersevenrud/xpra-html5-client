import { loadImage, imageSourceFromData } from '../../src/utils/image'

const imageSource =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUuNEBYX+RXAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg=='
const invalidImageSource = 'data:image/png;base64,xx'

describe('Image utilities', () => {
  describe('loadImage', () => {
    it('should load image', async () => {
      expect(loadImage(imageSource)).resolves.toBeInstanceOf(Image)
    })

    it('should not load image', async () => {
      expect(loadImage(invalidImageSource)).resolves.toEqual(null)
    })
  })

  describe('imageSourceFromData', () => {
    it('should return image source', () => {
      expect(imageSourceFromData('png', 'hello')).toEqual(
        'data:image/png;base64,aGVsbG8='
      )

      expect(imageSourceFromData('svg', 'hello')).toEqual(
        'data:image/svg+xml;base64,aGVsbG8='
      )
    })
  })
})
