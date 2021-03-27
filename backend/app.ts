import dotenv from 'dotenv';
dotenv.config();

import './core/db';

import express from 'express';
import { registerValidations } from './validation/register';
import { userCtrl } from './controllers/UserController';
import { passport } from './core/passport';

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get('/api/users', userCtrl.index);
app.get('/api/users/me', passport.authenticate('jwt'), userCtrl.getUserInfo);
app.get('/api/users/:id', userCtrl.show);
app.get('/api/auth/verify', registerValidations, userCtrl.verify);
app.post('/api/auth/register', registerValidations, userCtrl.create);
app.post('/api/auth/login', passport.authenticate('local'), userCtrl.afterLogin);
// app.patch('users', userCtrl.update);
// app.delete('users', userCtrl.delete);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер был запущен на порте ${PORT}`);
});
