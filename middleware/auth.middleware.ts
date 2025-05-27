import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.ts'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export const verifyJWT = asyncHandler(async (req : Request, res : Response, next : NextFunction) => {
try {
     const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')
  
     if(!token) {
        throw new ApiError(401, 'Unauthorized')
     }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)
  
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    })
  
    if(!user) {
      throw new ApiError(401, 'Unauthorized')
    }
  
    req.user = user
    next()
} catch (error) {
  throw new ApiError(401, error?.message || 'Invalid access token')
}
})