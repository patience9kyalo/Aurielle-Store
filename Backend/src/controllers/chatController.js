const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')

const ORDER_ID_REGEX = /[0-9a-fA-F]{24}/
const GREETING_REGEX = /^\s*(hi|hello|hey|good morning|good afternoon|good evening)\b/i

//Order tracking intent

const handleOrderIntent = async (message, userId) => {
    const match = message.match(ORDER_ID_REGEX);

    if (match) {
        const order = await Order.findById(match[0]);

        if (!order || order.user.toString() !== userId.toString()) {
            return "I couldn't find an order with that ID on your account - mind double-checking it?";
        }

        const latestEntry = order.statusHistory[order.statusHistory.length - 1];
        let reply = `Order #${order._id.toString().slice(-8)} is currently **${order.orderStatus}**.`;

        if (order.trackingNumber) {
            reply += ` Tracking number: ${order.trackingNumber}${order.carrier ? ` (${order.carrier})` : ''}.`;
        }
        if (latestEntry?.note) {
            reply += ` Latest update: ${latestEntry.note}`;
        }

        return reply;
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3);

    if (orders.length === 0) {
        return "You don't have any orders yet - once you place one, I can help you track it right here!";
    }

    const list = orders
        .map((o) => `• #${o._id.toString().slice(-8)} — ${o.orderStatus} (KES ${o.totalPrice.toLocaleString()})`)
        .join('\n');

    return `Here are your recent orders:\n${list}\n\nShare an order ID and I can give you more detail on that one.`;
};

//Product search intent 

const handleProductIntent = async (message) => {
    const query = message
        .replace(/\b(do you have|looking for|search for|search|find|any)\b/gi, '')
        .trim()

    if (!query) {
        return 'What are you looking for? Try something like "do you have earrings".'
    }

    const products = await Product.find({
        isActive: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ],
    })
        .limit(5)
        .select('name price discountPrice stock')

    if (products.length === 0) {
        return `I couldn't find anything matching "${query}" right now. I'll let our team know you're looking for it.`
    }

    const list = products
        .map((p) => {
            const price = p.discountPrice || p.price
            return `• ${p.name} — KES ${price.toLocaleString()}${p.stock === 0 ? ' (out of stock)' : ''}`
        })
        .join('\n')

    return `Here's what we have for "${query}":\n${list}`
}

const FAQS = [
    {
        keywords: ['shipping', 'delivery time', 'how long', 'when will', 'deliver'],
        reply:
            "Delivery within Nyeri typically takes 1-2 days, and elsewhere in Kenya 2-5 business days depending on location. You'll get an SMS once your order is ready for pickup or has shipped.",
    },
    {
        keywords: ['return', 'refund', 'exchange', 'cancel'],
        reply:
            "You can cancel an order before it ships for a full refund - instant for card payments. If it's already shipped, let us know here and our team will help sort it out.",
    },
    {
        keywords: ['payment', 'pay with', 'mpesa', 'm-pesa', 'card', 'cash on delivery', 'cod'],
        reply:
            'We accept card payments (Visa/Mastercard) and cash on delivery. Direct M-Pesa is on the way!',
    },
    {
        keywords: ['contact', 'phone number', 'email', 'reach you', 'human', 'agent', 'someone'],
        reply:
            "I've noted that you'd like to speak with our team directly - someone will follow up with you as soon as possible.",
    },
]

const matchesAny = (message, keywords) =>
    keywords.some((kw) => message.toLowerCase().includes(kw))

const ORDER_TRIGGER_WORDS = ['order', 'track', 'where is my', 'status', 'delivery status']
const PRODUCT_TRIGGER_WORDS = ['do you have', 'looking for', 'search for', 'find', 'stock', 'available']

const FALLBACK_REPLY =
    "I'm not sure I can help with that directly, but I've noted your question and a member of the Aurielle team will follow up with you. In the meantime, you can ask me about your orders, our products, shipping, returns, or payment options."

const chat = asyncHandler(async (req, res) => {
    const { message } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400)
        throw new Error('message is required')
    }

    const trimmed = message.trim()
    let reply

    if (GREETING_REGEX.test(trimmed) && trimmed.length < 40) {
        reply =
            "Hi! I can help with order tracking, product availability, shipping, returns, or payment questions - what do you need?"
    } else if (ORDER_ID_REGEX.test(trimmed) || matchesAny(trimmed, ORDER_TRIGGER_WORDS)) {
        reply = await handleOrderIntent(trimmed, req.user._id)
    } else if (matchesAny(trimmed, PRODUCT_TRIGGER_WORDS)) {
        reply = await handleProductIntent(trimmed)
    } else {
        const faq = FAQS.find((f) => matchesAny(trimmed, f.keywords))
        reply = faq ? faq.reply : FALLBACK_REPLY
    }

    res.json({
        success: true,
        data: { reply },
    })
})

module.exports = { chat }