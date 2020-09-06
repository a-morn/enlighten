import React, { Fragment, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { DuoSynth } from 'tone'
import Alternative from './alternative'
import './Question.scss'

const categoryAndLevel = ({
  categoryName,
  levelName,
  progression,
  levels,
  changeLevel,
}) => {
  const button = (text, disabled, levelId) => (
    <button
      disabled={disabled}
      className={`text-white font-bold py-2 px-4 rounded-full ${
        disabled ? 'cursor-not-allowed bg-info' : 'bg-info-dark hover:bg-info'
      }`}
      onClick={() => changeLevel(levelId)}
    >
      {text}
    </button>
  )
  return (
    <>
      <h1 className="font-bold">{categoryName}</h1>
      {levelName && levels && (
        <>
          {levels.length > 1 && (
            <ul className="flex">
              {levels
                .filter(
                  ({ completed }, i) =>
                    completed ||
                    levels[i - 1] === undefined ||
                    levels[i - 1].completed,
                )
                .map(({ name, _id }) => {
                  if (name === levelName) {
                    return (
                      <li key={_id} className="font-bold p-2">
                        {button(name, true)}
                      </li>
                    )
                  } else {
                    return (
                      <li key={_id} className="p-2">
                        {button(name, false, _id)}
                      </li>
                    )
                  }
                })}
            </ul>
          )}
          <div className="progress bg-success-light m-4">
            <h2 className="category-and-level font-bold m-2 text-info-dark">
              {levelName}
            </h2>
            <div
              className="bar bg-success"
              style={{
                width: `${progression > 0.15 ? progression * 100 : 0}%`,
              }}
            ></div>
          </div>
        </>
      )}
    </>
  )
}

const questionHeading = ({ type, src, lqip, text, tones, synth }) => {
  switch (type) {
    case 'text':
      return (
        <div style={{ maxWidth: '100vw' }}>
          <ReactMarkdown
            source={text}
            className="mx-8 markdown overflow-x-scroll overflow-y-hidden"
          />
        </div>
      )
    case 'image':
      return (
        <Fragment>
          {text && <ReactMarkdown source={text} className="markdown" />}
          <img
            data-testid="question-image"
            src={lqip}
            data-srcset={`${process.env.REACT_APP_ASSETS_URL}${src}`}
            alt={text}
            className="h-32 p-4 lazyload"
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
    question: { type, alternatives, text, src, lqip, tones, answered },
    levelName,
    categoryName,
    onAlternativeSelected,
    selectedAnswerId,
    correctAnswerId,
    disabled,
    className = '',
    progression,
    levels,
    changeLevel,
  }) => {
    const synth = useRef(null)

    useEffect(() => {
      if (type === 'tones') {
        synth.current = new DuoSynth().toMaster()
      }
    }, [type])

    return (
      <div
        className={`question ${className} transition-opacity ease-in-out ${
          answered
            ? 'opacity-0 delay-300 duration-1000'
            : 'opacity-100 duration-500'
        }`}
      >
        <div className="flex flex-col items-center bg-gray-lighter text-gray-darkest my-4 p-4 rounded">
          {categoryAndLevel({
            levelName,
            categoryName,
            progression,
            levels,
            changeLevel,
          })}
          {questionHeading({
            type,
            src,
            lqip,
            text,
            tones,
            synth,
            levelName,
            categoryName,
          })}
        </div>
        <ul className="question__alternatives shadow-lg">
          {alternatives.map((alt, i) => (
            <li key={i} data-testid={`alternative-${i}-wrapper`}>
              <Alternative
                alternative={alt}
                onClick={() => onAlternativeSelected(alt._id)}
                selected={alt._id === selectedAnswerId}
                correct={
                  correctAnswerId === null ? null : alt._id === correctAnswerId
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
