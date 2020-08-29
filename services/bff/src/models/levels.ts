import { getClient } from '../data/client'
import { findLevels } from '../data/levels'
import { Level } from 'enlighten-common-types'

const getLevels = async (categoryId: string): Promise<Level[] | undefined> => {
  const client = await getClient()
  const levels = await findLevels(client, categoryId)

  return levels
}

export { getLevels }
