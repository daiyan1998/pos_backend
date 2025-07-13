import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'

// Importing Routes
import categoryRouter from "./routes/category.route"
import menuItemRouter from "./routes/menu-item.route"
import tableRouter from "./routes/table.route"
import userRouter from "./routes/user.route"
import orderRouter from "./routes/order.route"
import inventoryRouter from "./routes/inventory.route"

// Importing Middleware
import ErrorHandler from './middleware/errorHandler.middleware'


const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,

}

const app = express()
const port = process.env.PORT || 3000

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/users", userRouter)
app.use("/api/v1/categories", categoryRouter)
app.use("/api/v1/menu-items", menuItemRouter)
app.use("/api/v1/tables", tableRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/inventories",inventoryRouter)

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