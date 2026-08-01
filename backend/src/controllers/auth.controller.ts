import { Request,Response, NextFunction } from "express";
import { registerUser } from "../services/auth.service";



export const registerController = async (req: Request, res: Response, next: NextFunction) => {  

    try{
        const userAgent = req.headers['user-agent'] || '';
        const result = await registerUser(req.body, userAgent);
        
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });


        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });


    } 
    catch (error) {
        next(error);
    }
}
