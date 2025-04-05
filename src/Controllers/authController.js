const { users: Users } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
SECRET_KEY;

async function login(req, res) {
  const { email, password } = req.body;
  // Checks if email and password were provided
  if (email && password) {
    try {
      // Busca o usuário com base no email ou phoneNumber e com status igual a 1 (ativo)
      const user = await Users.findOne({
        where: {
          [Op.or]: [{ email: email }, { phoneNumber: email }],
          status: 1, // Verifica se o usuário está ativo
        },
        include: [
          {
            association: "roles",
            attributes: ["id", "name"],
            include: [
              {
                association: "permissions",
                required: false,
                attributes: ["id", "name"],
                through: { attributes: [] },
              },
              {
                association: "regulators",
                required: false,
                where: { "$roles.table_name$": "regulators" },
                attributes: ["id", "name"],
              },
              {
                association: "system_suppliers",
                required: false, // Não é obrigatório ter um operador
                where: { "$roles.table_name$": "system_suppliers" }, // Filtro para operadores
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (user) {
        // Comparar a senha fornecida com a senha armazenada
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            return res.status(400).json({
              success: false,
              message: "A senha que digitou está incorreta.",
            });
          }

          // Se a senha for válida, gerar o token
          const response = {
            id: user.id,
            name: user.name,
            code: user.code,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            branchId: user.branchId,
            uid: user.uid,
            role: user.roles,
            createdAt: user.createdAt,
          };

          // Gerar o token JWT
          let token = jwt.sign(response, SECRET_KEY, {
            expiresIn: "1h",
          });

          // Retornar resposta com sucesso e o token
          return res.status(200).json({
            success: true,
            response,
            token,
          });
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "O E-mail ou Celular que digitou não encontra-se registado.",
        });
      }
    } catch (error) {
      logger.error({
        message:
          error.errors?.map((e) => e.message).join(" | ") || error.message,
        stack: error.stack,
        sql: error.sql,
        parameters: error.parameters,
        timestamp: new Date(),
      });
      return res.status(500).json({
        success: false,
        message: "Erro no servidor.",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid E-mail or Password",
    });
  }
}

async function updatePassword(req, res) {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const uid = decoded.uid;
  const id = req.body.id;
  const email = req.body.email;

  if (uid && email && id) {
    Users.findByPk(id)
      .then((user) => {
        if (!user) {
          return res.status(404).send(
            JSON.stringify({
              success: false,
              message: "Usuário não encontrado",
            })
          );
        }

        // Criptografando a senha
        bcrypt.hash(code, 10, (errBcrypt, hash) => {
          if (errBcrypt) {
            return res
              .status(500)
              .send(JSON.stringify({ success: false, message: errBcrypt }));
          }

          // Actualizando o usuário
          user
            .update({
              password: hash,
            })
            .then(() => {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Senha actualizada com sucesso",
                })
              );
            })
            .catch((error) => {
              res.status(500).send(
                JSON.stringify({
                  success: false,
                  message: "Erro no servidor.",
                })
              );
            });
          logger.error({
            message:
              error.errors?.map((e) => e.message).join(" | ") || error.message,
            stack: error.stack,
            sql: error.sql, // Query SQL (se existir)
            parameters: error.parameters, // Parâmetros (se existirem)
            timestamp: new Date(),
          });
        });
      })
      .catch((err) => {
        res
          .status(500)
          .send(JSON.stringify({ success: false, message: err.message }));
      });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid userId" }));
  }
}

async function checkToken(req, res) {
  var authorization = req.headers.authorization,
    decoded;

  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send({ success: false, message: e });
  }
  const uid = decoded.uid;

  res.send(JSON.stringify({ success: true, message: uid }));
}

module.exports = {
  login,
  updatePassword,
  checkToken,
};
