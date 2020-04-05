require('dotenv/config')
const boom = require('boom')
const User = require('../models/user.model')
const jsonwebtoken = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.login = async (req, reply) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({ email })
        
        if (!user) throw new Error("Failed to login. Check your parameters and try again.")
                    
        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) throw new Error("Failed to login. Check your parameters and try again.")

        const token = jsonwebtoken.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWTKEY,        
            { expiresIn: '15d'}
        )

        reply
            .code(201)
            .send({ token })

    } catch(err) {
        throw boom.boomify(err)
    }
}