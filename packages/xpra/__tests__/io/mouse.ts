import { XpraMouse } from '../../src/io/mouse'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'

const options = createDefaultXpraConnectionOptions()

describe('Mouse', () => {
  const mouse = new XpraMouse()

  it('should configure', () => {
    expect(mouse.configure(options)).toEqual(undefined)
  })

  it('should detect position', () => {
    expect(
      mouse.getPosition(
        new MouseEvent('mousemove', {
          clientX: 555,
          clientY: 666,
        })
      )
    ).toEqual([555, 666])
  })

  it('should detect buttons', () => {
    expect(
      mouse.getButton(
        new MouseEvent('mousedown', {
          which: 1,
        })
      )
    ).toEqual(1)

    expect(
      mouse.getButton({
        button: 2,
      } as any)
    ).toEqual(3)
  })

  it('should detect scroll', () => {
    expect(
      mouse.getScroll(
        new WheelEvent('scroll', {
          deltaX: 1,
        })
      )
    ).toEqual([1, 0])
    expect(
      mouse.getScroll(
        new WheelEvent('scroll', {
          deltaX: -1,
        })
      )
    ).toEqual([-1, 0])

    expect(
      mouse.getScroll(
        new WheelEvent('scroll', {
          deltaY: -1,
        })
      )
    ).toEqual([0, -1])
    expect(
      mouse.getScroll(
        new WheelEvent('scroll', {
          deltaY: 1,
        })
      )
    ).toEqual([0, 1])

    expect(
      mouse.getScroll({
        wheelDelta: -120,
      } as any)
    ).toEqual([0, -1])

    expect(
      mouse.getScroll({
        wheelDelta: 120,
      } as any)
    ).toEqual([0, 1])

    expect(
      mouse.getScroll({
        wheelDeltaX: -120,
        wheelDeltaY: 0,
      } as any)
    ).toEqual([-1, 0])

    expect(
      mouse.getScroll({
        wheelDeltaX: 120,
        wheelDeltaY: 0,
      } as any)
    ).toEqual([1, 0])
  })

  it('should detect scroll (xpra translated)', () => {
    expect(
      mouse.getScrollWheel(
        new WheelEvent('scroll', {
          deltaX: -1,
        })
      )
    ).toEqual([7, 100])
    expect(
      mouse.getScrollWheel(
        new WheelEvent('scroll', {
          deltaX: 1,
        })
      )
    ).toEqual([6, 100])

    expect(
      mouse.getScrollWheel(
        new WheelEvent('scroll', {
          deltaY: -1,
        })
      )
    ).toEqual([4, 100])
    expect(
      mouse.getScrollWheel(
        new WheelEvent('scroll', {
          deltaY: 1,
        })
      )
    ).toEqual([5, 100])
  })
})
