const { provinces: provinces } = require("../models");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const province = await provinces.create(req.body);
    res.status(201).json(province);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar provincia" });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await provinces.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res.status(404).json({ error: "provincia não encontrado" });
    }
    const updatedprovince = await provinces.findByPk(req.params.id);
    res.json(updatedprovince);
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

// Listar todos os provincees
exports.findAll = async (req, res) => {
  try {
    const allprovince = await provinces.findAll();

    res.json(allprovince);
  } catch (error) {
    res.status(500).json({ error: "erro ao listar todos os provincia" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um province por ID
exports.findOne = async (req, res) => {
  try {
    const province = await provinces.findByPk(req.params.id);
    if (!province) {
      return res.status(404).json({ error: "provincia não encontrado" });
    }
    res.json(province);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um provincia por ID" });

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
    const deleted = await provinces.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "provincia não encontrado" });
    }
    res.status(204).json("provincia removido com sucesso");
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
