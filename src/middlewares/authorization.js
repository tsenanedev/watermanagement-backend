const hasRole = (roleName) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });

    if (!hasRole) {
      return res.status(403).json({ error: `Role necessária: ${roleName}` });
    }

    next();
  };
};
const hasPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const userRole = req.user.role;
      if (!userRole) {
        return res
          .status(403)
          .json({ error: "Nenhum perfil de acesso atribuído" });
      }
      const permissions = userRole.permissions?.map((p) => p.name) || [];

      if (!permissions.includes(permissionName)) {
        return res.status(403).json({ error: "Acesso Negado" });
      }

      next();
    } catch (error) {
      logger.error({
        message:
          error.errors?.map((e) => e.message).join(" | ") || error.message,
        stack: error.stack,
        sql: error.sql,
        parameters: error.parameters,
        timestamp: new Date(),
      });
      res.status(401).json({ error: "Acesso Negado" });
    }
  };
};
module.exports = { hasRole, hasPermission };
