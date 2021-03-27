import { Document, model, Schema } from 'mongoose';

export interface UserModelInterface {
    _id?: string;
    email: string,
    username: string,
    password: string,
    confirm_hash: string,
    confirmed?: boolean
}

export type UserModelDocumentInterface = UserModelInterface & Document;

const UserSchema = new Schema<UserModelDocumentInterface>({
    email: {
        unique: true,
        required: true,
        type: String,
    },
    username: {
        unique: true,
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,

    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    confirm_hash: {
        required: true,
        type: String,

    }
});

UserSchema.set('toJSON', {
    transform: function (_: any, obj: any) {
        delete obj.password;
        delete obj.confirm_hash
        return obj;
    }
});

export const UserModel = model<UserModelDocumentInterface>('User', UserSchema);
