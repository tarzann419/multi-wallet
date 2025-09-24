export const successResponse = (res, message, data = {}, status = 200, code = 'SUCCESS') => {
    return res.status(status).json({
        code,
        message,
        status,
        success: true,
        data,
    });
};

export const errorResponse = (res, message, status = 400, code = 'ERROR', errors = []) => {
    return res.status(status).json({
        code,
        message,
        status,
        success: false,
        errors,
    });
};
