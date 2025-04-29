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
  static async internalBindMeter(
    meterNumber,
    customer_id,
    tenant_id,
    transaction
  ) {
    try {
      const customer = await customers
        .scope({ method: ["system_supplier", tenant_id] })
        .findByPk(customer_id, {
          include: [{ model: meters, as: "meters" }],
          transaction,
        });
      if (!customer) {
        throw new Error("cliente não encontrado " + customer_id);
      }

      if (customer.meter_id !== null) {
        throw new Error(
          `O cliente ${customer.name} já possui um contador associado.`
        );
      }

      const meter = await meters.findOne(
        {
          where: { number: meterNumber },
        },
        transaction
      );

      if (!meter) {
        throw new Error("Contador não encontrado");
      }

      const existingCustomerWithMeter = await customers.findOne(
        {
          where: { meter_id: meter.id },
        },
        transaction
      );

      if (existingCustomerWithMeter) {
        throw new Error("O contador já está associado a outro cliente.");
      }
      await Promise.all([
        customer.update({ meter_id: meter.id }, { transaction }),
        meter.update({ is_assigned: true }, { transaction }),
      ]);

      await customer.reload({ transaction });

      // await transaction.commit();

      return customer;
    } catch (error) {
      // await transaction.rollback();
      throw error;
    }
  }
  static async bindMeter(req, res) {
    const { meter, id } = req.params;
    const transaction = await customers.sequelize.transaction();
    try {
      result = await CustomerController.internalBindMeter(
        req.body.meter,
        id,
        req.tenant_id,
        transaction
      );

      await transaction.commit();
      return ResponseHandler.success(
        res,
        result,
        "Contador associado com sucesso"
      );
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
    const transaction = await customers.sequelize.transaction();
    try {
      const allowedFields = {
        name: req.body.name,
        telephone: req.body.telephone,
        email: req.body.email,
        nuit: req.body.nuit,
        gender: req.body.gender,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status,
        whatsap: req.body.whatsap,
        neighbourhood_id: req.body.neighbourhood_id,
        system_supplier_id: req.body.system_supplier_id,
        tariff_type_id: req.body.tariff_type_id,
      };

      const newCustomer = await customers.create(allowedFields, {
        transaction,
      });
      if (req.body.meter) {
        await CustomerController.internalBindMeter(
          req.body.meter,
          newCustomer.id,
          req.tenant_id,
          transaction
        );
      }
      await newCustomer.reload({ transaction });
      await transaction.commit();

      return ResponseHandler.success(res, newCustomer);
    } catch (error) {
      await transaction.rollback();
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
        gender: req.body.gender,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status,
        whatsap: req.body.whatsap,
        neighbourhood_id: req.body.neighbourhood_id,
        system_supplier_id: req.body.system_supplier_id,
        tariff_type_id: req.tariff_type_id,
      };

      await customer.update(allowedFields);
      return ResponseHandler.success(
        res,
        await customers.findByPk(req.params.id)
      );
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
