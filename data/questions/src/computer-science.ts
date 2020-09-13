import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import {
  Question,
  Alternative,
  TextAlternative,
} from "enlighten-common-types";
import { Level } from "enlighten-common-types";
import { isUndefined } from "util";

const hasOperations = <T>(x: T): x is T & { operations: string[] } => {
  return 'operations' in x
}

const DATA_STRUCTURES = [
  { name: 'Vector', type: 'Abtract Data Type', traits: ['Fixed size', 'Linear Data Structure'], operations: ['`length`', '`select[k]`', '`store[k]`']},
  { name: 'Queue', type: 'Abstract Data Type', traits: ['FIFO', 'Dynamic Size', 'Linear Data Structure'], operations: ['`head`', '`dequeue`', '`enqueue`', '`empty`']},
  { name: 'Stack', type: 'Abstract Data Type', traits: ['LIFO', 'Dynamic Size', 'Linear Data Structure'], operations: ['`push`', '`top`', '`pop`', '`empty`']},
  { name: 'Array', type: 'Data Structure', traits: ['Used to implement the Vector ADT', 'Fixed size', 'Dynamic access']},
  { name: 'Dynamic Array', type: 'Abstract Data Type', traits: ['Linear Data Structure', 'Dynamic Size', 'Dynamic access'], operations: ['`length`', '`select[k]`', '`store[k]`', '`removeAt[k]`', '`insertAt[o, k]`']},
  { name: 'Linked List', type: 'Data Structure', traits: ['Dynamic Size', 'Used to implement the Queue ADT', 'Used to implement the Stack ADT']}
] as const

const getDataStructureQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const dsWithOperations = DATA_STRUCTURES
    .filter(ds => hasOperations(ds))

  const operationsToNameQuestions: Question[] = dsWithOperations
    .map(ds => {
      if (hasOperations(ds)) { // this is always true, just helping tsc out
        const alternatives: TextAlternative[] = dsWithOperations
          .map(({ name }) => ({
            type: "text",
            text: name,
            _id: uuid(),
          }))

        const answerId = alternatives.find(({ text }) => text === ds.name)?._id

        if (isUndefined(answerId)) {
          throw new Error(`Can't happen`)
        }

        const result: Question = {
          _id: uuid(),
          hasMultipleCorrectAnswers: false,
          answerIds: [answerId],
          alternatives: alternatives as Alternative[],
          questionGroupName: ds.name,
          types: ['name', 'operations'],
          text: `Which __Abstract Data Type__ has the following operations: ${ds.operations.join(', ')}?`,
          ...base,
        }

        return result
      } else {
        throw new Error(`Can't happen`)
      }
    })

  const nameToOperationsQuestions: Question[] = dsWithOperations
    .map(ds => {
      if (hasOperations(ds)) { // this is always true, just helping tsc out
        const alternatives: TextAlternative[] = dsWithOperations
          .map(ds => {
            if (!hasOperations(ds)) {
              throw new Error(`Can't happen, just helping tsc out`)
            }

            return {
              type: "text",
              text: ds.operations.join(`, `),
              _id: uuid(),
            }
          })

        const answerId = alternatives.find(({ text }) => text === ds.operations.join(`, `))?._id

        if (isUndefined(answerId)) {
          throw new Error(`Can't happen`)
        }

        const result: Question = {
          _id: uuid(),
          answerIds: [answerId],
          hasMultipleCorrectAnswers: false,
          alternatives: alternatives as Alternative[],
          questionGroupName: ds.name,
          types: ['name', 'operations'],
          text: `Which operations does a __${ds.name}__ have?`,
          ...base,
        }

        return result
      } else {
        throw new Error(`Can't happen`)
      }
    })

  const nameToTraitsQuestions: Question[] = DATA_STRUCTURES
    .map(ds => {
      const answerId = uuid()

      const alternatives: TextAlternative[] = shuffle([
        ...shuffle(DATA_STRUCTURES
          .filter(({ name }) => name !== ds.name)
          .slice(0, 3))
          .map(dsAlt => ({
              type: "text",
              text: dsAlt.traits.join(`, `),
              _id: uuid(),
          } as const)),
          {
            type: "text",
            text: ds.traits.join(`, `),
            _id: answerId,
          } as const
        ])

      const result: Question = {
        _id: uuid(),
        answerIds: [answerId],
        hasMultipleCorrectAnswers: false,
        alternatives: alternatives as Alternative[],
        questionGroupName: ds.name,
        types: ['name', 'operations'],
        text: `Which traits does a __${ds.name}__ have?`,
        ...base,
      }

      return result
    })

    const traitsToNameQuestions: Question[] = DATA_STRUCTURES
      .map(ds => {
        const answerId = uuid()

        const alternatives: TextAlternative[] = shuffle([
          ...shuffle(DATA_STRUCTURES
            .filter(({ name }) => name !== ds.name)
            .slice(0, 3))
            .map(dsAlt => ({
                type: "text",
                text: dsAlt.name,
                _id: uuid(),
            } as const)),
            {
              type: "text",
              text: ds.name,
              _id: answerId,
            } as const
          ])

        const result: Question = {
          _id: uuid(),
          answerIds: [answerId],
          hasMultipleCorrectAnswers: false,
          alternatives: alternatives as Alternative[],
          questionGroupName: ds.name,
          types: ['name', 'operations'],
          text: `Which __data structure/ADT__ has the following traits: ${(ds.traits as readonly string[]).map(trait => `_${trait}_`).join(`, `)}?`,
          ...base,
        }

        return result
      })

  return [
    ...operationsToNameQuestions,
    ...nameToOperationsQuestions,
    ...traitsToNameQuestions,
    ...nameToTraitsQuestions
  ]
}

const binarySeardPseudoCodeImplementation =
`function Algorithm(v, x)
  n ← LENGTH[vector]
  L ← 1
  R ← n
  while R ≥ L do
    m ← Floor((L + R) / 2)
    if v[m] = x then
      return TRUE
    else if v[m] > x then
      R ← m - 1
    else
      L ← m + 1
    end if
  end while
  
  return FALSE
end function`

const bubbleSortPseudoCodeImplementation =
`function Swap(vector, i, j)
  // Changes place of elements at index j and j in vector
end function

function Algorithm(vector)
  n ← LENGTH[vector]
  for 1 ≤ i ≤ n - 1 do
    hasSwapped ← FALSE
    for 1 ≤ j ≤ n - 1 do
      if vector[j + 1] < vector[j] then
        Swap(vector, j, j + 1)
        hasSwapped ← TRUE
      end if
    end for
    
    if hasSwapped do
      break
    end if
  end for
  
  return vector
end function`

const bubbleSortJavaScriptImplementation =
`function swap(array, i, j) {
  const temp = array[i]
  array[i] = array[j]
  array[j] = temp
}

function algorithm(array) {
  const length = array.length

  for (let i = 0; i <= length - 2; i++) {
    let hasSwapped = false

    for (let j = 0; j <= n - 2; j++) {
      if (array[j + 1] < array[j]) {
        swap(array, j, j + 1)
        hasSwapped = true
      }
    }

    if (!hasSwapped) {
      break
    }
  }

  return array
}
`
const insertionSortPseudoCodeImplementation = 
`function Shift(array, i, j)
  // right shifts elements in subarray j to i one step
end function

function Algorithm(vector)
  for 2 ≤ i ≤ LENGTH[vector] do
    j ← i
    while (vector[i] < vector[j - 1]) ∧ (j > 1) do
      j ← j - 1
    end while
    Shift(vector, i, j)
  end for
end function`

const mergeSortPseudoCodeImplementation =
`function  Merge(w, v)
  // merges the sorted vectors w and v into one sorted vector and returns it
end function

function Algorithm(vector)
  length ← LENGTH[vector]
  if length = 1 then
    return vector
  end if
  m ← Floor((n + 1) / 2)
  new Vector L(m)
  new Vector R(n - m)
  L ← vector[1 : m]
  R ← vector[m + 1 : n]
  return Merge(MergeSort(L), MergeSort(R))
end function`

const linearSearchPseudoCodeImplementation =
`function Algorithm(v, item)
  for 1 ≤ i ≤ LENGTH[v] do
    if v[i] = item then
      return i
    end if
  end for
  
  return FALSE
end function`

const quickSortJavaScriptImplementation =
`function pivot(arr, low = 0, high = arr.length + 1) {
  // position all elements smaller than high to the left of high and all elements larger than high to the right
}

function algorithm(arr, low = 0, high = arr.length) {
  const pivotIndex = Math.floor(end/2)
  
  if (start >= end) {
    return arr
  }
  algorithm(arr, start, pivotIndex)
  algorithm(arr, pivotIndex + 1, end)
  
  return arr
}`

const ALGORITHMS = [
  {
    name: 'Linear Search',
    type: 'Algorithm',
    typeOfAlgorithm: 'Search',
    misc: ['Works with unsorted input'],
    implementations: [{ language: 'Pseudo Code', text: linearSearchPseudoCodeImplementation }],
    complexity: {
      worstCaseTime: 'O(n)',
      worstCaseSpace: 'O(1)'
    }
  },
  {
    name: 'Binary Search',
    type: 'Algorithm',
    typeOfAlgorithm: 'Search',
    misc: ['Requires sorted input', 'Optimal search algorithm', 'Decrease and Conquer'],
    implementations: [{ language: 'Pseudo Code', text: binarySeardPseudoCodeImplementation}],
    complexity: {
      worstCaseTime: 'O(log n)',
      worstCaseSpace: 'O(1)'
    }
  },
  {
    name: 'Bubble Sort',
    type: 'Algorithm',
    typeOfAlgorithm: 'Sort',
    implementations: [
      {language: 'Pseudo Code', text: bubbleSortPseudoCodeImplementation },
      {language: 'JavaScript', text: bubbleSortJavaScriptImplementation }
    ],
    complexity: {
      worstCaseTime: 'O(n^2)',
      worstCaseSpace: 'O(1)'
    }
  },
  {
    name: 'Insertion Sort',
    type: 'Algorithm',
    typeOfAlgorithm: 'Sort',
    misc: ['Decrease and Conquer'],
    implementations: [{ language: 'Pseudo Code', text: insertionSortPseudoCodeImplementation}],
    complexity: {
      worstCaseTime: 'O(n^2)',
      worstCaseSpace: 'O(1)'
    }
  },
  {
    name: 'Quick Sort',
    type: 'Algorithm',
    typeOfAlgorithm: 'Sort',
    misc: ['Divide and Conquer'],
    implementations: [{ language: 'JavaScript', text: quickSortJavaScriptImplementation}],
    complexity: {
      worstCaseTime: 'O(n^2)',
      worstCaseSpace: 'O(log n)'
    }
  },
  {
    name: 'Merge Sort',
    type: 'Algorithm',
    typeOfAlgorithm: 'Sort',
    misc: ['Divide and Conquer'],
    implementations: [{ language: 'Pseudo Code', text: mergeSortPseudoCodeImplementation}],
    complexity: {
      worstCaseTime: 'O(n log n)',
      worstCaseSpace: 'O(n)'
    }
  }
]

const getAlgorithmQuestions = (categoryId: string, levelId: string): Question[] => {
  if (isUndefined(categoryId)) {
    throw new Error(`Shouldn't happen`)
  }
  const base = {
    type: "text",
    categoryId,
    levelId
  } as const

  const implementationToNameQuestions: Question[] = ALGORITHMS
    .map(algo => {
      const answerId = uuid()

      const alternatives: TextAlternative[] = shuffle([
        ...shuffle(ALGORITHMS
          .filter(({ name }) => name !== algo.name)
          .slice(0, 3))
          .map(algoAlt => ({
              type: "text",
              text: algoAlt.name,
              _id: uuid(),
          } as const)),
          {
            type: "text",
            text: algo.name,
            _id: answerId,
          } as const
        ])

      const algoImpl = shuffle(algo.implementations)[0]

      const result: Question = {
        _id: uuid(),
        answerIds: [answerId],
        hasMultipleCorrectAnswers: false,
        alternatives: alternatives as Alternative[],
        questionGroupName: algo.name,
        types: ['name', 'implementation'],
        text:
`Name this algorithm:

\`\`\`${algoImpl.language}
${algoImpl.text}
\`\`\`
`,
        ...base,
      }

      return result
    })

  // name -> big O
  const nameToBigOQuestions: Question[] = ALGORITHMS
    .map(algo => {
      const answerId = uuid()

      const alternatives: TextAlternative[] = shuffle([
        ...shuffle(
          ALGORITHMS
            .filter(({ name }) => name !== algo.name)
            .slice(0, 3))
            .map(algoAlt => ({
                type: "text",
                text: algoAlt.complexity?.worstCaseTime,
                _id: uuid(),
            } as const)),
        {
          type: "text",
          text: algo.complexity.worstCaseTime,
          _id: answerId,
        } as const
      ])

      const result: Question = {
        _id: uuid(),
        answerIds: [answerId],
        hasMultipleCorrectAnswers: false,
        alternatives: alternatives as Alternative[],
        questionGroupName: algo.name,
        types: ['name', 'implementation'],
        text: `What is the worst case time complexity of ${algo.name}?`,
        ...base,
      }

      return result
    })

  return [
    ...implementationToNameQuestions,
    ...nameToBigOQuestions
  ]
}

export const getQuestions: (
  categoryId: string,
  levels: Level[]
  ) => Promise<Question[]> = (categoryId: string, levels: Level[]) => {
  const dsLevel = levels.find(({ name }) => name === 'Data Structures')
  const algoLevel = levels.find(({ name }) => name === 'Algorithms')

  if (isUndefined(dsLevel)) {
    throw new Error(`Data Structures level not found`)
  }
  if (isUndefined(algoLevel)) {
    throw new Error(`Algorithms level not found`)
  }

  const dsQuestions: Question[] = getDataStructureQuestions(categoryId, dsLevel._id)
  const algoQuestions: Question[] = getAlgorithmQuestions(categoryId, algoLevel._id)

  return Promise.resolve([
    ...dsQuestions,
    ...algoQuestions
  ])
}
