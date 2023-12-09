const express = require('express')
const dotenv = require('dotenv')
const DBconnect = require('./DBconnect') 
const morgan = require('morgan') 
const authRouters = require('./routers/authRouter')
const postRouters = require('./routers/postRouter')
const userRouters = require('./routers/userRouter')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const cloudinary = require("cloudinary").v2;

dotenv.config('./.env')

const app = express()
const port = process.env.port || 4000

app.use(express.json({limit: '10mb'}))
app.use(morgan('common'))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
}))

// Configuration
cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    // cloud_name: 'dgiigpirf',
    // api_key: '595995642645468',
    // api_secret: 'H_cuCRQxhN2RkeyepKB2eRMrTlk',
});

app.use('/auth', authRouters)
app.use('/posts', postRouters)
app.use('/user', userRouters)
app.get('/', (req, res)=>{
    res.status(200).send('testing passed')
});
app.use(
    express.urlencoded({ extended: true })
);

DBconnect();

app.listen(port, ()=>{
    console.log(`listening on port:${port}`);
})