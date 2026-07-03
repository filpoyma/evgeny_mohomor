import { Type } from '@sinclair/typebox'

export const ArticleSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  content: Type.String(),
  imageUrl: Type.String(),
  readTime: Type.String(),
  createdAt: Type.Any()
})

export const listArticlesSchema = {
  tags: ['articles'],
  response: {
    200: Type.Object({
      data: Type.Array(ArticleSchema)
    })
  }
}
