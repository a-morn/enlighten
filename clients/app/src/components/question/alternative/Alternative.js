import React, { memo } from 'react'
import './Alternative.scss'

const Alternative = memo(
  ({
    onClick,
    selected,
    correct,
    disabled,
    alternative: { text, src, type },
  }) => {
    const classNames = [
      selected && 'selected',
      correct && 'correct',
      correct === false && 'incorrect',
      disabled && 'opacity-50 cursor-not-allowed',
      `alternative--${type}`,
    ]
      .filter(cn => cn)
      .join(' ')
    return (
      <button
        className={`w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded bg-origin-content ${classNames}`}
        onClick={onClick}
        disabled={disabled}
        style={{ backgroundImage: `url(${src})` }}
      >
        {type === 'text' && text}
      </button>
    )
  },
)

export default Alternative
