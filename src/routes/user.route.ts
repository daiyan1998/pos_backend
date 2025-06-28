import {Router} from 'express'
import { verifyJWT } from '../middleware/auth.middleware';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller';

const router = Router();

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

export default router