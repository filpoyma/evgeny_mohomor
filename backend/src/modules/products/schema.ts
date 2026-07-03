import { Type } from '@sinclair/typebox'

export const ProductSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.String(),
  category: Type.String(),
  priceIdr: Type.Number(),
  priceVnd: Type.Number(),
  priceUsdt: Type.Number(),
  priceRub: Type.Number(),
  imageUrl: Type.String(),
  size: Type.String(),
  stock: Type.Integer(),
  createdAt: Type.Any(),
  updatedAt: Type.Any()
})

export const listProductsSchema = {
  tags: ['products'],
  response: {
    200: Type.Object({
      data: Type.Array(ProductSchema)
    })
  }
}

export const createProductSchema = {
  tags: ['products'],
  body: Type.Object({
    name: Type.String(),
    description: Type.String(),
    category: Type.String(),
    priceIdr: Type.Number(),
    priceVnd: Type.Number(),
    priceUsdt: Type.Number(),
    priceRub: Type.Number(),
    imageUrl: Type.String(),
    size: Type.String(),
    stock: Type.Integer()
  }),
  response: {
    200: Type.Object({
      data: ProductSchema
    })
  }
}

export const updateProductSchema = {
  tags: ['products'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Partial(Type.Object({
    name: Type.String(),
    description: Type.String(),
    category: Type.String(),
    priceIdr: Type.Number(),
    priceVnd: Type.Number(),
    priceUsdt: Type.Number(),
    priceRub: Type.Number(),
    imageUrl: Type.String(),
    size: Type.String(),
    stock: Type.Integer()
  })),
  response: {
    200: Type.Object({
      data: ProductSchema
    })
  }
}

export const deleteProductSchema = {
  tags: ['products'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Type.Object({
      success: Type.Boolean()
    })
  }
}
