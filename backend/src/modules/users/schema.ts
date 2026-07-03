import { Type } from '@sinclair/typebox'

export const UserSchema = Type.Object({
  id: Type.String(),
  username: Type.Union([Type.String(), Type.Null()]),
  firstName: Type.Union([Type.String(), Type.Null()]),
  lastName: Type.Union([Type.String(), Type.Null()]),
  role: Type.Integer(),
  region: Type.String(),
  currency: Type.String(),
  address: Type.Union([Type.String(), Type.Null()]),
  bonusBalance: Type.Number(),
  referredById: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.Any(),
  updatedAt: Type.Any()
})

export const getProfileSchema = {
  tags: ['users'],
  response: {
    200: Type.Object({
      data: UserSchema
    })
  }
}

export const updateProfileSchema = {
  tags: ['users'],
  body: Type.Object({
    region: Type.Optional(Type.String()),
    currency: Type.Optional(Type.String()),
    address: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Object({
      data: UserSchema
    })
  }
}

export const listUsersSchema = {
  tags: ['users-admin'],
  response: {
    200: Type.Object({
      data: Type.Array(UserSchema)
    })
  }
}

export const adjustBalanceSchema = {
  tags: ['users-admin'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Object({
    amount: Type.Number()
  }),
  response: {
    200: Type.Object({
      data: UserSchema
    })
  }
}
