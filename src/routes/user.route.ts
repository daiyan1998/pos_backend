import {Router} from 'express'
import { verifyJWT } from '../middleware/auth.middleware';
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller';

const router = Router();

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

export default router