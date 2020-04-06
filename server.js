require('dotenv/config')
const fastify = require("fastify")({ logger: true })
const mongoose = require("mongoose")
const routes = require('./routes/index')

fastify.register(require('fastify-cors'), { 
    origin: false
  })

fastify.register(require('fastify-jwt'), {
    secret: process.env.JWTKEY
})

fastify.register(require('./middleware/auth.middleware'))
fastify.register(require('./routes/user.auth.route'))
fastify.register(require('./routes/index'))

try {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected Successfully.'))
} catch(err) {
    console.log(err)    
}

(async () => {
    try {
        await fastify.listen(9090)
        fastify.log.info(`API is listening on ${fastify.server.address().port}`)
    } catch(err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()

// routes.forEach((route, _index) => {
//     fastify.route(route)
// })