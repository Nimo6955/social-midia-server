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
        const curUser = await User.findById(curUserId).populate('followers')

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
        } else {
            userToFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow)
        }
        await userToFollow.save();
        await curUser.save();

        return res.send(success(200, { user: userToFollow }))

    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message))

    }


}

const getPostOfFollowing = async (req, res) => {
    try {

        const curUserId = req._id

        const curUser = await User.findById(curUserId).populate('followings').populate('followers').populate({
            path: 'bookmarks',
            populate: {
                path: 'owner'
            }
        })
        const fullPosts = await Post.find({
            owner: {
                $in: curUser.followings
            }
        }).populate('owner')


        const posts = fullPosts.map((item) => mapPosOutput(item, req._id)).reverse();
        curUser.posts = posts
        const followingsIds = curUser.followings.map((item) => item._id);
        let following = curUser.followings
        followingsIds.push(req._id);

        const suggestions = await User.find({
            '_id': {
                '$nin': followingsIds
            }
        })
        const AllUsers = await User.find()
        AllUsers.pop(req._id)
        // suggestions.splice(4)
        let shuffledSuggestions = suggestions
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
        shuffledSuggestions.splice(4)
        let signUpSuggestions = [
            {
                "avatar": {
                    "publicId": "profileImg/lgesye3fkgmavlfwogz7",
                    "url": "https://res.cloudinary.com/dgiigpirf/image/upload/v1700216143/profileImg/lgesye3fkgmavlfwogz7.jpg"
                },
                "_id": "656c613ddaf9f73029ba5895",
                "email": "richard_roe@gmail.com",
                "name": "Richard Roe ",

            },
            {
                "avatar": {
                    "publicId": "profileImg/y47njqik2yr70ij9zly8",
                    "url": "https://res.cloudinary.com/dgiigpirf/image/upload/v1701600436/profileImg/y47njqik2yr70ij9zly8.jpg"
                },
                "_id": "655736545a5555a97516aa7d",
                "email": "john_doe@gmail.com",
                "name": "john doe",
            },
            {
                "avatar": {
                    "publicId": "profileImg/kjjf9msnbpixylb5lvrf",
                    "url": "https://res.cloudinary.com/dgiigpirf/image/upload/v1700384704/profileImg/kjjf9msnbpixylb5lvrf.png"
                },
                "_id": "6559c9ce902bdcf94edf9df4",
                "email": "ryu_lopez@gmail.com",
                "name": "ryu Lopez",
            },
            {
                "avatar": {
                    "publicId": "profileImg/bnz6dcvcitmprhsz9rb9",
                    "url": "https://res.cloudinary.com/dgiigpirf/image/upload/v1700387540/profileImg/bnz6dcvcitmprhsz9rb9.png"
                },
                "_id": "6559dabff4579cd8d71c05d8",
                "email": "luna_clementine@gmail.com",
                "name": "Luna William",

            },

        ]
        // let signUpSuggestions = suggestions
        // signUpSuggestions = signUpSuggestions.filter((signUpSuggestions, idx) => idx < 4)
        // signUpSuggestions.pop(following)



        return res.send(success(200, { ...curUser._doc, shuffledSuggestions, suggestions, AllUsers, signUpSuggestions, posts }))
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
        res.send(success(200, { user }))
    } catch (e) {
        return res.send(error(500, e.message))

    }
}
const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;

        const user = await User.findById(req._id);
        if (name) {
            user.name = name
        }
        if (bio) {
            user.bio = bio
        }
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }

        }
        await user.save();
        return res.send(success(200, { user }))

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
        }).populate('followers').populate('followings').populate({
            path: 'bookmarks',
            populate: {
                path: 'owner'
            }
        })

        const fullPosts = user.posts;
        const posts = fullPosts.map(item => mapPosOutput(item, req._id)).reverse();

        return res.send(success(200, { ...user._doc, posts }))

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