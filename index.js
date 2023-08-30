const express = require('express')
const dotenv = require('dotenv')
const DBconnect = require('./DBconnect') 
const morgan = require('morgan') 
const authRouters = require('./routers/authRouter')
const postRouters = require('./routers/postRouter')
const userRouters = require('./routers/userRouter')
const cookieParser = require('cookie-parser')
const cors = require('cors')


dotenv.config('./.env')

const app = express()
const port = process.env.port || 4000

app.use(express.json())
app.use(morgan('common'))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

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