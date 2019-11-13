import React, { Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
import Alternative from './alternative'

const questionHeading = (type, src, text) => {
  switch (type) {
    case 'text':
      return <ReactMarkdown source={text} className="markdown pb-4" />
    case 'image':
      return (
        <Fragment>
          {text && <ReactMarkdown source={text} className=" markdown pb-4" />}
          <img src={src} alt={text} className="h-20 pb-4" />
        </Fragment>
      )
    default:
      throw Error('Unsupported type')
  }
}

const Question = React.memo(
  ({
    question: { type, alternatives, text, src },
    onAlternativeSelected,
    selectedAlternativeId,
    correctAlternativeId,
    disabled,
    className,
  }) => {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center text-gray-900">
          {questionHeading(type, src, text)}
        </div>
        <ul className="question__alternatives shadow-lg">
          {alternatives.map((alt, i) => (
            <li key={i}>
              <Alternative
                alternative={alt}
                onClick={() => onAlternativeSelected(alt.id)}
                selected={alt.id === selectedAlternativeId}
                correct={
                  correctAlternativeId === null
                    ? null
                    : alt.id === correctAlternativeId
                }
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  },
)

export default Question
