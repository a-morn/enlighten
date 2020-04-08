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
      'alternative',
      selected && 'selected',
      correct && 'correct',
      correct === false && 'incorrect',
      disabled && 'opacity-50 cursor-not-allowed',
      `alternative--${type}`,
    ]
      .filter(cn => cn)
      .join(' ')
    return (
      <div className="alternative">
        <button
          className={`text-black w-full py-8 m:py-6 px-4 rounded bg-origin-content ${classNames}`}
          onClick={onClick}
          disabled={disabled}
          style={{ backgroundImage: `url(${src})` }}
        >
          {type === 'text' && text}
          {type === 'image' && <div>&nbsp;</div>}
        </button>
      </div>
    )
  },
)

export default Alternative
