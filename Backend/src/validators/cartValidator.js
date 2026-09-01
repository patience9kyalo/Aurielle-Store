const { z } = require('zod')

const addToCartValidator = z.object({
    product: z
        .string({ required_error: 'Product is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),

    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .positive('Quantity must be at least 1')
        .optional()
        .or(z.string().transform((val) => parseInt(val, 10))),
})

const updateCartItemValidator = z.object({
    quantity: z
        .number({ required_error: 'Quantity is required' })
        .int('Quantity must be a whole number')
        .positive('Quantity must be at least 1')
        .or(z.string().transform((val) => parseInt(val, 10))),
})

module.exports = {
    addToCartValidator,
    updateCartItemValidator,
}