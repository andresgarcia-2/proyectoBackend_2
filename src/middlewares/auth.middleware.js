import passport from 'passport';

export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Error en la autenticación',
                details: err.message 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                error: 'No autenticado',
                message: 'Token inválido o expirado' 
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export const authenticateCurrent = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Error en la autenticación',
                details: err.message 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                error: 'No autenticado',
                message: info?.message || 'Token inválido o expirado' 
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'No autenticado' 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado',
            message: 'Se requiere rol de administrador' 
        });
    }

    next();
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'No autenticado' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

export const isOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'No autenticado' 
        });
    }

    const resourceUserId = req.params.userId || req.body.userId;
    
    if (req.user._id.toString() !== resourceUserId && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado',
            message: 'No tienes permiso para acceder a este recurso' 
        });
    }

    next();
};

