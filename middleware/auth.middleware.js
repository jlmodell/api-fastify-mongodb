const fp = require('fastify-plugin')

module.exports = fp(async (fastify) => {
    fastify.decorate('auth', async (req, reply) => {
        try {
            await req.jwtVerify()
          } catch (err) {
            reply.send(err)
          }
    })
})