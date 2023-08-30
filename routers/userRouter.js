const router = require('express').Router()
const requireUser = require('../middleWares/requireUser')
const userController = require('../controllers/userController')


router.post('/follow', requireUser, userController.followOrUnfollowUserController)

module.exports = router