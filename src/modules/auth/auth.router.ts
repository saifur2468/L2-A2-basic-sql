// import { Router } from 'express';
// import { signup, login } from './auth.controller';
// import { validateSignup } from '../../middleware/validate.middleware';

// const router = Router();

// router.post('/signup', validateSignup, signup);
// router.post('/login', login);

// export default router;

import { Router } from 'express';
import { signup, login } from './auth.controller'; // নামগুলো চেক করুন

const router = Router();

// এখানে চেক করুন signup বা login বানানে ভুল আছে কি না
router.post('/signup', signup); 
router.post('/login', login);

export default router;