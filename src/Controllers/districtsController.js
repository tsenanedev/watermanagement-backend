const { districts: districts } = require("../models");

exports.create = async (req, res) => {
  try {
    const district = await districts.create(req.body);
    res.status(201).json(district);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar Distrito" });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await districts.update(req.body, {
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Distrito não encontrado" });
    }
    const updateddistrict = await districts.findByPk(req.params.id);
    res.json(updateddistrict);
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

// Listar todos os districtes
exports.findAll = async (req, res) => {
  try {
    const alldistrict = await districts.findAll({
      // where: { id: req.params.province_id },
      // where: { province_id: req.params.province_id },
    });

    res.json(alldistrict);
  } catch (error) {
    res.status(500).json({ error: "erro ao listar todos os Distrito" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um district por ID
exports.findOne = async (req, res) => {
  try {
    const district = await districts.findByPk(req.params.id);
    if (!district) {
      return res.status(404).json({ error: "Distrito não encontrado" });
    }
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um Distrito por ID" });

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
    const deleted = await districts.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Distrito não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Distrito removido com sucesso",
      data: null,
    });
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
