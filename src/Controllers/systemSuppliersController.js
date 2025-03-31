const { system_suppliers: system_suppliers } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

exports.create = async (req, res) => {
  try {
    const requiredFields = ["name", "district_id", "operator_id", "account_id"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ error: `O campo ${field} é obrigatório.` });
      }
    }
    const system_supplier = await system_suppliers.create(req.body);
    res.status(201).json(system_supplier);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar Sistema de abastecimento" });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await system_suppliers.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res
        .status(404)
        .json({ error: "Sistema de abastecimento não encontrado" });
    }
    const updatedsystem_supplier = await system_suppliers.findByPk(
      req.params.id
    );
    res.json(updatedsystem_supplier);
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

// Listar todos os reguladores
exports.findAll = async (req, res) => {
  try {
    const allsystem_suppliers = await system_suppliers.findAll();

    res.json(allsystem_suppliers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "erro ao listar todos os sistema de abastecimento" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um regulador por ID
exports.findOne = async (req, res) => {
  try {
    const system_supplier = await system_suppliers.findByPk(req.params.id);
    if (!system_supplier) {
      return res
        .status(404)
        .json({ error: "Sistema de abastecimento não encontrado" });
    }
    res.json(system_supplier);
  } catch (error) {
    res
      .status(500)
      .json({ error: "erro buscar um sistema de abastecimento por ID" });

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
    const deleted = await system_suppliers.destroy({
      where: { id: req.params.id },
    });
    if (deleted === 0) {
      return res
        .status(404)
        .json({ error: "Sistema de abastecimento não encontrado" });
    }
    res.status(204).json("Sistema de abastecimento removido com sucesso");
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
