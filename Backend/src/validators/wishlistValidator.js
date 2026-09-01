const { z } = require('zod')

const addToWishlistValidator = z.object({
    product: z
        .string({ required_error: 'Product is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
})

const moveToCartValidator = z.object({
    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .positive('Quantity must be at least 1')
        .optional()
        .or(z.string().transform((val) => parseInt(val, 10))),
})

module.exports = {
    addToWishlistValidator,
    moveToCartValidator,
}