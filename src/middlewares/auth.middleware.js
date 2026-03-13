import passport from 'passport';

export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ 
                status: 'error',
                error: 'Error en la autenticación',
                details: err.message 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                status: 'error',
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
                status: 'error',
                error: 'Error en la autenticación',
                details: err.message 
            });
        }

        if (!user) {

            const message = info?.message || 'Token inválido o expirado';
            const isExpired = message.toLowerCase().includes('expir');

            return res.status(401).json({ 
                status: 'error',
                error: 'No autenticado',
                message, expired: isExpired 
            });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                error: 'No autenticado' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error',
                error: 'Acceso denegado',
                message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
                yourRole: req.user.role,
                requiredRoles: roles
            });
        }

        next();
    };
};

export const isAdmin = (req, res, next) => {
    return authorize('admin')(req, res, next);
};

export const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            status: 'error',
            error: 'No autenticado' 
        });
    }

    const resourceId = req.params.uid || req.params.id;

    if (req.user.role === 'admin' || req.user._id.toString() === resourceId) {
        return next();
    }

    return res.status(403).json({ 
        status: 'error',
        error: 'Acceso denegado',
        message: 'No tienes permiso para acceder a este recurso'
    });
};

export const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado. Debes iniciar sesión.'
            });
        }

        if (roles.length === 0) return next();
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
            });
        }

        next();
    };
};