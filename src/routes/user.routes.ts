import UserController from "../controllers/user.controller"; 
import userCriteria from "../middleware/usercriteria.middleware";
import { Router } from 'express'; 
import verifyToken from "../middleware/verifytoken.middleware";

const router = Router();   

router.get('/', userCriteria, UserController.getUsers);
router.get('/profile',verifyToken, UserController.getProfile);
router.get('/:id',userCriteria, UserController.getUser); 
router.post('/login', UserController.login);
router.post('/',userCriteria, UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
