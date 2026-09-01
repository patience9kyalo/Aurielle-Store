const AfricasTalking = require('africastalking')

if (!process.env.AFRICASTALKING_API_KEY) {
    console.warn('AFRICASTALKING_API_KEY is not set - SMS sending will fail.')
}

const africastalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
})

const sms = africastalking.SMS

// Africa's Talking (and most SMS gateways) expect E.164 format:
// +254712345678. Customers will type numbers all sorts of ways
// (0712345678, 254712345678, +254 712 345 678), so normalize before
// sending rather than rejecting anything that isn't already perfect.
const normalizeKenyanPhone = (rawPhone) => {
    if (!rawPhone) return null

    const digitsOnly = rawPhone.replace(/[^\d+]/g, '')

    if (digitsOnly.startsWith('+254')) return digitsOnly
    if (digitsOnly.startsWith('254')) return `+${digitsOnly}`
    if (digitsOnly.startsWith('0')) return `+254${digitsOnly.slice(1)}`

    // Fallback: assume it's a local number missing the leading 0.
    if (digitsOnly.length === 9) return `+254${digitsOnly}`

    return null // couldn't confidently normalize - caller should handle null
}

const sendSMS = async (rawPhone, message) => {
    const to = normalizeKenyanPhone(rawPhone)

    if (!to) {
        throw new Error(`Could not normalize phone number for SMS: "${rawPhone}"`)
    }

    const result = await sms.send({
        to: [to],
        message,
        from: process.env.AFRICASTALKING_SENDER_ID || undefined,
    })

    return result
}

module.exports = { sendSMS, normalizeKenyanPhone }