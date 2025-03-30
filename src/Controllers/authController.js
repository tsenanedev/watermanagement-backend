const { users: Users } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
db = require("../models");

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
        include: "roles",
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
            companyId: user.companyId,
          };

          // Gerar o token JWT
          let token = jwt.sign({ uid: response.uid }, SECRET_KEY, {
            expiresIn: "1h",
          });

          // Retornar resposta com sucesso e o token
          return res.status(200).json({
            success: true,
            user,
            token,
          });
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "O E-mail ou Celular que digitou não encontra-se registado.",
        });
      }
    } catch (err) {
      console.error(err);
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
            .catch((err) => {
              res
                .status(500)
                .send(JSON.stringify({ success: false, message: err.message }));
            });
        });
      })
      .catch((err) => {
        res
          .status(500)
          .send(JSON.stringify({ success: false, message: err.message }));
      });
    // req.getConnection(function (err, conn) {
    //   if (err) {
    //     res.status(500).send(JSON.stringify({ success: false, message: err }));
    //   } else {
    //     bcrypt.hash(code, 10, (errBcrypt, hash) => {
    //       if (errBcrypt) {
    //         res.status(500);
    //         res.send(JSON.stringify({ success: false, message: errBcrypt }));
    //       } else {
    //         conn.query(
    //           "UPDATE users SET code=?, password=? WHERE id=?",
    //           [code, hash, id],
    //           function (err, rows, fields) {
    //             if (err) {
    //               res.status(500);
    //               res.send(
    //                 JSON.stringify({ success: false, message: err.message })
    //               );
    //             } else {
    //               if (rows.affectedRows > 0) {
    //                 res.send(
    //                   JSON.stringify({
    //                     success: true,
    //                     message: "Senha actualizada com sucesso",
    //                   })
    //                 );
    //               }
    //             }
    //           }
    //         );
    //       }
    //     });
    //   }
    // });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid userId" }));
  }
}

module.exports = {
  login,
  updatePassword,
};
