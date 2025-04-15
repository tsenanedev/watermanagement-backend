const { customers, meters } = require("../models");
const ResponseHandler = require("./baseController");
class CustomerController {
  static async index(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const offset = (page - 1) * perPage;

      const { count, rows } = await customers
        .scope({ method: ["tenant", req.tenant_id] })
        .findAndCountAll({
          include: [{ association: "meters" }],
          limit: parseInt(perPage),
          offset: offset,
        });

      return res.status(200).json({
        success: true,
        total: count,
        page: parseInt(page),
        perPage: parseInt(perPage),
        data: rows,
      });
    } catch (error) {
      return ResponseHandler.handleError(error, res);
    }
  }

  // Obter um cliente por ID
  static async show(req, res) {
    try {
      const customer = await customers
        .scope({ method: ["tenant", req.tenant_id] })
        .findByPk(req.params.id, {
          include: [{ model: meters, as: "meters" }],
        });

      if (!customer) {
        return ResponseHandler.notFound(res, "Cliente");
      }

      return res.status(200).json(customer);
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "erro ao buscar dados do cliente"
      );
    }
  }

  // Criar novo cliente
  static async create(req, res) {
    try {
      const allowedFields = {
        name: req.body.name,
        telephone: req.body.telephone,
        email: req.body.email,
        meter_id: req.body.meter_id,
        nuit: req.body.nuit,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status,
        whatsap: req.body.whatsap,
        tenant_id: req.tenant_id,
      };

      const newCustomer = await customers.create(allowedFields);

      return res.status(201).json(newCustomer);
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao cadastrar cliente"
      );
    }
  }

  // Atualizar cliente
  static async update(req, res) {
    try {
      const customer = await customers
        .scope({ method: ["tenant", req.tenant_id] })
        .findByPk(req.params.id);
      if (!customer) {
        return ResponseHandler.notFound(res, "Cliente");
      }

      const allowedFields = {
        name: req.body.name,
        telephone: req.body.telephone,
        email: req.body.email,
        meter_id: req.body.meter_id,
        nuit: req.body.nuit,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status,
        whatsap: req.body.whatsap,
        tenant_id: req.tenant_id,
      };

      await customer.update(allowedFields);
      ResponseHandler.success(res, await customers.findByPk(req.params.id));
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao actualizar cliente"
      );
    }
  }

  // Deletar cliente
  static async delete(req, res) {
    try {
      const customer = await customers
        .scope({ method: ["tenant", req.tenant_id] })
        .findByPk(req.params.id);
      if (!customer) {
        return ResponseHandler.notFound(res, "Cliente");
      }

      await customer.destroy();
      return res.status(200).json({ message: `Cliente deletado com sucesso` });
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao eliminar cliente"
      );
    }
  }
}

module.exports = CustomerController;
