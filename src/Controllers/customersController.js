const { customers, meters } = require("../models");
const ResponseHandler = require("./baseController");
class CustomerController {
  static async index(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const offset = (page - 1) * perPage;

      const { count, rows } = await customers
        .scope({ method: ["system_supplier", req.tenant_id] })
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
  static async bindMeter(req, res) {
    const { meter: meterNumber, id: customer_id } = req.params;
    const transaction = await customers.sequelize.transaction();
    try {
      const customer = await customers
        .scope({ method: ["system_supplier", req.tenant_id] })
        .findByPk(customer_id, {
          include: [{ model: meters, as: "meters" }],
        });

      if (!customer) {
        return ResponseHandler.notFound(res, "cliente");
      }

      if (customer.meter_id !== null) {
        return res.status(400).json({
          error: `O cliente ${customer.name} já possui um contador associado.`,
        });
      }

      const meter = await meters.findOne({
        where: { number: meterNumber },
      });

      if (!meter) {
        return ResponseHandler.notFound(res, "Contador");
      }

      const existingCustomerWithMeter = await customers.findOne({
        where: { meter_id: meter.id },
      });

      if (existingCustomerWithMeter) {
        return res
          .status(400)
          .json({ error: "O contador já está associado a outro cliente." });
      }
      await Promise.all([
        customer.update({ meter_id: meter.id }, { transaction }),
        meter.update({ is_assigned: true }, { transaction }),
      ]);

      await customer.reload({ transaction });

      await transaction.commit();

      return ResponseHandler.success(res, customer);
    } catch (error) {
      await transaction.rollback();
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao associar o contador"
      );
    }
  }

  static async unbindMeter(req, res) {
    const transaction = await customers.sequelize.transaction();
    try {
      const customer = await customers
        .scope({ method: ["system_supplier", req.tenant_id] })
        .findByPk(req.params.id);

      if (!customer) {
        return ResponseHandler.notFound(res, "Cliente");
      }
      if (!customer.meter_id) {
        return ResponseHandler.badRequest(
          res,
          "Cliente não possui contador associado"
        );
      }
      const meter = await meters.findByPk(customer.meter_id, { transaction });
      if (!meter) {
        return ResponseHandler.notFound(res, "Contador");
      }
      await Promise.all([
        customer.update({ meter_id: null }, { transaction }),
        meter.update({ is_assigned: false }, { transaction }),
      ]);
      await customer.reload({ transaction });
      await transaction.commit();
      return ResponseHandler.success(
        res,
        customer,
        "Desassociação realizada com sucesso"
      );
    } catch (error) {
      await transaction.rollback();
      return ResponseHandler.handleError(
        error,
        res,
        "Falha na desassociação do contador"
      );
    }
  }
  // Obter um cliente por ID
  static async show(req, res) {
    try {
      const customer = await customers
        .scope({ method: ["system_supplier", req.tenant_id] })
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
        nuit: req.body.nuit,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status,
        whatsap: req.body.whatsap,
        system_supplier_id: req.body.system_supplier_id,
        tariff_type_id: req.tariff_type_id,
      };

      const newCustomer = await customers.create(allowedFields);
      if (req.body.meter) {
        const fakeReq = {
          ...req,
          params: {
            id: newCustomer.id,
            meter: req.body.meter,
          },
        };

        await this.bindMeter(fakeReq, res);

        if (res.headersSent) return;
      }
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
        .scope({ method: ["system_supplier", req.tenant_id] })
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
        system_supplier_id: req.body.system_supplier_id,
        tariff_type_id: req.tariff_type_id,
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
        .scope({ method: ["system_supplier", req.tenant_id] })
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
