export type QuestionEntityType<T> = {
  id: keyof T
  label: string
}

export type QuestionDirection<T> = {
  fromType: QuestionEntityType<T> | QuestionEntityType<T>[]
  toType: QuestionEntityType<T>
}

export type QuestionType<T> = {
  [key: string]: QuestionEntityType<T>
}

export type Question = {
  id: string
  alternatives: Alternative[]
  category: string
  answerId: string
  text: string
} & (
  | {
      type: 'text'
    }
  | {
      type: 'image'
      src: string
    }
  | {
      type: 'tones'
      tones: string[]
    }
)

export type GameQuestion = Question & {
  record: number
  answered: boolean
}

export type Alternative = {
  id: string
} & (
  | {
      type: 'image'
      src: string
    }
  | {
      type: 'text'
      text: string
    }
)

export type QuestionObject = {
  [key: string]: { questions: Question[] }
}
