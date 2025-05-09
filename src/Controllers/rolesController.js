const {
  roles,
  system_suppliers: system_suppliers,
  regulators: regulators,
} = require("../models");
// Listar todos os rolees
exports.index = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const offset = (page - 1) * perPage;

    const { count, rows } = await roles
      .scope({ method: ["tenant", req.tenant] })
      .findAndCountAll({
        limit: parseInt(perPage),
        offset: offset,
        include: [
          {
            association: "regulators",
            required: false, // Não é obrigatório ter um regulador
            where: { "$roles.table_name$": "regulators" }, // Filtro para reguladores
          },
          {
            association: "system_suppliers",
            required: false, // Não é obrigatório ter um operador
            where: { "$roles.table_name$": "system_suppliers" }, // Filtro para operadores
            include: [
              {
                association: "operators", // Alias definido na associação
                attributes: ["id", "name"], // Campos específicos do operador (opcional)
              },
            ],
          },
        ],
      });

    return res.status(200).json({
      //   success: true,
      total: count,
      page: parseInt(page),
      perPage: parseInt(perPage),
      data: rows,
    });
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(500).json({ error: "Erro ao listar todos os perfis de acesso" });
  }
};

exports.create = async (req, res) => {
  const {
    name: RoleName,
    description,
    table_name,
    table_id,
    permissions,
  } = req.body;
  const transaction = await roles.sequelize.transaction();
  try {
    const targetModel = {
      regulators,
      system_suppliers,
    }[(table_name || "").toLowerCase()];

    if (!targetModel) {
      throw new Error(
        "O nome da entidade é inválido (use: Regulador ou Sistema de Abstecimento)"
      );
    }
    const model = await targetModel.findByPk(table_id);

    if (!model) {
      throw new Error(
        `${
          table_name == "regulators" ? "Regulador" : "Sistema de Abstecimento"
        } não encontrado`
      );
    }

    if (!RoleName || RoleName.length < 3) {
      throw new Error(
        "Nome do perfil de acesso deve ter pelo menos 3 caracteres"
      );
    }

    if (
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      throw new Error("Lista de permissões é inválida ou vazia");
    }
    const invalidPermissions = permissions.filter((p) => !p.id);
    if (invalidPermissions.length > 0) {
      throw new Error("Permissões devem conter IDs válidos");
    }
    const existingRole = await roles.findOne({
      where: { name: RoleName },
      transaction,
    });

    if (existingRole) {
      throw new Error(`Perfil de acesso '${RoleName}' já existe`);
    }
    // 3. Extrair e validar IDs das permissões
    const permissionIds = permissions.map((p) => p.id);
    const uniqueIds = [...new Set(permissionIds)];

    // 4. Verificar consistência numérica
    if (uniqueIds.some(isNaN)) throw new Error("IDs de permissão inválidos");
    const role = await roles.create(
      {
        name: RoleName,
        description: description,
        table_name: table_name,
        table_id: model.id,
      },
      { transaction }
    );
    await role.addPermissions(uniqueIds, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Perfil de acesso criado com sucesso",
      data: role,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  const {
    name: RoleName,
    description,
    table_name,
    table_id,
    permissions,
  } = req.body;
  const transaction = await roles.sequelize.transaction();
  try {
    const role = await roles.findByPk(req.params.id, {
      include: "permissions",
      attributes: ["id", "name"],
      through: { attributes: [] },
    });

    if (!role) {
      return res.status(404).json({ error: "Perfil de acesso não encontrado" });
    }
    await role.update(
      {
        name: RoleName,
        description: description,
        table_name: table_name,
        table_id: table_id,
      },
      { transaction }
    );
    await role.setPermissions(
      (permissions || []).map((p) => (typeof p === "object" ? p.id : p)),
      { transaction }
    );
    await role.reload({ transaction });
    await transaction.commit();

    return res.json({
      success: true,
      message: "Perfil de acesso actualizada com sucesso",
      role,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(400).json({ error: "Falha ao actualizar" });
  }
};

// Buscar um role por ID
exports.show = async (req, res) => {
  try {
    const role = await roles.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Perfil de acesso não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Perfil de acesso encontrado",
      data: role,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro buscar um perfil de acesso " });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql, // Query SQL (se existir)
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const deleted = await roles.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Perfil de acesso não encontrado" });
    }

    res.status(200).json({
      success: true,
      message: "Perfil de acesso removido com sucesso",
      data: null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erro ao remover Perfil de acesso" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
