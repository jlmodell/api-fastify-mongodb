require('dotenv/config')
// const boom = require('boom')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')

async function Login(fastify) {
    /*
        route =>
            /login
        test =>
            curl -d "{\"email\":\"modell.jeff@me.com\", \"password\":\""}" -H "Content-Type: application/json" "http://localhost:9090/login"
        response =>
            {
                "token":
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo"
            }
    */
    fastify.post('/login', async (req, reply) => {
        try {
            const {email, password} = req.body
            if (!email || !password) throw new Error("Missing required parameters to login.")

            const user = await User.findOne({ email })       
            if (!user) throw new Error("Failed to login. Check your parameters and try again.")
                        
            const verifyPassword = await bcrypt.compare(password, user.password)
            if (!verifyPassword) throw new Error("Failed to login. Check your parameters and try again.")

            const token = fastify.jwt.sign({email}, {expiresIn: '15d'})

            reply
                .code(201)
                .send({ token })

        } catch(err) {
            throw new Error(err)
        }
    }
)}

module.exports = Login