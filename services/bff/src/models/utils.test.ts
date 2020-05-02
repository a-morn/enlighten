import faker from 'faker'
import { GameQuestion, GameMultiplayer } from 'enlighten-common-types'
import { filterGame } from 'enlighten-common-utils'

const getGame: (currentQuestionAnswered: boolean) => GameMultiplayer = (
  currentQuestionAnswered: boolean,
) =>
  ({
    questions: [],
    categoryBackground: faker.image.imageUrl(),
    categoryBackgroundBase64: faker.random.alphaNumeric(),
    categoryId: faker.random.uuid(),
    id: faker.random.uuid(),
    players: [],
    questionIndex: faker.random.number(),
    currentQuestion: {
      answered: currentQuestionAnswered,
      answerId: faker.random.uuid(),
      alternatives: [],
      category: faker.random.uuid(),
      _id: faker.random.uuid(),
      record: faker.random.number(),
      type: 'text',
      text: faker.lorem.text(),
    } as GameQuestion,
    currentQuestionId: faker.random.uuid(),
  } as GameMultiplayer)

describe('filterGame', () => {
  test('should return null if input is null', () => {
    const game = null

    const filteredGame = filterGame(game)

    expect(filteredGame).toBe(null)
  })

  test('should return answerId if current question is answered', () => {
    const game = getGame(true)

    const filteredGame = filterGame(game)

    expect(filteredGame).toEqual(
      expect.objectContaining({
        currentQuestion: expect.objectContaining({
          answerId: game.currentQuestion?.answerId,
        }),
      }),
    )
  })

  test('should not return answerId if current question is not answered', () => {
    const game = getGame(false)

    const filteredGame = filterGame(game)

    expect(filteredGame?.currentQuestion?.answerId).toBeUndefined()
  })
})
