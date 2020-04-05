require('dotenv/config')
const fastify = require("fastify")({ logger: true })
const mongoose = require("mongoose")
const routes = require('./routes/index')

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

routes.forEach((route, index) => {
    fastify.route(route)
})