const { roles: roles } = require("../models");
const { Op } = require("sequelize");
exports.create = async (req, res) => {
  try {
    const role = await roles.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar grupo de permissão" });
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
    const allrole = await role.findAll();

    res.json(allrole);
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
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um grupo de permissão por ID" });

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
        .json({ error: "grupo de permissão não encontrado" });
    }
    res.status(204).json("grupo de permissão removido com sucesso");
  } catch (error) {
    res.status(500).json({ error: error.message });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
