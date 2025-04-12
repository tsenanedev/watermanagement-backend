const jwt = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token inválido" });

      if (decoded.role) {
        req.tenant_id = supplierId = decoded.role?.system_suppliers?.id || null;
      } else {
        req.tenant_id = null;
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(401).json({ error: "Não autorizado" });
  }
};

module.exports = authMiddleware;
