const fs = require("fs");
const path = require("path");
const { permissions: permissions } = require("../models");
// const sequelize = require("sequelize");
const { roles: roles } = require("../models");

exports.findAll = async (req, res) => {
  try {
    const result = await bulkImportPermissions();

    res.status(200).json({
      success: true,
      message: "Permissões processadas com sucesso",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao processar permissões",
      error: error.message,
    });
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
loadControllerMethods = () => {
  const ignoredControllers = ["auth"]; // Controladores a ignorar

  const ignoredMethods = [
    "permissions-bulkImportPermissions",
    "permissions-loadControllerMethods",
    // "provinces-create", // Métodos específicos a ignorar
  ];
  const ignoredGlobalMethods = [""]; // Métodos globais a ignorar

  const controllersPath = path.join(__dirname, "..", "controllers");
  const controllers = fs.readdirSync(controllersPath);
  const methodMap = [];

  controllers.forEach((controllerFile) => {
    const controllerName = controllerFile.replace("Controller.js", "");

    if (ignoredControllers.includes(controllerName.toLowerCase())) return;

    const controller = require(path.join(controllersPath, controllerFile));

    Object.keys(controller).forEach((methodName) => {
      if (
        ignoredMethods.includes(`${controllerName}-${methodName}`) ||
        ignoredGlobalMethods.includes(methodName)
      )
        return;

      methodMap.push(`${controllerName}-${methodName}`);
    });
  });
  return methodMap;
};

async function bulkImportPermissions() {
  const transaction = await permissions.sequelize.transaction();
  const permissionsData = loadControllerMethods();
  try {
    const permissionsArray = [...new Set(permissionsData)].map((name) => ({
      name,
    }));

    const existingPermissions = await permissions.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
      raw: true,
    });

    const existingNames = new Set(existingPermissions.map((p) => p.name));
    const newPermissions = permissionsArray.filter(
      (p) => !existingNames.has(p.name)
    );

    if (newPermissions.length > 0) {
      await permissions.bulkCreate(newPermissions, { ignoreDuplicates: true });
    }
    await transaction.commit();

    return { Permissions: existingPermissions };
    // role.addPermissions(result);
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Falha na importação`);
  }
}
