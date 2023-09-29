const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../Utils/responseWrapper");
const { mapPosOutput } = require("../Utils/utils");
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

        return res.send(success(200, {post}))
    } catch (e) {
         return res.send(error(500, e.message))
    }

}

 async function likeAndUnlikePost(req, res){

    try {
        const {postId} = req.body
        const curUserId = (req._id)
    
        const post = await Post.findById(postId).populate('owner');
        if(!post){
            return res.send(error(400, 'Post not found'))
        }
    
        if(post.likes.includes(curUserId)){
            const index = post.likes.indexOf(curUserId)
            post.likes.splice(index, 1);
        }
        else{
            post.likes.push(curUserId);
        }
        await post.save();
        return res.send(success(200, {post: mapPosOutput(post , req._id)}))
        
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))
    }
}

async function updetePostController(req, res){

    try {
        const {postId, caption, postImg} = req.body
        const curUserId = req._id
    
        const post = await Post.findById(postId).populate('owner')
        if(!post){
            return res.send(error(404 , 'Post not found'))
        }

        if(post.owner._id
            .toString() !== curUserId){
            res.send(error(403, 'Only owner can update their posts'))
        }

        if(caption){
            post.caption = caption
        }
        if(postImg){
            post.image.url = postImg
        }

        await post.save()
        console.log(post);
        return res.send(success(200, {post: mapPosOutput(post , req._id)}))
        
    } catch (e) {
        return res.send(error(500, e.message))
        
    }

}

async function deletePost(req, res){
    try {
        
        const {postId} = req.body
        
        const curUserId = req._id
    
        const post = await Post.findById(postId).populate('owner')
        const curUser = await User.findById(curUserId);   
        if(!post){
            return res.send(error(404 , 'Post not found'))
        }
    
        if(post.owner._id.toString() != curUserId){
            res.send(error(403, 'Only owner can delete their posts'))
        }
        const index = curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1);

        await Post.findByIdAndDelete(postId);
        await curUser.save();

    
        return res.send(success(200,  {post: mapPosOutput(post , req._id)}))
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))

    }


}


module.exports = {
  createPostController,likeAndUnlikePost,updetePostController,deletePost
}