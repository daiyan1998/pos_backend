import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

interface TokenPayload extends JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export const verifyJWT = asyncHandler(async (req : Request, res : Response, next : NextFunction) => {
try {
     const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','')
     console.log(token)
  
     if(!token) {
        throw new ApiError(401, 'Unauthorized')
     }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload

    
    if(typeof decodedToken === 'string' || !('id' in decodedToken)) {
      throw new ApiError(401, 'Invalid token payload')
    }

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
} catch (error:any) {
  throw new ApiError(401, error?.message || 'Invalid access token')
}
})