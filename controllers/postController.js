const Post = require("../models/Post");
const User = require("../models/User");

const { success, error } = require("../Utils/responseWrapper");

const getAllPostController = async (req,res)=>{
    console.log(req._id);
    return res.send(success(201, 'These are all posts'))
};

    const createPostController = async (req, res)=>{
    
    try {
        const { caption } = req.body;
        const owner =  (req._id);   
        const user = await User.findById(req._id);   

        const post = await Post.create({
            owner,
            caption
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

module.exports = {
    getAllPostController,createPostController,likeAndUnlikePost
}