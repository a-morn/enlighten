import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import {
  Question,
  Alternative,
  TextAlternative,
} from "enlighten-common-types";
import { Level } from "enlighten-common-types";
import { isUndefined } from "util";

const BASES = [
  2,
  5,
  8,
  16
]

const NUMBER_OF_NUMBER_BASE_QUESTIONS = 4

const getNumberBaseQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const result: Question[] = 
    Array.from(Array(NUMBER_OF_NUMBER_BASE_QUESTIONS)).map(( )=> Math.floor(Math.random() * 100))
      .map(int => {
        let incorrectA: number
        
        do {
        incorrectA = Math.floor(Math.random() * 100)
        } while (incorrectA === int)

        let incorrectB: number

        do {
          incorrectB = Math.floor(Math.random() * 100)
        } while (incorrectB === int || incorrectB === incorrectA)

        const shuffledBases = shuffle([...BASES])

        const alternatives: TextAlternative[] =
          shuffledBases
            .map((base, index) => {
              const baseAlternative: Omit<TextAlternative, 'text'> = {
                type: "text",
                _id: uuid(),
              }
              switch (index) {
                case 0:
                case 1:
                  return {
                    text: `${int.toString(base)}~${base}~`,
                    ...baseAlternative
                  }
                case 2:
                  return {
                    text: `${incorrectA.toString(base)}~${base}~`,
                    ...baseAlternative
                  }
                case 3:
                  return {
                    text: `${incorrectB.toString(base)}~${base}~`,
                    ...baseAlternative
                  }
                default:
                  throw new Error('Unsupported base')
              }
            })


          const answerIds = [
            alternatives[0]._id,
            alternatives[1]._id
          ]

          const result: Question = {
            _id: uuid(),
            answerIds,
            hasMultipleCorrectAnswers: true,
            alternatives: shuffle(alternatives) as Alternative[],
            questionGroupName: int.toString(),
            types: ['convert bases'],
            text: `Which of the following numbers are equal to __${int}~10~__?`,
            ...base,
          }

          return result
      })

  return result
}

const laws = [
  {
    name: 'The Law of Cosine',
    text: 'c^2^ = a^2^ + b^2^ − 2ab cos(C)',
    whenToUse: 'Two sides and an angle are known or all three sides are known'
  },
  {
    name: 'The Law of Sines',
    text: 'a/sin(A) = b/sin(B) = c/sin(C)',
    whenToUse: 'An angle and the opposite side and a second angle/side are known'
  },
  {
    name: 'Pythagoras theorem',
    text: 'a^2^ + b^2^ = c^2^',
    whenToUse: 'Two sides are known in a triangle known to be right. Or if three sides are known and you want to verify that the triangle is right'
  }
]

const identities = [
  { from: 'cos(a + b)', to: 'cos(a)cos(b) - sin(a)sin(b)' },
  { from: 'cos(a - b)', to: 'cos(a)cos(b) + sin(a)sin(b)' },
  { from: 'sin(a + b)', to: 'sin(a)cos(b) + cos(a)sin(b)' },
  { from: 'sin(a - b)', to: 'sin(a)cos(b) - cos(a)sin(b)' },
  { from: 'sin(a/2)', to: '((1 - cos(a))/2)^0.5^' },
  { from: 'cos(a/2)', to: '((1 + cos(a))/2)^0.5^' }
]

const getTrigQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const lawEquationQuestions =
      laws
      .map(law => {
        const alternatives: TextAlternative[] =
          laws
            .filter(({ name }) => name !== law.name)
            .map(({ text }) => {
              return {
                type: "text",
                text,
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: law.text,
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName: law.name,
            types: ['equation', 'name'],
            text: `Which of the following equations is known as __${law.name}__?`,
            ...base,
          }

          return result
      })

    const lawUsageQuestions =
      laws
      .map(law => {
        const alternatives: TextAlternative[] =
          laws
            .filter(({ name }) => name !== law.name)
            .map(({ name: text }) => {
              return {
                type: "text",
                text,
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: law.name,
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName: law.name,
            types: ['equation', 'name'],
            text: `Which of the following laws is used when: __${law.whenToUse}__?`,
            ...base,
          }

          return result
      })

  const identityQuestions =
    identities
      .map(identity => {
        const alternatives: TextAlternative[] =
          identities
            .filter(({ from }) => from !== identity.from)
            .slice(0, 4)
            .map(({ to: text }) => {
              return {
                type: "text",
                text,
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: identity.to,
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName: identity.from,
            types: ['identity'],
            text: `What is __${identity.from}__ equal to?`,
            ...base,
          }

          return result
      })

  return [
    ...lawEquationQuestions,
    ...lawUsageQuestions,
    ...identityQuestions,
  ]
}

const mappings = [
  { image: '/mathematics/mappings/i-mapping.png', traits: ['injective', 'non-surjective', 'non-bijective', `doesn't have inverse`], domain: '{ 1, 2, 3 }', codomain: '{ A, B, C, D }', range: '{ A, B, D }'},
  { image: '/mathematics/mappings/b-mapping.png', traits: ['injective', 'surjective', 'bijective', 'has inverse'], domain: '{ 1, 2, 3, 4 }', codomain: '{ A, B, C, D }', range: '{ A, B, C, D }' },
  { image: '/mathematics/mappings/s-mapping.png', traits: ['non-injective', 'surjective', 'non-bijective', `doesn't have inverse`], domain: '{ 1, 2, 3, 4 }', codomain: '{ B, C, D }', range: '{ B, C, D }' },
  { image: '/mathematics/mappings/non-mapping.png', traits: ['non-injective', 'non-surjective', 'non-bijective', `doesn't have inverse`], domain: '{ 1, 2, 3, 4 }', codomain: '{ A, B, C, D }', range: '{ B, C, D }' },
]

const getFunctionsQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "image",
    categoryId,
    levelId
  } as const

  const mappingTraitsQuestions = 
    mappings
      .map(mapping => {
        const alternatives: TextAlternative[] =
          mappings
            .filter(({ image }) => image !== mapping.image)
            .map(({ traits }) => {
              return {
                type: "text",
                text: traits.join(', '),
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: mapping.traits.join(', '),
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName: mapping.image,
            types: ['image', 'traits'],
            text: `What __traits__ does the function pictured have?`,
            src: mapping.image,
            lqip: '',
            ...base,
          }

          return result
      })

  const mappingDomainQuestions = 
    mappings
      .map(mapping => {
        const alternatives: TextAlternative[] =
          mappings
            .filter(({ image }) => image !== mapping.image)
            .map(({ domain, codomain, range }) => {
              return {
                type: "text",
                text: [domain, codomain, range].join(', '),
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: [mapping.domain, mapping.codomain, mapping.range].join(', '),
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName: mapping.image,
            types: ['image', 'domain'],
            text: `What __domain__, __codomain__, and __range__/__image__ does the function pictured have?`,
            src: mapping.image,
            lqip: '',
            ...base,
          }

          return result
      })

  return [
    ...mappingTraitsQuestions,
    ...mappingDomainQuestions
  ]
}

const kinematicsFormulas = [
  { left: 'v', right: ['v~0~ + at'] },
  { left: 'Δx', right: ['((v + v~0~)/2)t', 'v~0~t + (1/2)at^2^'] },
  { left: 'v^2^', right: ['(v~0~)^2^ + 2aΔx'] },
]

const getKinematicsQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const result = 
    kinematicsFormulas
      .map(formula => {
        const alternatives: TextAlternative[] =
          kinematicsFormulas
            .filter(({ left }) => left !== formula.left)
            .reduce((acc, { right }) => [
                ...acc, 
                ...right.map(rightEl => ({
                  type: "text",
                  text: rightEl,
                  _id: uuid(),
                } as const))
              ], [] as TextAlternative[])

          const answers = formula.right.map(rightEl => ({
            type: "text",
            text: rightEl,
            _id: uuid(),
          }))

          const result: Question = {
            _id: uuid(),
            answerIds: answers.map(({ _id }) => _id),
            hasMultipleCorrectAnswers: true,
            alternatives: shuffle([...alternatives, ...answers]) as Alternative[],
            questionGroupName: formula.left,
            types: ['formula'],
            text: `What is __${formula.left}__ equal to?`,
            ...base,
          }

          return result
      })

  return result
}

const NUMBER_OF_VECTOR_DOT_PRODUCT_QUESTIONS = 3
const NUMBER_OF_VECTOR_CROSS_PRODUCT_QUESTIONS = 3
const NUMBER_OF_MATRIX_DETERIMINANT_QUESTIONS = 3
const NUMBER_OF_MATRIX_INVERSION_QUESTIONS = 3

const getLinearAlgebraQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const getVector = (dimension: number) => Array.from(Array(dimension)).map(() => Math.floor(Math.random() * 20))
  const getVectors = (n: number, dimension: number) => Array.from(Array(n)).map(( )=> getVector(dimension))
  const calculateDotProduct = (x1: number, y1: number, x2: number, y2: number) => x1 * x2 + y1 * y2

  const dotProductVectors = 
    getVectors(NUMBER_OF_VECTOR_DOT_PRODUCT_QUESTIONS, 2)
      .map(([x, y]) => {
        const alternatives: TextAlternative[] =
          getVectors(3, 2)
            .map(([x2, y2]) => {
              return {
                type: "text",
                text: calculateDotProduct(x, y, x2, y2).toString(),
                _id: uuid(),
              }
            })

          const [x2, y2] = getVector(2)
          const answer = {
            type: "text",
            text: calculateDotProduct(x, y, x2, y2).toString(),
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName:  `${x}, ${y}`,
            types: ['dot product'],
            text: `What is the __dot product__  of _(${x}, ${y})_ and _(${x2}, ${y2})_?`,
            ...base,
          }

          return result
      })

    const calculateCrossProduct = (x:number, y:number, z:number, x2:number, y2:number, z2:number) => `(${y*z2 - z*y2}, ${z*x2 - x*z2}, ${x*y2 - y*x2})`

    const crossProductVectors = 
      getVectors(NUMBER_OF_VECTOR_CROSS_PRODUCT_QUESTIONS, 3)
        .map(([x, y, z]) => {
          const alternatives: TextAlternative[] =
            getVectors(3, 3)
              .map(([x2, y2, z2]) => {
                return {
                  type: "text",
                  text: calculateCrossProduct(x, y, z, x2, y2, z2),
                  _id: uuid(),
                }
              })
  
            const [x2, y2, z2] = getVector(3)
            const answer = {
              type: "text",
              text: calculateCrossProduct(x, y, z, x2, y2, z2),
              _id: uuid(),
            }
  
            const result: Question = {
              _id: uuid(),
              answerIds: [answer._id],
              hasMultipleCorrectAnswers: false,
              alternatives: shuffle([...alternatives, answer]) as Alternative[],
              questionGroupName:  `${x}, ${y}`,
              types: ['dot product'],
              text: `What is the __cross product__  of _(${x}, ${y}, ${z})_ and _(${x2}, ${y2}, ${z2})_?`,
              ...base,
            }
  
            return result
        })
  

  const calculuateDeterminant = (a: number, b: number, c: number ,d: number) => a * d - b * c

  const getMatrices = (n: number, dimension: number) => Array.from(Array(n)).map(()=> getVector(dimension**2))
  const formatMatrix = (dimension: number, numbers: number[]) => numbers
    .reduce((acc, cell, index) => {
      switch (index % dimension) {
        case dimension - 1:
          return acc + `${cell}\n\n`
        default:
          return acc + `${cell}\t`
      }
    }, '')
  const determinant = 
    getMatrices(NUMBER_OF_MATRIX_DETERIMINANT_QUESTIONS, 2)
      .map(([m, n, k, l]) => {
        const alternatives: TextAlternative[] =
          getMatrices(3, 2)
            .map(([a, b, c, d]) => {
              return {
                type: "text",
                text: calculuateDeterminant(a, b, c, d).toString(),
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: calculuateDeterminant(m, n, k, l).toString(),
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName:  [m, n, k, l].join(', '),
            types: ['determinant'],
            text: `What is the __determinant__ of the matrix:\n\n\n${formatMatrix(2, [m, n, k, l])}`,
            ...base,
          }

          return result
      })

    const calculateInverse = (a: number, b: number, c: number, d: number) => {
      if (calculuateDeterminant(a, b, c, d) === 0) {
        return 'Undefined'
      }
      return `Coefficient: 1/(${a*d - b*c})\n\nMatrix:\n\n${formatMatrix(2, [d, -b, -c, a])}`
    }

    const inverse =
      getMatrices(NUMBER_OF_MATRIX_INVERSION_QUESTIONS, 2)
      .map(([m, n, k, l]) => {
        const alternatives: TextAlternative[] =
          getMatrices(3, 2)
            .map(([a, b, c, d]) => {
              return {
                type: "text",
                text: calculateInverse(a, b, c, d).toString(),
                _id: uuid(),
              }
            })

          const answer = {
            type: "text",
            text: calculateInverse(m, n, k, l).toString(),
            _id: uuid(),
          }

          const result: Question = {
            _id: uuid(),
            answerIds: [answer._id],
            hasMultipleCorrectAnswers: false,
            alternatives: shuffle([...alternatives, answer]) as Alternative[],
            questionGroupName:  [m, n, k, l].join(', '),
            types: ['inverse'],
            text: `What is the __inverse__  of the matrix:\n\n\n${formatMatrix(2, [m, n, k, l])}`,
            ...base,
          }

          return result
      })

    
  // matrix multiplication

  // Transformation matrix

  return [
    ...dotProductVectors,
    ...crossProductVectors,
    ...determinant,
    ...inverse
  ]
}

export const getQuestions: (
  categoryId: string,
  levels: Level[]) => Promise<Question[]> = (categoryId: string, levels: Level[]) => {
  const numberBaseLevel = levels.find(({ name }) => name === 'Number bases')
  const trigLevel = levels.find(({ name }) => name === 'Trigonometry')
  const functionsLevel = levels.find(({ name }) => name === 'Functions')
  const kinematicsLevel = levels.find(({ name }) => name === 'Kinematics')
  const linearAlgebraLevel = levels.find(({ name }) => name === 'Linear algebra')
  

  if (isUndefined(numberBaseLevel)) {
    throw new Error(`Data Structures level not found`)
  }
  if (isUndefined(trigLevel)) {
    throw new Error(`Trig level not found`)
  }
  if (isUndefined(functionsLevel)) {
    throw new Error(`Functions level not found`)
  }
  if (isUndefined(kinematicsLevel)) {
    throw new Error(`Kinematics level not found`)
  }
  if (isUndefined(linearAlgebraLevel)) {
    throw new Error(`Linear algebra level not found`)
  }

  const numberBaseQuestions: Question[] = getNumberBaseQuestions(categoryId, numberBaseLevel._id)
  const trigQuestions: Question[] = getTrigQuestions(categoryId, trigLevel._id)
  const functionsQuestions = getFunctionsQuestions(categoryId, functionsLevel?._id)
  const kinematicsQuestions = getKinematicsQuestions(categoryId, kinematicsLevel?._id)
  const linearAlgebraQuestions = getLinearAlgebraQuestions(categoryId, linearAlgebraLevel?._id)

  return Promise.resolve([
    ...numberBaseQuestions,
    ...trigQuestions,
    ...functionsQuestions,
    ...kinematicsQuestions,
    ...linearAlgebraQuestions
  ])
}
