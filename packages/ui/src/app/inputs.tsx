/**
 * Xpra Typescript Client React UI
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import React, { FC, PropsWithChildren } from 'react'
import { cs } from './utils'

let lastElementId = 1

const themeStyles = 'bg-white/80 dark:bg-black/80 dark:text-white'

const baseStyles =
  'rounded border-none p-1 px-2 disabled:opacity-40 disabled:cursor-not-allowed hover:outline hover:outline-1 w-full'

export const AppSelect: FC<
  PropsWithChildren<{
    disabled?: boolean
    label?: string
    required?: boolean
    value: string
    options: Record<string, string>
    onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => void
  }>
> = ({ disabled, label, value, required, options, onChange }) => {
  const htmlFor = `xpra_${++lastElementId}`
  const inputClassNames = cs(baseStyles, themeStyles)

  return (
    <div>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      <div>
        <select
          className={inputClassNames}
          id={htmlFor}
          required={required}
          disabled={disabled}
          defaultValue={value}
          onChange={onChange}
        >
          {Object.entries(options).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/**
 * Button Component
 */
export const AppButton: FC<
  PropsWithChildren<{
    disabled?: boolean
    label?: string
    type?: 'button' | 'submit' | 'reset'
    transparent?: boolean
    onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void
  }>
> = ({ children, disabled, label, type, transparent, onClick }) => {
  const inputClassNames = []

  if (!transparent) {
    inputClassNames.push(themeStyles)
  }

  return (
    <button
      className={cs(baseStyles, ...inputClassNames)}
      disabled={disabled}
      type={type || 'button'}
      onClick={onClick}
    >
      {label || children}
    </button>
  )
}

/**
 * Text Input Component
 */
export const AppTextField: FC<{
  type?: string
  disabled?: boolean
  label?: string
  placeholder?: string
  required?: boolean
  value: string
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ disabled, label, value, type, placeholder, required, onChange }) => {
  const htmlFor = `xpra_${++lastElementId}`
  const inputClassNames = cs(baseStyles, themeStyles)

  return (
    <div>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      <div>
        <input
          type={type || 'text'}
          className={inputClassNames}
          id={htmlFor}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          defaultValue={value}
          onInput={onChange}
        />
      </div>
    </div>
  )
}

/**
 * Checkbox Input Component
 */
export const AppCheckbox: FC<{
  label: string
  value: boolean
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ label, value, onChange }) => {
  return (
    <div className="select-none">
      <label className="inline-flex cursor-pointer items-center space-x-2">
        <input type="checkbox" defaultChecked={value} onChange={onChange} />
        <span>{label}</span>
      </label>
    </div>
  )
}
