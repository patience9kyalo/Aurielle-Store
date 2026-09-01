const { z } = require('zod');

const productSchema = z.object({
    name: z
        .string()
        .min(3, 'Product name must be at least 3 characters long')
        .max(200, 'Product name cannot exceed 200 characters')
        .trim(),

    description: z
        .string({ required_error: 'Product description is required' })
        .min(10, 'Product description must be at least 10 characters long')
        .max(1000, 'Product description cannot exceed 1000 characters')
        .trim(),

    price: z
        .number({ required_error: 'Product price is required' })
        .positive('Product price must be a positive number')
        .or(z.string().transform((val) => parseFloat(val))),

    discountPrice: z
        .number()
        .positive('Discount price must be a positive number')
        .optional()
        .or(z.string().transform((val) => parseFloat(val)))
        .refine((val) => !val || val >= 0, {
            message: 'Discount price must be a positive number',
        }),

    category: z
        .string({ required_error: 'Category is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),

    stock: z
        .number({ required_error: 'Stock is required' })
        .int('Stock must be an integer')
        .nonnegative('Stock cannot be negative')
        .or(z.string().transform((val) => parseInt(val, 10))),

    specifications: z
        .record(z.string())
        .optional(),
});

const reviewValidator = z.object({
    rating: z
        .number({ required_error: 'Rating is required' })
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .or(z.string().transform((val) => parseFloat(val))),

    comment: z
        .string({ required_error: 'Comment is required' })
        .min(5, 'Comment must be at least 5 characters long')
        .max(500, 'Comment cannot exceed 500 characters')
        .trim(),
});

module.exports = {
    productSchema,
    reviewValidator,
};

