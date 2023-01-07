require('dotenv').config()
const Fastify = require('fastify')
const FastifyMultipart = require('@fastify/multipart')

const commonSchemas = require('./constants/commonSchemas')
const directoryRoutes = require('./routes/directory/routes')
const fileRoutes = require('./routes/file/routes')

module.exports = (dfs) => {
    // Create fastify instance
    const fastify = Fastify({ logger: { base: undefined } })

    // Load common schemas
    commonSchemas.forEach((schema) => fastify.addSchema(schema))

    // Register routes
    fastify.register(FastifyMultipart)
    fastify.register(directoryRoutes)
    fastify.register(fileRoutes)

    // Attach dfs to every req
    fastify.addHook('onRequest', async (req) => { req.dfs = dfs })

    // Setup Error handler
    fastify.setErrorHandler(function handler(error, request, reply) {
        if (error.statusCode > 500 || !error.statusCode) {
            this.log.error(error)
            error.statusCode = 500 // eslint-disable-line no-param-reassign
            error.message = 'Internal server error' // eslint-disable-line no-param-reassign
        }
        reply.status(error.statusCode).send({ message: error.message })
    })

    // Handle Not found handler
    fastify.setNotFoundHandler((request, reply) => {
        reply.status(404).send({ message: 'Not found' })
    })

    return fastify
}