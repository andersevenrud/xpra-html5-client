/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, { FC, PropsWithChildren } from 'react'
import { CSSTransition } from 'react-transition-group'

const duration = 300

export const FadeInOutTransition: FC<
  PropsWithChildren<{
    toggled: boolean
    mountOnEnter?: boolean
    unmountOnExit?: boolean
  }>
> = ({ toggled, children, mountOnEnter = true, unmountOnExit = true }) => {
  return (
    <CSSTransition
      in={toggled}
      timeout={duration}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      classNames="fade-on-out"
    >
      {children}
    </CSSTransition>
  )
}
