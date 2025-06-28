import { Request, Response } from 'express'
import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler"
import prisma from '../lib/prisma'
import { ApiResponse } from "../utils/ApiResponse"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken"
import { comparePassword, hashPassword } from "../utils/password"
import { createUserSchema } from "../schemaValidation/user.validation"

const generateAccessAndRefreshToken = async (userId: string) => {
    try {
        const accessToken = generateAccessToken(userId)
        const refreshToken = generateRefreshToken(userId)

        // Save refresh token in database
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Error generating tokens")
    }
}

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body)
    const { email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }

    // Check if password is correct
    const isMatch = comparePassword(password, user.password)

    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password")
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id)

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const
    }

    res.status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(
        new ApiResponse(200, {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            accessToken,
            refreshToken
        }, "Login successful")
    )
})

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
        const {firstName, lastName, email, password, phone, role,} = createUserSchema.parse(req.body)

        const userExists = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (userExists) {
         throw new ApiError(400, "User already exists")
        }

        // Hash the password
        const hashedPassword = hashPassword(password)

        const createdUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                username: email,
                password: hashedPassword,
                phone,
                role
            }
        })

        res.status(201).json(
           new ApiResponse(200,createdUser, "User created successfully")
        )
   
}
)

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
   if (!req.user?.id) {
        throw new ApiError(401, "User not authenticated")
    }

    await prisma.user.update({
        where: {
            id: req.user.id
        },
        data: {
            refreshToken: null
        }
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "Logout successful")
    )
})