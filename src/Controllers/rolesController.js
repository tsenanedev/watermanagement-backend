const { roles: roles, models } = require("../models");

exports.create = async (req, res) => {
  const {
    name: RoleName,
    description,
    table_name,
    table_id,
    permissions,
  } = req.body;
  const allowedTables = ["regulators", "system_suppliers"];
  try {
    const transaction = await roles.sequelize.transaction();

    if (table_name && !allowedTables.includes(table_name)) {
      throw new Error(
        "O nome da entidade inválido (indique se é: regulador ou Sistema de Abastecimento)"
      );
    }
    // const modelo = allowedTables[table_name];
    // const entity = await modelo.findByPk(table_id);
    // if (!entity) {
    //   throw new Error("entidade indicada não existe");
    // }

    if (!RoleName || RoleName.length < 3) {
      throw new Error("Nome da role deve ter pelo menos 3 caracteres");
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
      throw new Error(`Role '${RoleName}' já existe`);
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
        table_id: table_id,
      },
      { transaction }
    );
    await role.addPermissions(uniqueIds, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Permissões processadas com sucesso",
      data: role,
    });
  } catch (error) {
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
  try {
    const [updated] = await roles.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res
        .status(404)
        .json({ error: "grupo de permissão não encontrado" });
    }
    const updatedrole = await roles.findByPk(req.params.id);
    res.json(updatedrole);
  } catch (error) {
    res.status(400).json({ error: "Falha ao actualizar" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Listar todos os rolees
exports.findAll = async (req, res) => {
  try {
    const allrole = await roles.findAll({
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

    res.status(200).json({
      success: true,
      message: "Grupo de permissões processados com sucesso",
      data: allrole,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "erro ao listar todos os grupo de permissão" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um role por ID
exports.findOne = async (req, res) => {
  try {
    const role = await roles.findByPk(req.params.id);
    if (!role) {
      return res
        .status(404)
        .json({ error: "grupo de permissão não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Grupo de permissões encontrado",
      data: role,
    });
  } catch (error) {
    res.status(500).json({ error: "erro buscar um grupo de permissão " });

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
        .json({ success: false, error: "grupo de permissão não encontrado" });
    }
    res.status(204).json("grupo de permissão removido com sucesso");
  } catch (error) {
    res.status(500).json({ success: false, error: "erro ao remover grupo" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
