const { meters: meters } = require("../models");

exports.create = async (req, res) => {
  try {
    req.body.tenant = req.tenet_id;
    const meter = await meters.create(req.body);
    res.status(201).json(req.body);
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
    req.body.tenant = req.tenet_id;
    const [updated] = await meters.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Contador não encontrado" });
    }
    const updatedmeter = await meters.findByPk(req.params.id);
    res.json(updatedmeter);
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
      .scope({ method: ["tenant", req.tenet_id] })
      .findAll({
        order: [["createdAt", "ASC"]],
      });

    res.json(allmeter);
  } catch (error) {
    res.status(500).json({ error: "erro ao listar todos os Contador" });

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
      return res.status(404).json({ error: "meter não encontrado" });
    }
    res.json(meter);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um meter por ID" });

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
    const deleted = await meters.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "meter não encontrado" });
    }
    res.status(204).json("meter removido com sucesso");
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
