require('dotenv/config')
const boom = require('boom')
const User = require('../models/user.model')
// const jsonwebtoken = require('jsonwebtoken')
const bcrypt = require('bcrypt')

/*

    curl -d '{"email":"modell.jeff@me.com", "password":"secret"}' -H 'Content-Type: application/json' http://localhost:9090/login

    res => 
        {
            "token":
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo"
        }

*/

async function Login(fastify) {
    fastify.post('/login', async (req, reply) => {
        try {
            const {email, password} = req.body
            if (!email || !password) throw new Error("Missing required parameters to login.")

            const user = await User.findOne({ email })       
            if (!user) throw new Error("Failed to login. Check your parameters and try again.")
                        
            const verifyPassword = await bcrypt.compare(password, user.password)
            if (!verifyPassword) throw new Error("Failed to login. Check your parameters and try again.")

            // const token = jsonwebtoken.sign(
            //     {
            //         userId: user.id,
            //         email: user.email
            //     },
            //     process.env.JWTKEY,
            //     { expiresIn: '15d'}
            // )

            const token = fastify.jwt.sign({email}, {expiresIn: '15d'})

            reply
                .code(201)
                .send({ token })

        } catch(err) {
            throw boom.boomify(err)
        }

    }
)}

module.exports = Login