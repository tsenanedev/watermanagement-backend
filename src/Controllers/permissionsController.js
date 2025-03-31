const fs = require("fs");
const path = require("path");

// Definir controladores e métodos a serem ignorados
const ignoredControllers = ["auth", "permissions"]; // Controladores a ignorar

const ignoredMethods = [
  // "provinces-create", // Métodos específicos a ignorar
];
const ignoredGlobalMethods = [""]; // Métodos globais a ignorar
exports.listar = (req, res) => {
  res.status(200).json(loadControllerMethods());
};
loadControllerMethods = () => {
  const controllersPath = path.join(__dirname, "..", "controllers");
  const controllers = fs.readdirSync(controllersPath); // Ler arquivos na pasta controllers
  const methodMap = []; // Mapeamento de controladores e métodos

  controllers.forEach((controllerFile) => {
    const controllerName = controllerFile.replace("Controller.js", ""); // Nome do controlador sem sufixo 'Controller'

    // Ignorar controladores especificados
    if (ignoredControllers.includes(controllerName.toLowerCase())) return;

    const controller = require(path.join(controllersPath, controllerFile));

    // Processar métodos do controlador
    Object.keys(controller).forEach((methodName) => {
      // Ignorar métodos específicos ou globais
      if (
        ignoredMethods.includes(`${controllerName}-${methodName}`) ||
        ignoredGlobalMethods.includes(methodName)
      )
        return;

      // Adicionar ao mapeamento
      // methodMap = methodMap || [];
      methodMap.push(`${controllerName}-${methodName}`);
    });
  });
  return methodMap;
  bulkImportPermissions(methodMap);
};

async function bulkImportPermissions() {
  const permissionsData = loadControllerMethods();
  try {
    // Usando bulkCreate para importar permissões em volume e ignorar duplicatas
    const result = await permissions.bulkCreate(permissionsData, {
      ignoreDuplicates: true, // Ignora as permissões que já existem com base em chaves únicas
    });

    console.log("Permissões importadas com sucesso!");
    return result;
  } catch (error) {
    console.error("Erro ao importar permissões:", error);
  }
}
