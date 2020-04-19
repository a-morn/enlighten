/*import { elements, AtomData } from './atoms';
import uuidv1 from 'uuid/v1';
import { notUndefined } from '../../utils';

const ATOM_QUESTION_TYPE = {
  SYMBOL: { id: 'symbol', label: 'symbol' },
  NAME: { id: 'name', label: 'name' },
  NUMBER: { id: 'number', label: 'number' }
};

const config = {
  1: {
    atomStartNumber: 1,
    atomEndNumber: 10,
    fromTypes: [[ATOM_QUESTION_TYPE.NAME, ATOM_QUESTION_TYPE.NUMBER]],
    toTypes: [ATOM_QUESTION_TYPE.SYMBOL],
    maxAlternatives: 3
  },
  2: {
    atomStartNumber: 1,
    atomEndNumber: 10,
    fromTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    toTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    maxAlternatives: 3
  },
  3: {
    atomStartNumber: 11,
    atomEndNumber: 20,
    fromTypes: [[ATOM_QUESTION_TYPE.NAME, ATOM_QUESTION_TYPE.NUMBER]],
    toTypes: [ATOM_QUESTION_TYPE.SYMBOL],
    numberOfAtoms: 20,
    maxAlternatives: 3
  },
  4: {
    atomStartNumber: 11,
    atomEndNumber: 20,
    fromTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    toTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    numberOfAtoms: 20,
    maxAlternatives: 3
  },
  5: {
    fromTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    toTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    atomStartNumber: 21,
    atomEndNumber: 50,
    maxAlternatives: 6
  },
  6: {
    fromTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    toTypes: [
      ATOM_QUESTION_TYPE.NAME,
      ATOM_QUESTION_TYPE.SYMBOL,
      ATOM_QUESTION_TYPE.NUMBER
    ],
    atomStartNumber: 50,
    atomEndNumber: 119,
    maxAlternatives: 10
  }
};

const getQuestionEnding = (fromType: QuestionEntityType<AtomData> | QuestionEntityType<AtomData>[], el: AtomData) => {
  if (typeof fromType === 'string') {
    return `the ${fromType} ${el[fromType]}`;
  } else if (Array.isArray(fromType)) {
    return `${fromType
      .map(
        (ft, i) =>
          `${i + 1 === fromType.length ? 'and ' : ''}the ${ft} ${el[ft.id]}`
      )
      .join(', ')}`;
  }
};

const questions: QuestionObject = Object.entries(config).reduce(
  (
    acc,
    [
      level,
      { fromTypes, toTypes, atomStartNumber, atomEndNumber, maxAlternatives }
    ]
  ) => ({
    ...acc,
    [level]: {
      lastQuestionId: null,
      questions: (fromTypes as (QuestionEntityType<AtomData> | QuestionEntityType<AtomData>[])[])
        .reduce(
          (acc: QuestionDirection<AtomData>[], fromType: QuestionEntityType<AtomData> | QuestionEntityType<AtomData>[]) =>
            acc.concat(
              (toTypes as QuestionEntityType<AtomData>[])
                .filter(toType => toType !== fromType)
                .map(toType => ({ fromType, toType }))
            ),
          []
        )
        .reduce(
          (acc: Question[], { fromType, toType }) =>
            acc.concat(
              Array.from(Array(atomEndNumber - atomStartNumber))
                .map((_, i) => i + atomStartNumber)
                .map(no => elements.find(({ number }) => number === no))
                .filter(notUndefined)
                .map(el => ({
                  id: uuidv1(),
                  type: 'text',
                  text: `What is the ${toType.id} of the element with ${getQuestionEnding(
                    fromType,
                    el
                  )}?`,
                  alternatives: [el]
                    .concat(
                      elements.filter(
                        ({ name }) => el.name !== name && el.name[0] === name[0]
                      )
                    )
                    .slice(0, maxAlternatives)
                    .map((el, id) => ({ type: 'text', text: el[toType.id], id } as Alternative)),
                  category: 'periodic-table'
                } as Question))
            ),
          []
        )
    }
  }),
  {}
);

export default { ...questions, userLevel: 1 };
*/
