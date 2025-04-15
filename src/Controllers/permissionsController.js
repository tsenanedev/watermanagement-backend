const fs = require("fs");
const path = require("path");
const { permissions } = require("../models");

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
const loadControllerMethods = async () => {
  const ignoredFiles = [, "utils.js", "permissionsController - Copy.js"];
  const ignoredControllers = ["auth", "base", "provinces", "districts"];
  const ignoredMethods = [
    "permissions-bulkImportPermissions",
    "permissions-loadControllerMethods",
  ];
  const ignoredGlobalMethods = ["constructor", "prototype"];

  const controllersPath = path.join(__dirname, "..", "controllers");
  const methodMap = [];

  // Usando readdirSync corretamente
  let controllerFiles;
  try {
    controllerFiles = fs.readdirSync(controllersPath);
  } catch (error) {
    console.error("Erro ao ler diretório de controllers:", error);
    return [];
  }

  controllerFiles.forEach((file) => {
    // Ignorar arquivos não .js e arquivos na lista de ignorados
    if (!file.endsWith(".js") || ignoredFiles.includes(file.toLowerCase())) {
      return;
    }
    const controllerName = path.basename(file, "Controller.js");
    if (ignoredControllers.includes(controllerName.toLowerCase())) return;

    const controller = require(path.join(controllersPath, file));
    const methods = [];

    // Extração segura para classes e objetos
    if (typeof controller === "function") {
      // Métodos estáticos
      Object.getOwnPropertyNames(controller)
        .filter((prop) => typeof controller[prop] === "function")
        .forEach((method) => methods.push(method));

      // Métodos de instância
      if (controller.prototype) {
        Object.getOwnPropertyNames(controller.prototype)
          .filter(
            (prop) =>
              prop !== "constructor" &&
              typeof controller.prototype[prop] === "function"
          )
          .forEach((method) => methods.push(method));
      }
    } else {
      // Para objetos literais
      Object.keys(controller)
        .filter((prop) => typeof controller[prop] === "function")
        .forEach((method) => methods.push(method));
    }

    methods.forEach((methodName) => {
      const fullName = `${controllerName}-${methodName}`;
      if (
        !ignoredMethods.includes(fullName) &&
        !ignoredGlobalMethods.includes(methodName)
      ) {
        methodMap.push(fullName);
      }
    });
  });

  return [...new Set(methodMap)]; // Remove duplicatas
};

// Extração de métodos genérica
const extractMethods = (controller) => {
  const methods = new Set();

  // Processa classes
  if (typeof controller === "function" && controller.prototype) {
    [
      ...Object.getOwnPropertyNames(controller),
      ...Object.getOwnPropertyNames(controller.prototype),
    ].forEach((prop) => {
      if (this.isValidMethod(controller, prop)) methods.add(prop);
    });
  }
  // Processa objetos
  else {
    Object.keys(controller).forEach((prop) => {
      if (this.isValidMethod(controller, prop)) methods.add(prop);
    });
  }

  return Array.from(methods);
};

async function bulkImportPermissions() {
  const transaction = await permissions.sequelize.transaction();
  // const permissionsData = loadControllerMethods();
  const [permissionsData, existingPermissions] = await Promise.all([
    loadControllerMethods(),
    permissions.findAll({
      attributes: ["name"],
      transaction,
      raw: true,
    }),
  ]);
  try {
    const permissionsArray = [...new Set(permissionsData)].map((name) => ({
      name,
    }));

    const existingNames = new Set(existingPermissions.map((p) => p.name));
    const newPermissions = permissionsArray.filter(
      (p) => !existingNames.has(p.name)
    );

    if (newPermissions.length > 0) {
      await permissions.bulkCreate(
        newPermissions,
        { ignoreDuplicates: true },
        transaction
      );
    }
    await transaction.commit();
    const allPermissions = await permissions.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return { Permissions: allPermissions };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
