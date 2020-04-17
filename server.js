require('dotenv/config')
const fastify = require("fastify")({ logger: true })
const mongoose = require("mongoose")

fastify.register(require('fastify-cors'), { 
    origin: "*"
  })

fastify.register(require('fastify-jwt'), {
    secret: process.env.JWTKEY
})

fastify.register(require('./middleware/auth.middleware'))
fastify.register(require('./routes/user.auth.route'))
fastify.register(require('./routes/index'))

try {
    mongoose.connect(process.env.MONGODB_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected Successfully.'))
} catch(err) {
    console.log(err)    
}

(async () => {
    try {
        await fastify.listen(9090, '0.0.0.0')
        fastify.log.info(`API is listening on ${fastify.server.address().port}`)
    } catch(err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()