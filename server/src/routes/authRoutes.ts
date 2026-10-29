import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { UserLoginSchema, UserRegisterSchema } from '../../../shared/dist/validators';

const router = Router();

router.get('/schools', AuthController.getSchools);
router.get('/demo-users', AuthController.getDemoUsers);
router.post('/login', validateBody(UserLoginSchema), AuthController.login);
router.post('/register', validateBody(UserRegisterSchema), AuthController.register);
router.get('/me', authenticate, AuthController.me);

export default router;

