import { Category } from "enlighten-common-types"

export function getCategoryIdByLabel(label: string, categories: Category[]) {
    const categoryId = categories.find((category) => category.label === label)?._id
    if (!categoryId) {
      throw new Error(`Can't find id for category with label ${label}`)
    }
  
    return categoryId
}