const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../Utils/responseWrapper");
const cloudinary = require("cloudinary").v2;



    const createPostController = async (req, res)=>{
    
    try {
        const { caption, postImg } = req.body;
        if(!caption || !postImg){
            res.send(error(400, 'caption and postImg are required'))
        }
        
            const cloudImg = await cloudinary.uploader.upload(postImg, {
                folder: 'postImg'
            })
        
        const owner =  (req._id);   
        const user = await User.findById(req._id);   

        const post = await Post.create({
            owner,
            caption,
            image: {
                publicId: cloudImg.public_id,
                url: cloudImg.url
            }
        })
        
        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, post))
    } catch (e) {
         return res.send(error(500, e.message))
    }

}

 async function likeAndUnlikePost(req, res){

    try {
        const {postId} = req.body
        const curUserId = (req._id)
    
        const post = await Post.findById(postId);
        if(!post){
            return res.send(error(400, 'Post not found'))
        }
    
        if(post.likes.includes(curUserId)){
            const index = post.likes.indexOf(curUserId)
            post.likes.splice(index, 1);
    
            await post.save();
            return res.send(success(200, 'Post Unliked'))
        }
        else{
            console.log(curUserId);
            post.likes.push(curUserId);
            await post.save()
            return res.send(success(200, 'Post Liked'))

        }
        
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))
    }
}

async function updetePostController(req, res){

    try {
        const {postId, caption} = req.body
        const curUserId = req._id
    
        const post = await Post.findById(postId)
        if(!post){
            return res.send(error(404 , 'Post not found'))
        }

        if(post.owner.toString() !== curUserId){
            res.send(error(403, 'Only owner can update their posts'))
        }

        if(caption){
            post.caption = caption
        }

        await post.save()
        return res.send(success(200, {post}))
        
    } catch (e) {
        return res.send(error(500, e.message))
        
    }

}

const deletePost = async (req, res) => {
    try {
        
        const {postId} = req.body 
    
        const curUserId = req._id
    
        const post = await Post.findById(postId)
        const curUser = await User.findById(curUserId);   
        if(!post){
            return res.send(error(404 , 'Post not found'))
        }
    
        if(post.owner.toString() !== curUserId){
            res.send(error(403, 'Only owner can delete their posts'))
        }
        const index = curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1);
        await curUser.save();
        console.log(post);
        await Post.findByIdAndDelete(postId);
    
        return res.send(success(200, 'Post deleted successfully'))
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))

    }


}


module.exports = {
  createPostController,likeAndUnlikePost,updetePostController,deletePost
}