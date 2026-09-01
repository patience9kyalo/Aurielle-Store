const { z } = require('zod')

const validateZod = (schema) => {
    return async (req, res, next) => {

        try {
            const validatedData = await schema.parseAsync(req.body)

            req.body = validatedData

            next()
        } catch (error) {

            if (error instanceof z.ZodError) {

                const issues = error.issues ?? error.errors ?? []

                const formattedErrors = issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }))

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors,
                })
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error during validation',
            })
        }
    }
}

const validateQuery= (schema) => {
    return async (req, res, next) => {
        try {

            const validatedData =await schema.parseAsync(req.query)
            req.query = validatedData
            next()

        } catch (error) {

            if(error instanceof z.ZodError) {

                const issues = error.issues ?? error.errors ?? []

                const formattedErrors = issues.map((err) => ({
                    field: err.path.join('.'),
                    message:err.message,

                }))

                return res.status(400).json({
                    success: false,
                    message:  'Invalid query parameters',
                    errors: formattedErrors,
                })
            }

            return res.status(500).json({
                success: false,
                message: 'Internal Server error',
            })
        }
    }
}

module.exports = {
    validateZod,
    validateQuery,
}