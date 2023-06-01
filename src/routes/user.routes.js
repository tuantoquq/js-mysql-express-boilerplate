import { Router } from 'express';
import {
  GetProfile,
  LoginUser,
  RegisterUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';

const UserRoutes = Router();

UserRoutes.post('/api/v1/register', [], RegisterUser);
UserRoutes.post('/api/v1/login', [], LoginUser);
UserRoutes.get('/api/v1/profile', [verifyToken], GetProfile);
export default UserRoutes;
