const express = require('express')
require("dotenv").config()
const PORT = process.env.PORT
const URI = process.env.URI
const cors = require('cors')
const app = express()
const Router = require("./routes")
const mongoose = require("mongoose")

app.use(express.json())
app.use(cors())
app.use(express.static('pages'))
app.use(Router)

if(mongoose.connect(URI)) app.listen(PORT,()=>console.log(`runnig at port ${PORT}`))

