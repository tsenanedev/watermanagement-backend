const { operators: operators } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

exports.create = async (req, res) => {
  try {
    const operator = await operators.create(req.body);
    res.status(201).json(operator);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar Operator" });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await operators.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Operator não encontrado" });
    }
    const updatedOperator = await operators.findByPk(req.params.id);
    res.json(updatedOperator);
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

// Listar todos os Operatores
exports.findAll = async (req, res) => {
  try {
    const alloperator = await operators.findAll({
      include: [
        {
          association: "system_suppliers", // Associação definida em operators.js
          include: [
            {
              association: "districts", // Associação definida em system_suppliers.js
              attributes: ["id", "name"], // Campos específicos de districts
            },
          ],
          attributes: ["id", "name", "createdAt"], // Campos de system_suppliers
        },
      ],
    });

    res.json(alloperator);
  } catch (error) {
    res.status(500).json({ error: "erro ao listar todos os Operatores" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um Operator por ID
exports.findOne = async (req, res) => {
  try {
    const operator = await operators.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).json({ error: "Operator não encontrado" });
    }
    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um Operator por ID" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql, // Query SQL (se existir)
      parameters: error.parameters, // Parâmetros (se existirem)
      timestamp: new Date(),
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const deleted = await operators.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Operator não encontrado" });
    }
    res.status(204).json("Operator removido com sucesso");
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
