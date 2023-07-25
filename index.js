const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");

app.use(cors());
app.use(express.json());
const db = mysql.createPool({
  user: "admin",
  host: "proyecto-integrador.cqnwbmshskv1.us-east-1.rds.amazonaws.com",
  password: "miranda1",
  database: "mt",
  insecureAuth: true,
});

app.post("/registro", (req, res) => {
  console.log(req.body);
  const nombre = req.body.nombre;
  const apellidop = req.body.apellidop;
  const apellidom = req.body.apellidom;
  const escuela = req.body.escuela;
  const grado = req.body.grado;
  const grupo = req.body.grupo;
  const toga = req.body.toga;
  const infantil = req.body.infantil;
  const filtro = req.body.filtro;
  const fecha = req.body.fecha;
  const modelo = req.body.modelo;
  const tipo = req.body.tipo;
  const medida = req.body.medida;
  const color = req.body.color;
  const acabado = req.body.acabado;
  const estatus = "Solicitado";
  const observaciones = req.body.observaciones;
  const tutor = req.body.tutor;
  const apellidoptutor = req.body.apellidoptutor;
  const apellidomtutor = req.body.apellidomtutor;
  const telefono = req.body.telefono;
  const anticipo = req.body.anticipo;
  const costo = req.body.costo;
  const restante = req.body.restante;

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error en el servidor");
    } else {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error en el servidor");
        } else {
          connection.query(
            "INSERT INTO tutor (nombre_tutor, apellido1_tutor, apellido2_tutor, telefono) VALUES (?,?,?,?)",
            [tutor, apellidoptutor, apellidomtutor, telefono],
            (err, result) => {
              if (err) {
                connection.rollback(() => {
                  console.log(err);
                  res.status(500).send("Error en el servidor");
                });
              } else {
                const tutorId = result.insertId;

                connection.query(
                  "INSERT INTO pedido (medida, acabado, tipo, color, modelo, filtro, observaciones, fecha, estatus) VALUES (?,?,?,?,?,?,?,?,?)",
                  [
                    medida,
                    acabado,
                    tipo,
                    color,
                    modelo,
                    filtro,
                    observaciones,
                    fecha,
                    estatus,
                  ],
                  (err, result) => {
                    if (err) {
                      connection.rollback(() => {
                        console.log(err);
                        res.status(500).send("Error en el servidor");
                      });
                    } else {
                      const pedidoId = result.insertId;

                      connection.query(
                        "INSERT INTO estudiante (nombre_estudiante, apellido1_estudiante, apellido2_estudiante, escuela, grado, grupo, toga, infantil, id_tutor) VALUES (?,?,?,?,?,?,?,?,?)",
                        [
                          nombre,
                          apellidop,
                          apellidom,
                          escuela,
                          grado,
                          grupo,
                          toga,
                          infantil,
                          tutorId,
                        ],
                        (err, result) => {
                          if (err) {
                            connection.rollback(() => {
                              console.log(err);
                              res.status(500).send("Error en el servidor");
                            });
                          } else {
                            const estudianteId = result.insertId;

                            connection.query(
                              "INSERT INTO ingresos (costo, anticipo, restante, id_pedido) VALUES (?,?,?,?)",
                              [costo, anticipo, restante, pedidoId],
                              (err, result) => {
                                if (err) {
                                  connection.rollback(() => {
                                    console.log(err);
                                    res
                                      .status(500)
                                      .send("Error en el servidor");
                                  });
                                } else {
                                  const ingresosId = result.insertId;

                                  connection.query(
                                    "INSERT INTO estudiantepedidorelacion (id_pedido, id_estudiante) VALUES (?, ?)",
                                    [pedidoId, estudianteId],
                                    (err, result) => {
                                      if (err) {
                                        connection.rollback(() => {
                                          console.log(err);
                                          res
                                            .status(500)
                                            .send("Error en el servidor");
                                        });
                                      } else {
                                        connection.commit((err) => {
                                          if (err) {
                                            connection.rollback(() => {
                                              console.log(err);
                                              res
                                                .status(500)
                                                .send("Error en el servidor");
                                            });
                                          } else {
                                            res.send(
                                              "Datos guardados correctamente"
                                            );
                                          }
                                        });
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
    connection.release();
  });
});

app.get("/tabla", (req, res) => {
  db.query(
    " select * from estudiantepedidorelacion natural join estudiante natural join pedido natural join tutor natural join ingresos;",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/abono", (req, res) => {
  db.query(
    "SELECT * FROM estudiantepedidorelacion natural join estudiante natural join ingresos natural join pedido natural join tutor",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.put("/pedido", (req, res) => {
  const modifiedData = req.body;

  const updatePromises = modifiedData.map((rowData) => {
    const id_pedido = rowData.id_pedido;
    const estatus = rowData.estatus;

    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE pedido SET estatus = ? WHERE id_pedido = ?",
        [estatus, id_pedido],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      res.send("Estados actualizados correctamente");
    })
    .catch((error) => {
      console.error("Error al actualizar los estados:", error);
      res.status(500).send("Error al actualizar los estados");
    });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const usuario = req.body.usuario;
  const contra = req.body.contra;

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error en el servidor");
    } else {
      connection.query(
        "SELECT * FROM usuarios WHERE usuario = ?",
        [usuario],
        (err, results) => {
          connection.release(); // Liberar la conexión

          if (err) {
            console.log(err);
            res.status(500).send("Error en el servidor");
          } else {
            if (!usuario || !contra) {
              res.status(401).send("No deje campos vacíos");
            } else {
              if (results.length > 0) {
                const storedPassword = results[0].contra;
                if (contra === storedPassword) {
                  console.log("Contraseña correcta");
                  res.status(200).send("Inicio de sesión exitoso");
                } else {
                  res
                    .status(401)
                    .send("Nombre de usuario o contraseña incorrectos");
                }
              } else {
                res
                  .status(401)
                  .send("Nombre de usuario o contraseña incorrectos");
              }
            }
          }
        }
      );
    }
  });
});

app.put("/actualizar", (req, res) => {
  const {
    id_estudiante,
    nombre_estudiante,
    apellido1_estudiante,
    apellido2_estudiante,
    escuela,
    grado,
    grupo,
  } = req.body;

  db.query(
    "UPDATE estudiante SET nombre_estudiante = ?, apellido1_estudiante = ?, apellido2_estudiante = ?, escuela = ?, grado = ?, grupo = ? WHERE id_estudiante = ?",
    [
      nombre_estudiante,
      apellido1_estudiante,
      apellido2_estudiante,
      escuela,
      grado,
      grupo,
      id_estudiante,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar los datos del estudiante:", err);
        res.status(500).send("Error al actualizar los datos del estudiante");
      } else {
        console.log("Datos del estudiante actualizados correctamente:", result);
        res.send("Datos del estudiante actualizados correctamente");
      }
    }
  );
});

app.post("/pago/:id", (req, res) => {
  const clienteId = req.params.id;
  const abono = req.body.abono;

  db.query(
    "SELECT * from estudiantepedidorelacion natural join estudiante natural join pedido natural join ingresos WHERE id_estudiante = ?",
    [clienteId],
    (err, result) => {
      if (err) {
        console.error("Error al obtener el cliente:", err);
        res.status(500).send("Error al obtener el cliente");
      } else {
        const cliente = result[0];

        if (!cliente) {
          res.status(404).send("Cliente no encontrado");
          return;
        }

        const restante = cliente.restante - abono;
        const estatus = restante === 0 ? "Pagado" : cliente.estatus;

        db.query(
          "UPDATE estudiante natural join estudiantepedidorelacion natural join ingresos natural join pedido SET restante = ?, estatus = ? WHERE id_estudiante = ?",
          [restante, estatus, clienteId],
          (err, result) => {
            if (err) {
              console.error("Error al actualizar el cliente:", err);
              res.status(500).send("Error al actualizar el cliente");
            } else {
              res.send("Abono registrado con éxito");
            }
          }
        );
      }
    }
  );
});

app.get("/conteoCuadros", (req, res) => {
  const { escuela, grado, grupo } = req.query;

  db.query(
    "SELECT modelo, medida, COUNT(*) AS cantidad  FROM pedido  NATURAL JOIN estudiantepedidorelacion NATURAL JOIN estudiante WHERE escuela = ? AND grado = ? AND grupo = ? GROUP BY modelo, medida",
    [escuela, grado, grupo],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al obtener la información");
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.post("/agregarEvento", (req, res) => {
  const title = req.body.title;
  const start = req.body.start;
  const end = req.body.end;
  const color = req.body.color;
  db.query(
    "insert into calendario(title,start,end,color) values (?,?,?,?)",
    [title, start, end, color],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Evento agregado");
      }
    }
  );
});

app.get("/eventos", (req, res) => {
  db.query("SELECT * FROM calendario", (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results);
  });
});

app.delete("/eventosEliminar", (req, res) => {
  const title = req.body.title;
  db.query(
    "DELETE FROM calendario WHERE title = ?",
    [title],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    }
  );
});

app.get("/Grafica", (req, res) => {
  db.query(
    "SELECT " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'Solicitado') as solicitado, " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'Pagado') as pagado, " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'Impreso') as impreso, " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'En proceso') as enProceso, " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'Terminado') as terminado, " +
      "(SELECT COUNT(*) FROM pedido WHERE estatus = 'Entregado') as entregado",
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al obtener la información");
      } else {
        const { solicitado, pagado, impreso, enProceso, terminado, entregado } = result[0];
        res.status(200).send({ solicitado, pagado, impreso, enProceso, terminado, entregado });
      }
    }
  );
});

app.get("/GraficaDinero", (req, res) => {
  db.query(
    "SELECT escuela, SUM(costo) as costo_total, SUM(costo - restante) as ganancia_recibida FROM  ingresos natural join estudiante natural join estudiantepedidorelacion  GROUP BY escuela",
       
     
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error al obtener la información");
      } else {
        const data = result.map((item) => ({
          escuela: item.escuela,
          dineroARecibir: item.costo_total,
          dineroRecibido: item.ganancia_recibida,
        }));
        res.status(200).send(data);
      }
    }
  );
});



// Ruta para eliminar permanentemente un estudiante por su ID
app.delete("/estudiante/:id", async (req, res) => {
  const executeQuery = (sql, id) => {
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  const idEstudiante = req.params.id;

  const sqlEstudiante = "DELETE FROM estudiante WHERE id_estudiante = ?";
  const sqlTutor = "DELETE FROM tutor WHERE id_tutor = ?";
  const sqlRelacion =
    "DELETE FROM estudiantepedidorelacion WHERE id_estudiante = ?";
  const sqlPedido = "DELETE FROM pedido WHERE id_pedido = ?";
  const sqlIngresos = "DELETE FROM ingresos WHERE id_pedido = ?";

  try {
    await executeQuery(sqlEstudiante, idEstudiante);
    await executeQuery(sqlTutor, idEstudiante);
    await executeQuery(sqlRelacion, idEstudiante);
    await executeQuery(sqlPedido, idEstudiante);
    await executeQuery(sqlIngresos, idEstudiante);

    console.log("Estudiante eliminado permanentemente:", idEstudiante);
    res.send("Estudiante eliminado permanentemente");
  } catch (err) {
    console.error("Error al eliminar el estudiante:", err);
    res.status(500).send("Error al eliminar el estudiante");
  }
});

app.listen(3001, () => {
  console.log("Ayuda");
});
