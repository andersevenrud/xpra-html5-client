import { createXDGMenu } from '../../src/utils/xdg'

describe('XDG utilities', () => {
  describe('createXDGMenu', () => {
    it('should convert menu data', () => {
      const input = {
        A: {
          Name: 'A',
          IconType: 'image/png',
          IconData: 'Hello world',
          Entries: {
            AA: {
              Name: 'AA',
              Exec: 'bash',
              Type: '',
              Comment: '',
              Categories: ['a', 'b', 'c'],
            },
          },
        },
      }

      const output = [
        {
          name: 'A',
          icon: 'data:image/image/png;base64,SGVsbG8gd29ybGQ=',
          entries: [
            {
              name: 'AA',
              icon: undefined,
              exec: 'bash',
              attributes: {
                Name: 'AA',
                Exec: 'bash',
                Type: '',
                Comment: '',
                Categories: ['a', 'b', 'c'],
              },
            },
          ],
        },
      ]

      expect(createXDGMenu(input)).toEqual(output)
    })
  })
})
