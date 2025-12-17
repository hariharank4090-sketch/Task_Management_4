import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "./hash";
import { signJwt } from "./jwtAuth";
import { UserMaster } from "../../../models/masters/users/users.model";
import { dataFound, invalidInput, notFound, servError } from "../../../responseObject";

export type JwtUser = {
    id: number;
    userType: number;
    name: string;
    uniqueName: string;
    branchId: number;
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body as { username?: string; password?: string };

    try {

        if (!username || !password) return invalidInput(res, 'username and password are required');

        const user = await UserMaster.findOne({
            where: {
                uniqueName: username,
                isActive: 1
            }
        });

        if (!user) return notFound(res, 'Invalid credentials');

        const passwordCheck = await verifyPassword(password, user.password);
        if (!passwordCheck) return notFound(res, 'Invalid credentials');

        const payload: JwtUser = {
            id: user.id,
            userType: user.userType,
            name: user.name,
            uniqueName: user.uniqueName,
            branchId: user.branchId,
        };

        const token = signJwt(payload);

        dataFound(res, [], 'dataFound', {
            token, user: payload
        });

    } catch (err) {
        servError(err, res);
    }
}