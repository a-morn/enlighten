import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import { Question, Level, TextAlternative } from "enlighten-common-types";
import { isUndefined } from "util";

const TONES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const INTERVAL = [
  {
    name: "Minor third",
    value: 3,
  },
  {
    name: "Major third",
    value: 4,
  },
  {
    name: "Perfect fifth",
    value: 7,
  },
  {
    name: "Perfect octave",
    value: 12,
  },
] as const;

const OCTAVES = [3, 4] as const;

const intervalEndTone = (
  startTone: typeof TONES[number],
  octave: typeof OCTAVES[number],
  interval: typeof INTERVAL[number]
): string => {
  const endToneLetter =
    TONES[(TONES.indexOf(startTone) + interval.value) % TONES.length];
  const endToneOctave =
    octave +
    Math.floor((TONES.indexOf(startTone) + interval.value) / TONES.length);
  return `${endToneLetter}${endToneOctave}`;
};

const alternatives: TextAlternative[] = INTERVAL.map((interval) => ({
  type: "text",
  text: interval.name,
  _id: uuid(),
}));

export const getQuestions: (categoryId: string, levels?: Level[] | null) => Question[] = (categoryId: string, levels?: Level[] | null) => TONES.reduce(
  (acc: Question[], tone) =>
    acc.concat(
      INTERVAL.reduce(
        (acc: Question[], interval) =>
          acc.concat(
            OCTAVES.map<Question>((octave) => {
              const answerId = alternatives.find(
                (alt) => alt.text === interval.name
              )?._id;

              if (isUndefined(answerId)) {
                throw new Error(`No alternative with with text ${interval.name}`)
              }

              const question: Question = {
                _id: uuid(),
                type: "tones",
                tones: [
                  `${tone}${octave}`,
                  `${intervalEndTone(tone, octave, interval)}`,
                ],
                text: "What interval is this?",
                categoryId,
                answerId,
                alternatives: shuffle(alternatives),
                questionGroupName: 'intervals',
                types: [interval.name]
              };

              return question
            }) as Question[]
          ),
        [] as Question[]
      )
    ),
  [] as Question[]
);
