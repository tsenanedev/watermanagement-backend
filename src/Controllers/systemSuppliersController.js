const {
  system_suppliers,
  contact_persons,
  districts,
  operators,
} = require("../models");

const ResponseHandler = require("../utils/ResponseHandler");

class systemSuppliersController {
  static async index(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const offset = (page - 1) * perPage;

      const { count, rows } = await system_suppliers.findAndCountAll({
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
      return ResponseHandler.handleError(
        error,
        res,
        "erro ao listar todos os sistema de abastecimento"
      );
    }
  }
  static async create(req, res) {
    const transaction = await system_suppliers.sequelize.transaction();
    try {
      const { name, person_name, person_email, person_phone } = req.body;

      const system_supplier = await system_suppliers.create(
        req.body,
        {
          include: [
            {
              association: "contact_persons",
              required: false,
              attributes: ["id", "name", "phone_number", "email"],
            },
          ],
        },
        { transaction }
      );
      if (system_supplier) {
        if (person_name) {
          await contact_persons.create(
            {
              name: person_name,
              email: person_email,
              phone_number: person_phone,
              table_name: "system_suppliers",
              table_id: system_supplier.id,
            },
            { transaction }
          );
        }
      }
      await system_supplier.reload({ transaction });
      await transaction.commit();
      return res.status(201).json(system_supplier);
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "Falha ao criar Sistema de abastecimento"
      );
    }
  }
  static async bulkCreate(req, res) {
    const transaction = await contact_persons.sequelize.transaction();
    try {
      const dataArray = req.body;

      if (!Array.isArray(dataArray)) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "O corpo da requisição deve ser um array." });
      }

      // Verifica se todos os itens possuem operator e district
      const hasMissingFields = dataArray.some(
        (item) => !item.operator || !item.district
      );
      if (hasMissingFields) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Cada item deve incluir 'operador' e 'districto'." });
      }

      // Extrai nomes únicos
      const operatorNames = [
        ...new Set(dataArray.map((item) => item.operator)),
      ];
      const districtNames = [
        ...new Set(dataArray.map((item) => item.district)),
      ];

      // Busca operadores e distritos
      const findOperators = await operators.findAll({
        where: { name: operatorNames },
        attributes: ["id", "name"],
        transaction,
      });

      const findDistricts = await districts.findAll({
        where: { name: districtNames },
        attributes: ["id", "name"],
        transaction,
      });

      // Verifica nomes não encontrados
      const missingOperators = operatorNames.filter(
        (name) => !findOperators.some((op) => op.name === name)
      );
      if (missingOperators.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Operadores não encontrados: ${missingOperators.join(", ")}`,
        });
      }

      const missingDistricts = districtNames.filter(
        (name) => !findDistricts.some((d) => d.name === name)
      );
      if (missingDistricts.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Distritos não encontrados: ${missingDistricts.join(", ")}`,
        });
      }

      // Cria mapas de nome para ID
      const operatorMap = new Map(findOperators.map((op) => [op.name, op.id]));
      const districtMap = new Map(findDistricts.map((d) => [d.name, d.id]));

      // Processa os dados substituindo nomes por IDs
      const processedData = dataArray.map((item) => {
        const { operator, district, ...rest } = item;
        return {
          ...rest,
          operator_id: operatorMap.get(operator),
          district_id: districtMap.get(district),
        };
      });

      // Extrai dados para system_suppliers
      const systemSuppliersData = processedData.map((item) => {
        const { person_name, person_email, person_phone, ...supplierData } =
          item;
        return supplierData;
      });

      // Cria system_suppliers
      const createdSystemSuppliers = await system_suppliers.bulkCreate(
        systemSuppliersData,
        { transaction, returning: true }
      );

      // Prepara contact_persons
      const contactPersonsData = [];
      dataArray.forEach((item, index) => {
        const { person_name, person_email, person_phone } = item;
        if (person_name) {
          contactPersonsData.push({
            name: person_name,
            email: person_email,
            phone_number: person_phone,
            table_name: "system_suppliers",
            table_id: createdSystemSuppliers[index].id,
          });
        }
      });

      if (contactPersonsData.length > 0) {
        await contact_persons.bulkCreate(contactPersonsData, {
          transaction,
        });
      }

      // Busca os registros criados com seus contatos
      const supplierIds = createdSystemSuppliers.map((s) => s.id);
      const suppliersWithContacts = await system_suppliers.findAll({
        where: { id: supplierIds },
        include: [{ association: "contact_persons", as: "contact_persons" }],
        transaction,
      });

      await transaction.commit();
      return res.status(201).json(suppliersWithContacts);
    } catch (error) {
      await transaction.rollback();
      return ResponseHandler.handleError(
        error,
        res,
        "Falha ao criar sistemas de abastecimento em massa"
      );
    }
  }

  static async update(req, res) {
    const { person_name, person_email, person_phone } = req.body;
    const transaction = await system_suppliers.sequelize.transaction();
    try {
      const system_supplier = await system_suppliers.findOne({
        where: { id: req.params.id },
        include: [
          {
            association: "contact_persons",
            required: false,
            attributes: ["id", "name", "phone_number", "email"],
          },
        ],
        transaction,
      });

      if (!system_supplier) {
        return ResponseHandler.notFound(res, "Sistema de Abastecimento");
      }

      await system_supplier.update(req.body, { transaction });

      if (person_name) {
        const contactPerson = system_supplier.contact_persons[0];

        if (contactPerson) {
          await contactPerson.update(
            {
              name: person_name,
              email: person_email,
              phone_number: person_phone,
            },
            { transaction }
          );
        } else {
          await contact_persons.create(
            {
              name: person_name,
              email: person_email,
              phone_number: person_phone,
              table_name: "system_suppliers",
              table_id: system_supplier.id,
            },
            { transaction }
          );
        }
      }
      await system_supplier.reload({ transaction });
      await transaction.commit();
      return res.json(system_supplier);
    } catch (error) {
      return ResponseHandler.handleError(error, res, "Falha ao actualizar");
    }
  }

  static async show(req, res) {
    try {
      const system_supplier = await system_suppliers.findByPk(req.params.id);
      if (!system_supplier) {
        return ResponseHandler.notFound(res, "Sistema de Abastecimento");
      }
      res.json(system_supplier);
    } catch (error) {
      return ResponseHandler.handleError(
        error,
        res,
        "erro buscar um sistema de abastecimento"
      );
    }
  }
  static async delete(req, res) {
    try {
      const deleted = await system_suppliers.destroy({
        where: { id: req.params.id },
      });
      if (deleted === 0) {
        return ResponseHandler.notFound(res, "Sistema de Abastecimento");
      }
      return ResponseHandler.success(
        res,
        null,
        "Sistema de abastecimento removido com sucesso"
      );
    } catch (error) {
      return ResponseHandler.handleError(error, res);
    }
  }
}
module.exports = systemSuppliersController;
