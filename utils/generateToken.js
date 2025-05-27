import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId) => {
    const token = jwt.sign(
        {
        id: userId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
        expiresIn: '1h',
        }
    )
    return token
} 

export const generateRefreshToken = (userId) => {
    const token = jwt.sign(
        {
        id: userId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
        expiresIn: '30d',
        }
    )
    return token
}