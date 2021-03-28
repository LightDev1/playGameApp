import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { UserModel, UserModelDocumentInterface, UserModelInterface } from '../models/UserModel';
import { generateMD5 } from '../utils/generateHash';
import { sendEmail } from '../utils/sendEmail';

const isValidObjectId = mongoose.Types.ObjectId.isValid;

class UserController {
    async index(req: express.Request, res: express.Response): Promise<void> {
        try {
            const users = await UserModel.find({}).exec();

            res.json({
                status: 'success',
                data: users
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }

    async show(req: express.Request, res: express.Response): Promise<void> {
        try {
            const userId = req.params.id;

            if (!isValidObjectId(userId)) {
                res.status(400).send();
                return;
            }

            const user = await UserModel.findById(userId).exec();

            if (!user) {
                res.status(404).send();
                return;
            }

            res.json({
                status: 'success',
                data: user
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }

    async create(req: express.Request, res: express.Response): Promise<void> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                res.status(400).json({ status: 'error', errors: errors.array() });
                return;
            }

            const data: UserModelInterface = {
                email: req.body.email,
                username: req.body.username,
                password: generateMD5(req.body.password + process.env.SECRET_KEY),
                confirm_hash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
            }

            const user = await UserModel.create(data);

            sendEmail({
                emailFrom: 'admin@gameplay.com',
                emailTo: data.email,
                subject: 'Подтверждение почты PlayGame',
                html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:${process.env.PORT || 5000}/api/auth/verify?hash=${data.confirm_hash}">по этой ссылке</a>`,
            }, (err: Error | null) => {
                if (err) {
                    res.status(500).json({
                        status: 'error',
                        message: err
                    });
                } else {
                    res.status(201).json({
                        status: 'success',
                        data: user
                    });
                }
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }

    async verify(req: any, res: express.Response): Promise<void> {
        try {
            const hash = req.query.hash;

            if (!hash) {
                res.status(400).send();
                return;
            }

            const user = await UserModel.findOne({ confirm_hash: hash }).exec();

            if (user) {
                user.confirmed = true;
                user.save();

                res.json({
                    status: 'success'
                });
            } else {
                res.status(400).json({
                    status: 'error',
                    message: 'Пользователь не найден'
                });
            }

        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }

    async afterLogin(req: express.Request, res: express.Response): Promise<void> {
        try {
            const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
            res.json({
                status: 'success',
                data: {
                    ...user,
                    token: jwt.sign({ data: req.user }, process.env.SECRET_KEY || '123', { expiresIn: '30d' })
                }
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }

    async getUserInfo(req: express.Request, res: express.Response): Promise<void> {
        try {
            const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
            res.json({
                status: 'success',
                data: user
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: e
            });
        }
    }
}

export const userCtrl = new UserController();