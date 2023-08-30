const User = require("../models/User");
const { success, error } = require("../Utils/responseWrapper");



const followOrUnfollowUserController = async (req, res)=>{
    try {
        const {userIdToFollow} = req.body;
        const curUserId = (req._id);
    
        const userToFollow = await User.findById(userIdToFollow)
        const curUser = await User.findById(curUserId)
        if(!userToFollow){
            return res.send(error(404, 'user to follow not found'));
        }
        if(curUser.followings.includes(userIdToFollow)){    
            const followingIndex = curUser.followings.indexOf(userIdToFollow)
            curUser.followings.splice(followingIndex, 1)
    
            const followerIndex = userToFollow.followers.indexOf(curUser)
            userToFollow.followers.splice(followerIndex, 1)
    
            await userToFollow.save();
            await curUser.save();
    
            res.send(success(200, 'User Unfollowed'))
        }else{
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

module.exports = {
    followOrUnfollowUserController
}