require('dotenv/config')
const fs = require('fs')
const path = require('path')
const fastify = require("fastify")({
    logger: true, 
    https: {
        // ../../../etc/letsencrypt/live/busseweb.com/
        key: fs.readFileSync(path.join(__dirname, "..", "..", "..", "etc", "letsencrypt", "live", "busseweb.com", "privkey.pem")),
        cert: fs.readFileSync(path.join(__dirname, "..", "..", "..", "etc", "letsencrypt", "live", "busseweb.com", "cert.pem")),
        ca: fs.readFileSync(path.join(__dirname, "..", "..", "..", "etc", "letsencrypt", "live", "busseweb.com", "chain.pem"))
    } 
})
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
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected Successfully.'))
} catch(err) {
    console.log(err)    
}

(async () => {
    try {
        await fastify.listen(9090, '0.0.0.0')
        // fastify.log.info(`API is listening on ${fastify.server.address().port}`)
    } catch(err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()