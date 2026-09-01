const { z } = require('zod');

const categorySchema = z.object({
    name: z
        .string({ required_error: 'Category name is required' })
        .min(2, 'Category name must be at least 2 characters long')
        .max(50, 'Category name cannot exceed 50 characters')
        .trim(),

    description: z
        .string()
        .max(300, 'Description cannot exceed 300 characters')
        .trim()
        .optional(),

    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID format')
        .optional()
        .nullable(),

    isActive: z.boolean().optional(),
});

module.exports = {
    categorySchema,
};