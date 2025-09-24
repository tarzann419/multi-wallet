import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHandler.js';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return errorResponse(
            res,
            'No token provided, authorization denied',
            401,
            'NO_TOKEN'
        );
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return errorResponse(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
    }
};
