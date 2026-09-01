const nodemailer = require('nodemailer')

const sendEmail = async (options) => {

    const port = Number(process.env.EMAIL_PORT) || 587

    //create transporter
    const transporter = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    const mailOptions = {
        from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.message,
        html: options.html,
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail