import createError from '@fastify/error'

export const NotFoundError = createError('GZ_NOT_FOUND', '%s not found', 404)
export const UnauthorizedError = createError('GZ_UNAUTHORIZED', 'Authentication required', 401)
export const ForbiddenError = createError('GZ_FORBIDDEN', 'Access denied: %s', 403)
export const ValidationError = createError('GZ_VALIDATION', '%s', 400)
export const ConflictError = createError('GZ_CONFLICT', '%s already exists', 409)
export const TooManyRequestsError = createError('GZ_RATE_LIMIT', 'Too many requests', 429)
export const InternalError = createError('GZ_INTERNAL', 'Internal server error', 500)
