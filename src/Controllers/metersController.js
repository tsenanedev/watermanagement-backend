const { meters: meters } = require("../models");

exports.create = async (req, res) => {
  try {
    req.body.tenant = req.tenant;
    const meter = await meters.create(req.body);

    res.status(200).json({
      success: true,
      message: "Contador registado com sucesso",
      data: meter,
    });
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar Contador" });
  }
};

exports.update = async (req, res) => {
  try {
    req.body.tenant = req.tenant;
    const [updated] = await meters.update(req.body, {
      where: { id: req.params.id },
      validate: true,
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Contador não encontrado" });
    }
    const updatedmeter = await meters.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      message: "Contador actualizado com sucesso",
      data: updatedmeter,
    });
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

// Listar todos os meteres
exports.findAll = async (req, res) => {
  try {
    const allmeter = await meters
      .scope({ method: ["tenant", req.tenant] })
      .findAll({
        order: [["createdAt", "ASC"]],
      });

    res.json(allmeter);
  } catch (error) {
    console.log(process.env.DB_DIALECT);
    res.status(500).json({ error: "Erro ao listar todos os Contador" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um meter por ID
exports.findOne = async (req, res) => {
  try {
    const meter = await meters.findByPk(req.params.id);
    if (!meter) {
      return res.status(404).json({ error: "Contador não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Contador processado com sucesso",
      data: meter,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar contador por ID" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const deleted = await meters.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Meter não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Contador removido com sucesso",
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
