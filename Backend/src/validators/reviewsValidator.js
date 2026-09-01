const { z } = require('zod')
const { reviewValidator } = require('./productValidator')

const reviewCreateValidator = reviewValidator.extend({
    product: z
        .string({ required_error: 'Product is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
})

const reviewUpdateValidator = reviewValidator.partial()
 
module.exports = {
    reviewCreateValidator,
    reviewUpdateValidator,
};
 