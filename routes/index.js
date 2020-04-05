const userController = require('../controllers/user.controller')

const routes = [
    {
        method: "POST",
        url:'/login',
        handler: userController.login
    }
]

module.exports = routes