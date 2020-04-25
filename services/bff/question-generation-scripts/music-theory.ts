import uuidv1 from 'uuid/v4'
import shuffle from 'shuffle-array'
import { Question } from '../src/types/question-types'

const TONES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

const INTERVAL = [
  {
    name: 'Minor third',
    value: 3,
  },
  {
    name: 'Major third',
    value: 4,
  },
  {
    name: 'Perfect fifth',
    value: 7,
  },
  {
    name: 'Perfect octave',
    value: 12,
  },
] as const

const OCTAVES = [3, 4] as const

const intervalEndTone = (
  startTone: typeof TONES[number],
  octave: typeof OCTAVES[number],
  interval: typeof INTERVAL[number],
): string => {
  const endToneLetter =
    TONES[(TONES.indexOf(startTone) + interval.value) % TONES.length]
  const endToneOctave =
    octave +
    Math.floor((TONES.indexOf(startTone) + interval.value) / TONES.length)
  return `${endToneLetter}${endToneOctave}`
}

const alternatives = INTERVAL.map(interval => ({
  type: 'text',
  text: interval.name,
  id: uuidv1(),
}))

const questions = {
  1: {
    questions: TONES.reduce(
      (acc: Question[], tone) =>
        acc.concat(
          INTERVAL.reduce(
            (acc: Question[], interval) =>
              acc.concat(
                OCTAVES.map(octave => {
                  const answerId = alternatives.find(
                    alt => alt.text === interval.name,
                  )?.id

                  return {
                    id: uuidv1(),
                    type: 'tones',
                    tones: [
                      `${tone}${octave}`,
                      `${intervalEndTone(tone, octave, interval)}`,
                    ],
                    text: 'What interval is this?',
                    category: 'music-theory',
                    answerId,
                    alternatives: shuffle(alternatives),
                  } as Question
                }) as Question[],
              ),
            [] as Question[],
          ),
        ),
      [] as Question[],
    ),
    fromTypes: 'tones',
    toTypes: 'interval',
    maxAlternatives: 3,
  },
}

export default questions
