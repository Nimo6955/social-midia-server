var ta = require('time-ago')
const mapPosOutput = (post, userId) =>{
    return {
        _id: post._id,
        caption: post.caption,
        image: post.image,
        owner: {
            _id: post.owner._id,
            name: post.owner.name,
            avatar: post.owner.avatar,

        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(userId),
        timeAgo: ta.ago(post.createdAt)
    }
}
// const mapbookmark = (curUser, postId) =>{
//     return {
//         _id: curUser._id,
//         bookmarked: curUser.bookmarks.includes(postId)
//     }
// }
module.exports = {
    mapPosOutput,
    // mapbookmark
}