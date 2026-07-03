import { Type } from '@sinclair/typebox'

export const OrderItemSchema = Type.Object({
  productId: Type.String(),
  name: Type.String(),
  size: Type.String(),
  quantity: Type.Integer(),
  price: Type.Number(),
  currency: Type.String()
})

export const OrderSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  items: Type.Any(), // JSON array
  totalAmount: Type.Number(),
  currency: Type.String(),
  status: Type.String(),
  paymentMethod: Type.String(),
  address: Type.String(),
  phone: Type.String(),
  createdAt: Type.Any(),
  updatedAt: Type.Any()
})

export const createOrderSchema = {
  tags: ['orders'],
  body: Type.Object({
    items: Type.Array(OrderItemSchema),
    totalAmount: Type.Number(),
    currency: Type.String(),
    paymentMethod: Type.String(),
    address: Type.String(),
    phone: Type.String(),
    useReferralBonus: Type.Boolean()
  }),
  response: {
    200: Type.Object({
      data: OrderSchema
    })
  }
}

export const listOrdersSchema = {
  tags: ['orders'],
  response: {
    200: Type.Object({
      data: Type.Array(OrderSchema)
    })
  }
}

export const listAllOrdersSchema = {
  tags: ['orders-admin'],
  response: {
    200: Type.Object({
      data: Type.Array(OrderSchema)
    })
  }
}

export const updateOrderStatusSchema = {
  tags: ['orders-admin'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Object({
    status: Type.String()
  }),
  response: {
    200: Type.Object({
      data: OrderSchema
    })
  }
}
