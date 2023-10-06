const router = require('express').Router();
const postController = require('../controllers/postController')
const requireUser = require('../middleWares/requireUser')

router.post('/',requireUser, postController.createPostController)
router.post('/like',requireUser, postController.likeAndUnlikePost)
router.put('/',requireUser, postController.updetePostController)
router.delete('/delete',requireUser, postController.deletePost)
router.post('/bookmarkPost',requireUser, postController.bookmarkPost)

module.exports = router