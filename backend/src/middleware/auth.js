const { verifyToken } = require('../utils/jwt');
const userService = require('../modules/user/user.service');
const { UnauthorizedActionException } = require('../common/errors');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.substring(7);
  }
  return null;
}

/**
 * Populates req.user (the full Mongo user doc) and req.principal (id/role)
 * whenever a valid, non-refresh access token is present. Never rejects the
 * request itself — mirrors JwtAuthenticationFilter, which just leaves the
 * SecurityContext empty on failure and lets downstream guards decide.
 */
async function populateUser(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const claims = verifyToken(token);
    if (claims.type === 'refresh') return next(); // refresh tokens are never bearer tokens

    const user = await userService.getById(claims.sub).catch(() => null);
    if (!user || !user.enabled) return next();

    req.user = user;
    req.principal = { id: user.id, role: user.role, email: user.email, name: user.name };
  } catch (_err) {
    // invalid/expired token — treat as anonymous, same as the Java filter
  }
  next();
}

/** Requires an authenticated principal — mirrors .anyRequest().authenticated(). */
function requireAuth(req, _res, next) {
  if (!req.principal) {
    throw new UnauthorizedActionException('Authentication required to access this resource.');
  }
  next();
}

/** Requires one of the given roles — mirrors @PreAuthorize("hasAnyRole(...)"). */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.principal) {
      throw new UnauthorizedActionException('Authentication required to access this resource.');
    }
    if (!roles.includes(req.principal.role)) {
      throw new UnauthorizedActionException("You don't have permission to perform this action.");
    }
    next();
  };
}

module.exports = { populateUser, requireAuth, requireRole };
