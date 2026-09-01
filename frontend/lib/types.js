// Plain JS project - no compiled types here. These JSDoc typedefs are
// purely for editor autocomplete/hover docs; they match your backend
// Mongoose models and aren't required by anything at runtime.

/**
 * @typedef {Object} Category
 * @property {string} _id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [image]
 */

/**
 * @typedef {Object} ProductImage
 * @property {string} public_id
 * @property {string} url
 */

/**
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} [discountPrice]
 * @property {Category|string} category
 * @property {number} stock
 * @property {ProductImage[]} images
 * @property {number} rating
 * @property {number} numOfReviews
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} CartItem
 * @property {Product} product
 * @property {number} quantity
 * @property {number} priceAtAdd
 */

/**
 * @typedef {Object} Cart
 * @property {string} [_id]
 * @property {string} [user]
 * @property {CartItem[]} items
 * @property {number} [totalItems]
 * @property {number} [subtotal]
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country
 * @property {string} phone
 */

/**
 * @typedef {Object} StatusHistoryEntry
 * @property {string} status
 * @property {string} updatedAt
 * @property {string} [note]
 */

/**
 * @typedef {'Pending'|'Processing'|'Ready for Pickup'|'Shipped'|'Delivered'|'Cancelled'} OrderStatus
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} product
 * @property {string} name
 * @property {number} quantity
 * @property {number} price
 * @property {string} [image]
 */

/**
 * @typedef {Object} Order
 * @property {string} _id
 * @property {OrderItem[]} orderItems
 * @property {ShippingAddress} shippingAddress
 * @property {'card'|'cash_on_delivery'} paymentMethod
 * @property {number} itemsPrice
 * @property {number} taxPrice
 * @property {number} shippingPrice
 * @property {number} totalPrice
 * @property {OrderStatus} orderStatus
 * @property {boolean} isPaid
 * @property {boolean} isDelivered
 * @property {string} [trackingNumber]
 * @property {string} [carrier]
 * @property {StatusHistoryEntry[]} statusHistory
 * @property {string} createdAt
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {'user'|'admin'} role
 * @property {string} [phone]
 */

export {};
