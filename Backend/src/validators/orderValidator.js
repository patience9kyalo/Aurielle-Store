const { z } = require('zod')

const shippingAddressValidator = z.object({
    address: z
        .string({ required_error: 'Street address is required' })
        .min(5, 'Street address must be at least 5 characters')
        .trim(),

    city: z
        .string({ required_error: 'City is required' })
        .min(2, 'City is required')
        .trim(),

    state: z
        .string({ required_error: 'State is required' })
        .min(2, 'State is required')
        .trim(),

    postalCode: z
        .string({ required_error: 'Postal code is required' })
        .regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code format (use 12345 or 12345-6789)'),

    country: z
        .string({ required_error: 'Country is required' })
        .min(2, 'Country is required')
        .trim(),

    phone: z
        .string({ required_error: 'Phone number is required' })
        .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
})

const orderItemValidator = z.object({
    product: z
        .string({ required_error: 'Product ID is required' })
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),

    name: z
        .string({ required_error: 'Product name is required' })
        .min(1, 'Product name is required'),

    quantity: z
        .number({ required_error: 'Quantity is required' })
        .int('Quantity must be an integer')
        .positive('Quantity must be at least 1')
        .max(100, 'Cannot order more than 100 units of a single item')
        .or(z.string().transform((val) => parseInt(val, 10))),

    price: z
        .number({ required_error: 'Price is required' })
        .positive('Price must be positive')
        .or(z.string().transform((val) => parseFloat(val))),

    image: z
        .string()
        .url('Invalid image URL')
        .optional(),
})

const createOrderValidator = z.object({
    orderItems: z
        .array(orderItemValidator)
        .min(1, 'Order must contain at least one item')
        .max(50, 'Cannot order more than 50 different items at once'),

    shippingAddress: shippingAddressValidator,

    paymentMethod: z
        .enum(['card', 'cash_on_delivery'], {
            errorMap: () => ({ message: 'Invalid payment method. Choose: card or cash_on_delivery' }),
        }),

    itemsPrice: z
        .number({ required_error: 'Items price is required' })
        .positive('Items price must be positive')
        .or(z.string().transform((val) => parseFloat(val))),

    taxPrice: z
        .number()
        .nonnegative('Tax price cannot be negative')
        .or(z.string().transform((val) => parseFloat(val)))
        .default(0),

    shippingPrice: z
        .number()
        .nonnegative('Shipping price cannot be negative')
        .or(z.string().transform((val) => parseFloat(val)))
        .default(0),

    totalPrice: z
        .number({ required_error: 'Total price is required' })
        .positive('Total price must be positive')
        .or(z.string().transform((val) => parseFloat(val))),
})

const updateOrderStatusValidator = z.object({
    orderStatus: z
        .enum(['Pending','Ready for Pickup', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], {
            errorMap: () => ({ message: 'Invalid order status' }),
        }),
})

module.exports = {
    createOrderValidator,
    updateOrderStatusValidator,
    shippingAddressValidator,
}