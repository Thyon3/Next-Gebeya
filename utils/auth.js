import jwt from 'jsonwebtoken';

export const signToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET || 'secret',
        {
            expiresIn: '30d',
        }
    );
};

export const isAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
        const token = authorization.slice(7, authorization.length);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
            if (next) return next();
            return decoded;
        } catch (err) {
            if (res) res.status(401).send({ message: 'Token is not valid' });
            throw new Error('Token is not valid');
        }
    } else {
        if (res) res.status(401).send({ message: 'Token is not supplied' });
        throw new Error('Token is not supplied');
    }
};

export const isAdmin = async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({ message: 'User is not admin' });
    }
};
