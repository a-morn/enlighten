// https://codepen.io/m2de/pen/JONpmj

import React, { memo } from 'react'

const GameRequestModal = memo(
  ({
    title,
    body,
    acceptText,
    declineText,
    onAccept,
    onDecline,
    'data-testid': testid,
  }) => {
    return (
      <div
        data-testid={testid}
        className="border border-solid border-gray-500 bg-gray-dark fixed z-50 top-0 right-0 bottom-0 left-0 w-full h-full overflow-auto bg-smoke-dark flex justify-center items-center"
      >
        <div className="shadow-inner max-w-md md:relative align-top justify-end md:justify-center p-8 bg-white md:rounded w-full md:h-auto md:shadow flex flex-col">
          <h2 className="text-2xl md:text-4xl text-center font-hairline md:leading-loose text-grey md:mt-8 mb-4">
            {title}
          </h2>
          <p className="text-md md:text-xl leading-normal mb-8 text-center">
            {body}
          </p>
          <div className="inline-flex justify-center">
            {acceptText && (
              <button
                onClick={onAccept}
                className="hover:bg-cta hover:text-white flex-1 border-b-2 md:flex-none border-green ml-2 text-grey-darkest font-bold py-4 px-6 rounded"
              >
                {acceptText}
              </button>
            )}
            {declineText && (
              <button
                onClick={onDecline}
                className="flex-1 md:flex-none border-b-2 border-red ml-2 hover:bg-danger hover:text-white text-grey-darkest font-bold py-4 px-6 rounded"
              >
                {declineText}
              </button>
            )}
          </div>
          <span
            onClick={onDecline}
            className="absolute top-0 right-0 pt-4 px-4"
          >
            <svg
              className="h-12 w-12 text-grey hover:text-grey-darkest"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      </div>
    )
  },
)

export default GameRequestModal
