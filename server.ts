import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

// Importing Routes
import categoryRouter from "./routes/category.router.ts"
import menuItemRouter from "./routes/menu-item.router.ts"

// Importing Middleware
import ErrorHandler from './middleware/errorHandler.middleware.ts'


const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api/v1/categories", categoryRouter)
app.use("/api/v1/menu-items", menuItemRouter)

app.get("/api/v1", (req, res) => {
    res.send("Hello World")
})

app.use(ErrorHandler)

app.listen(port, (error) => {
    if(!error) {
        console.log(`Server is running on port ${port}`)
    } else {
        console.log("Error occured, Server can't start",error)
    }

})