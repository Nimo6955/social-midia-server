const router = require('express').Router()
const requireUser = require('../middleWares/requireUser')
const userController = require('../controllers/userController')


router.post('/follow', requireUser, userController.followOrUnfollowUserController)
router.get('/getPostOfFollowing', requireUser, userController.getPostOfFollowing)
router.get('/getMyPosts', requireUser, userController.getMyPosts)
router.get('/getUserPosts', requireUser, userController.getUserPosts)
router.delete('/', requireUser, userController.deletMyProfile)
router.get('/getMyInfo', requireUser, userController.getMyInfo)
router.put('/', requireUser, userController.updateUserProfile)
router.post('/getUserProfile', requireUser, userController.getUserProfile)

module.exports = router