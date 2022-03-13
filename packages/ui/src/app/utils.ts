/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React from 'react'
import { XpraCursor, XpraWindowMetadata } from 'xpra-ts'

export function createCursorBackgroundCSS(cursor: XpraCursor | null) {
  if (cursor) {
    const { image, xhot, yhot } = cursor
    return `transparent url('${image}') no-repeat ${xhot}px ${yhot}px`
  }

  return ''
}

export function createCursorCSS(cursor: XpraCursor | null, defaultValue = '') {
  if (cursor) {
    const { image, xhot, yhot } = cursor
    const suffix = defaultValue ? `, ${defaultValue}` : ''
    return `url('${image}') ${xhot} ${yhot}${suffix}`
  }

  return defaultValue
}

export function detectCorner(
  root: HTMLElement,
  position: [number, number],
  size: number
) {
  let direction = ''
  const { width, height, x, y } = root.getBoundingClientRect()
  const relativeX = position[0] - x
  const relativeY = position[1] - y

  if (relativeY <= size) {
    direction += 'n'
  } else if (relativeY >= height - size) {
    direction += 's'
  }

  if (relativeX <= size) {
    direction += 'w'
  } else if (relativeX >= width - size) {
    direction += 'e'
  }

  return direction
}

export function useDrag(
  callback: () => {
    onDown?: (ev: MouseEvent, startX: number, startY: number) => void
    onMove: (ev: MouseEvent, diffX: number, diffY: number) => void
    onRelease: (ev: MouseEvent, moved: boolean) => void
  }
) {
  const { onDown, onMove, onRelease } = callback()
  return (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault()

    const startX = ev.pageX
    const startY = ev.pageY
    let moved = false

    const onMouseMove = (ev: MouseEvent) => {
      const diffX = ev.pageX - startX
      const diffY = ev.pageY - startY
      moved = true
      onMove(ev, diffX, diffY)
    }

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      onRelease(ev, moved)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    if (onDown) {
      onDown(ev.nativeEvent, startX, startY)
    }
  }
}

export function createOpacity({
  opacity,
}: Partial<XpraWindowMetadata>): number | undefined {
  if (typeof opacity === 'number') {
    return opacity < 0 ? 1 : opacity / 0x100000000
  }

  return undefined
}
