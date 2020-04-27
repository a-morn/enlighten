import React, { Fragment, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { DuoSynth } from 'tone'
import Alternative from './alternative'

const questionHeading = (type, src, text, tones, synth) => {
  switch (type) {
    case 'text':
      return <ReactMarkdown source={text} className="markdown" />
    case 'image':
      return (
        <Fragment>
          {text && <ReactMarkdown source={text} className=" markdown" />}
          <img
            data-testid="question-image"
            src={src}
            alt={text}
            className="h-32 p-4"
          />
        </Fragment>
      )
    case 'tones':
      //schedule a series of notes, one per second
      const play = () => {
        setTimeout(() => synth.current.triggerAttackRelease(tones[0], '8n'), 0)
        setTimeout(
          () => synth.current.triggerAttackRelease(tones[1], '8n'),
          500,
        )
      }
      return (
        <div
          className="flex flex-col items-center"
          style={{ minWidth: '300px' }}
        >
          <ReactMarkdown source={text} className="markdown p-4" />
          <button
            className="p-4 bg-brand hover:bg-brand-light shadow-lg rounded text-white"
            onClick={play}
          >
            Play
          </button>
        </div>
      )
    default:
      throw Error('Unsupported type')
  }
}

const Question = React.memo(
  ({
    question: { type, alternatives, text, src, tones, answered },
    onAlternativeSelected,
    selectedAnswerId,
    correctAnswerId,
    disabled,
    className,
  }) => {
    const synth = useRef(null)

    useEffect(() => {
      synth.current = new DuoSynth().toMaster()
    }, [])

    return (
      <div
        className={`${className} transition-opacity ease-in-out ${
          answered
            ? 'opacity-0 delay-300 duration-1000'
            : 'opacity-100 duration-500'
        }`}
      >
        <div className="flex flex-col items-center bg-gray-lighter text-black my-4 p-4 rounded">
          {questionHeading(type, src, text, tones, synth)}
        </div>
        <ul className="question__alternatives shadow-lg">
          {alternatives.map((alt, i) => (
            <li key={i} data-testid={`alternative-${i}-wrapper`}>
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
