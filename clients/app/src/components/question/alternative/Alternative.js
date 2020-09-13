import React, { memo } from 'react'
import './Alternative.scss'
import ReactMarkdown from 'react-markdown'
import remarkSubSuper from 'remark-sub-super'

const Alternative = memo(
  ({
    onClick,
    selected,
    correct,
    disabled,
    alternative: { text, src, lqip, type },
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
          data-testid="alternative-button"
          className={`bg-gray-lighter text-black w-full py-8 m:py-6 px-4 rounded bg-origin-content ${classNames}`}
          onClick={onClick}
          disabled={disabled}
        >
          {selected}
          {type === 'text' && (
            <ReactMarkdown
              source={text}
              plugins={[remarkSubSuper]}
              renderers={{
                sub: 'sub',
                sup: 'sup',
              }}
            />
          )}
          {type === 'image' && (
            <img
              alt=""
              src={lqip}
              data-srcset={`${process.env.REACT_APP_ASSETS_URL}${src}`}
              className="lazyload"
            />
          )}
        </button>
      </div>
    )
  },
)

export default Alternative
