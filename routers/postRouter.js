const router = require('express').Router();
const postController = require('../controllers/postController')
const requireUser = require('../middleWares/requireUser')

router.get('/all',requireUser, postController.getAllPostController)
router.post('/',requireUser, postController.createPostController)
router.post('/like',requireUser, postController.likeAndUnlikePost)

module.exports = router