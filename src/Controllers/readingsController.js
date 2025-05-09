const ResponseHandler = require("../utils/ResponseHandler");
const { readings, meters } = require("../models");
const { Op } = require("sequelize");

class readingsController {
  static async index(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const offset = (page - 1) * perPage;

      const { count, rows } = await readings
        .scope({ method: ["tenant", req.tenant_id] })
        .findAndCountAll({
          include: [{ association: "meter" }],
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
  static async create(req, res) {
    const transaction = await readings.sequelize.transaction();
    try {
      const { current, staffName, meter_id, photo_url } = req.body;

      const userId = req.user.id;

      // Buscar último registro válido
      const lastReading = await readings.findOne({
        where: { meter_id, status: "approved" },
        order: [["createdAt", "DESC"]],
        transaction,
      });

      // Validar leitura atual
      if (lastReading && current < lastReading.current) {
        throw new Error(
          `Leitura atual (${current}) menor que a anterior (${lastReading.current})`
        );
      }

      // Calcular consumo
      const consumption = lastReading ? current - lastReading.current : current;

      const newReading = await readings.create(
        {
          current,
          consumption,
          last: lastReading?.current || 0,
          meter_id,
          photo_url,
          reading_date: new Date(),
          status: "pending",
          staffName: staffName,
          createdby_id: userId,
        },
        { transaction }
      );

      await transaction.commit();
      return ResponseHandler.success(res, newReading);
    } catch (error) {
      await transaction.rollback();
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao inserir nova leitura"
      );
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, forfeit } = req.body;

      const reading = await readings.findByPk(id);
      if (!reading) return ResponseHandler.notFound("Leitura");

      const updates = {
        status,
        updatedby_id: req.user.id,
      };

      if (forfeit !== undefined) {
        updates.forfeit = forfeit;
      }
      const validStatusTransitions = {
        pending: ["approved", "rejected"], // Estados permitidos a partir de pending
        approved: ["billed"], // Permite transição para billed após aprovação
        rejected: ["pending"],
        billed: [], // Não permite nenhuma alteração após faturação
      };

      if (!validStatusTransitions[reading.status].includes(status)) {
        console.log(status);
        return ResponseHandler.badRequest(
          res,
          `Não é possível realizar a transição do estado ${reading.status} para ${status}`
        );
      }

      await reading.update(updates);
      return ResponseHandler.success(res, reading);
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "Erro ao atualizar o estado da leitura"
      );
    }
  }

  static async getReadings(req, res) {
    try {
      const { page = 1, perPage = 10, startDate, endDate, status } = req.query;
      const offset = (page - 1) * perPage;

      const where = {
        reading_date: {
          [Op.between]: [startDate || "1970-01-01", endDate || new Date()],
        },
      };

      if (status) where.status = status;

      const { count, rows } = await readings
        .scope({ method: ["tenant", req.tenant_id] })
        .findAndCountAll({
          where,
          include: [
            { association: "createdBy", attributes: ["id", "name"] },
            { association: "meter", attributes: ["id", "number"] },
          ],
          limit: parseInt(perPage),
          offset: offset,
          distinct: true,
        });

      return res.status(200).json({
        success: true,
        total: count,
        page: parseInt(page),
        perPage: parseInt(perPage),
        data: rows,
      });
    } catch (error) {
      return ResponseHandler.handleError(error, res, "Erro ao listar");
    }
  }
}

module.exports = readingsController;
