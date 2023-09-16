const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { error, success } = require('../Utils/responseWrapper');


const signUpController = async (req, res) =>{
    try {
       const {name, email, password} = req.body;
       if(!email || !password || !name){
        // return res.status(400).send('All feilds are required')
        return res.send(error(400, 'All feilds are required'))
       }

       const oldUser = await User.findOne({email});

       if(oldUser){
        // return res.status(409).send('User is alredy registered')
        return res.send(error(409, 'User is alredy registered'))
       }

       const hashedPassword = await bcrypt.hash(password, 10);

       const user = await User.create({
        name,
        email,
        password: hashedPassword,
       });
    return res.send(success(201,{user}))


    } catch (e) {
        // return res.send(error(500, e.massage))
    }
}
const logInController = async (req, res) =>{
    try {
        
        const {email, password} = req.body;
       if(!email || !password){
        // return res.status(400).send('All feilds are required')
        return res.send(error(400, 'All feilds are required'))
       }

       const user = await User.findOne({email})
    //    .select('+password');

       if(!user){
        // return res.status(404).send('User is not registered')
        return res.send(error(404, 'User is not registered'))
       }

       const matched = await bcrypt.compare(password, user.password);
       if(!matched){
        // return res.status(403).send('Incorrect Password')
        return res.send(error(403, 'Incorrect Password'))
       }

       const accessToken = generateAccessToken({_id: user._id,})
       const refreshToken = generateRefreshToken({_id: user._id,})


       res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
       })

    //    console.log(refreshToken,'     idk');
       return res.send(success(200, {accessToken}))
    } catch (e) {
        // return res.send(error(500, e.massage))
    }
}
// this api will check the refreshToken validity and generat a new access token
const refreshAccessTokenControllerApi = async (req, res) => {
    // const {refreshToken} = req.body
    const Cookies =  req.cookies
    if(!Cookies.jwt){
        // return res.status(401).send('Refresh token in cookies is required')
        return res.send(error(401, 'Refresh token in cookies is required'))
    }
    const refreshToken = await Cookies.jwt
    console.log('refresh', refreshToken);

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY)

        const _id = decoded._id;
        const accessToken = generateAccessToken({_id})  
        return res.send(success (201 , {accessToken}))
    } catch (error) {
        console.log(error);
        // return res.status(401).send('Invalid refresh token')
        return res.send(error(401, 'Invalid refresh token'))
    }
};

const logOutController = async (req, res) => {
        try {
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: true,
               })
               res.send(success(200, 'User logged out'))
        } catch (error) {
            return res.send(error(500, e.message))

        }
}


// Internal functions => not going to be exported
const generateAccessToken = (data) =>{
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d",
        })
        console.log(token);
        return token
        
    } catch (error) {
        console.log(error);
    }
}

const generateRefreshToken = (data) =>{
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y",
        })
        console.log(token);
        return token
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    signUpController,logInController,refreshAccessTokenControllerApi,logOutController
}