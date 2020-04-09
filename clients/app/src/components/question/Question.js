import React, { Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
import Alternative from './alternative'

const questionHeading = (type, src, text) => {
  switch (type) {
    case 'text':
      return <ReactMarkdown source={text} className="markdown" />
    case 'image':
      return (
        <Fragment>
          {text && <ReactMarkdown source={text} className=" markdown" />}
          <img src={src} alt={text} className="h-32 p-4" />
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
    selectedAnswerId,
    correctAnswerId,
    disabled,
    className,
  }) => {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center bg-gray-lighter text-black my-4 p-4 rounded">
          {questionHeading(type, src, text)}
        </div>
        <ul className="question__alternatives shadow-lg">
          {alternatives.map((alt, i) => (
            <li key={i}>
              <Alternative
                alternative={alt}
                onClick={() => onAlternativeSelected(alt.id)}
                selected={alt.id === selectedAnswerId}
                correct={
                  correctAnswerId === null ? null : alt.id === correctAnswerId
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
