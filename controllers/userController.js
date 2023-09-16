const User = require("../models/User");
const { success, error } = require("../Utils/responseWrapper");
const Post = require("../models/Post");  
const { mapPosOutput } = require("../Utils/utils");
const cloudinary = require("cloudinary").v2;





const followOrUnfollowUserController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = (req._id);

        const userToFollow = await User.findById(userIdToFollow)
        const curUser = await User.findById(curUserId)

        if (curUserId === userIdToFollow) {
            return res.send(error(409, 'users cannot follow themselvs'))
        }
        if (!userToFollow) {
            return res.send(error(404, 'user to follow not found'));
        }
        if (curUser.followings.includes(userIdToFollow)) {
            const followingIndex = curUser.followings.indexOf(userIdToFollow)
            curUser.followings.splice(followingIndex, 1)

            const followerIndex = userToFollow.followers.indexOf(curUser)
            userToFollow.followers.splice(followerIndex, 1)

            await userToFollow.save();
            await curUser.save();

            res.send(success(200, 'User Unfollowed'))
        } else {
            userToFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow)
            await userToFollow.save();
            await curUser.save();

            res.send(success(200, 'User followed'))
        }

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))

    }


}

const getPostOfFollowing = async (req, res) => {
    try {

        const curUserId = req._id

        const curUser = await User.findById(curUserId)

        const posts = await Post.find({
            'owner': {
                '$in': curUser.followings
            }
        })
        return res.send(success(200, posts))
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))
    }
}

const getMyPosts = async (req, res) => {
    try {
        const curUserId = req._id
        const allUserPosts = await Post.find({
            owner: curUserId
        }).populate('likes')
        return res.send(success(200, { allUserPosts }))

    } catch (e) {
        return res.send(error(500, e.message))

    }
}

const getUserPosts = async (req, res) => {
    try {
        const userId = req.body.userId
        if (!userId) {
            res.send(error(400, 'UserId is required'))
        }
        const allUserPosts = await Post.find({
            owner: userId
        }).populate('likes')
        return res.send(success(200, { allUserPosts }))

    } catch (e) {
        return res.send(error(500, e.message))

    }

}

const deletMyProfile = async (req, res) => {

    try {


        const curUserId = req._id
        const curUser = await User.findById(curUserId);

        // delete all posts
        await Post.deleteMany({
            owner: curUserId
        })

        // remove myself from my following, followers

        curUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(curUserId);
            follower.followings.splice(index, 1)
            await follower.save()
        })
        // remove myself from my followers, following
        curUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(curUserId);
            following.followers.splice(index, 1)
            await following.save()
        })

        // remove myself from all likes
        const allPosts = await Post.find()
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        // delete user
        await User.deleteOne(curUser);

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
           })
           return res.send(success(200, 'User deleted'))
    } catch (e) {
        return res.send(error(500, e.message))
    }
}

const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id)
        res.send(success(200, {user}))
    } catch (e) {
        return res.send(error(500, e.message))
        
    }
}
const updateUserProfile = async (req, res) => {
    try {
        const {name, bio, userImg} = req.body;

        const user = await User.findById(req._id);
        if(name){
            user.name = name
        }
        if(bio){
            user.bio = bio
        }
        if(userImg){
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }

        }
        await user.save();
    return res.send(success(200 , {user}))
        
    } catch (e) {
            return res.send(error(500, e.message))
            
        }
    }
    
    const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId
        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });

        const fullPosts = user.posts;
        const posts = fullPosts.map(item => mapPosOutput(item, req._id)).reverse();

        return res.send(success(200, {...user._doc, posts}))

    } catch (e) {
        return res.send(error(500, e.message))
        
    }

}

module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deletMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile

}