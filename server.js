import express from "express";
import { createConnection, createPool } from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8082;

// const conn = createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "tododb",
// });

const conn = createPool({
  host: process.env.SERVER_HOST,
  user: process.env.SERVER_USER,
  password: process.env.SERVER_PASSWORD,
  database: process.env.SERVER_DATABASE,
  port: process.env.SERVER_PORT,
});

const userTbl = "users";
const todos = "todos";

// conn.connect((err) => {
//   if (err) {
//     // throw err;
//     console.log(err);
//   } else {
//     console.log("Connection Success");
//   }
// });

conn.getConnection((err, connection) => {
  if (err) {
    console.log(err);
    return;
  }
  if (connection) {
    console.log("freemysqlhosting.net connected successfully");
  }
});

function savetodo(params, callback) {
  let status = {
    status: "",
    isSuccess: "",
  };
  let qry = `INSERT INTO ${todos}(title, description,userid) VALUES('${params.title}','${params.desc}', ${params.userid})`;

  conn.query(qry, (err, result) => {
    if (err) console.log(err);
    if (result.affectedRows > 0) {
      status.status = 200;
      status.isSuccess = true;
      callback(status);
    } else {
      status.status = 500;
      status.isSuccess = false;
      console.log("failed");
      callback(status);
    }
  });
}
function updatetodo(body, callback) {
  let qry = `UPDATE ${todos} SET title='${body.title}', description='${body.desc}' WHERE id=${body.id}`;
  conn.query(qry, (error, result) => {
    if (error) console.log(err);
    callback(result);
  });
}

function fetchtodo(body, callback) {
  let qry = `SELECT * FROM ${todos} WHERE userid=${body.userid}`;
  conn.query(qry, (err, result) => {
    if (err) console.log(err);
    callback(result);
  });
}

function deletetodo(id, callback) {
  let qry = `DELETE FROM ${todos} WHERE ID=${id}`;

  conn.query(qry, (error, result) => {
    if (error) console.log(error);
    callback(result);
  });
}

const loginuser = (body, callback) => {
  let qry = `SELECT * FROM ${userTbl} WHERE lower(email)='${body.email.toLowerCase()}' && password='${body.password.toLowerCase()}'`;

  conn.query(qry, (error, result) => {
    if (error) throw error;
    callback(result);
  });
};

const createAccount = (body, callback) => {
  let ifExistQry = `SELECT * FROM ${userTbl} WHERE LOWER(email)='${body.email.toLowerCase()}'`;

  conn.query(ifExistQry, (error, result) => {
    if (error) console.log(error);
    if (result.length === 0) {
      let insertQry = `INSERT INTO ${userTbl} (name,email,password) VALUES('${body.name}','${body.email}', '${body.password}')`;
      conn.query(insertQry, (error, result) => {
        if (error) console.log(error);
        if (result.affectedRows > 0) {
          callback({ statusCode: 200 });
        }
      });
    } else {
      callback({ statusCode: 409 });
    }
  });
};

// ============================All the routes are declared here=================================
app.use(cors());
app.use(express.json());

app.post("/savetodo", (req, res) => {
  savetodo(req.body, (result) => {
    res.status(result.status).send(result.isSuccess);
  });
});

app.post("/fetchtodo", (req, res) => {
  fetchtodo(req.body, (result) => {
    res.status(200).send(result);
  });
});

app.put("/update", (req, res) => {
  updatetodo(req.body, (result) => {
    if (result.affectedRows > 0) {
      res.status(200).send(true);
    } else {
      res.status(404).send(false);
    }
  });
});

app.delete("/delete/:id", (req, res) => {
  deletetodo(req.params.id, (result) => {
    if (result.affectedRows > 0) {
      res.status(200).send(true);
    } else {
      res.status(404).send(false);
    }
  });
});

//===========Login user routes======================
app.post("/loginuser", (req, res) => {
  loginuser(req.body, (result) => {
    result.length !== 0
      ? res.status(200).send({ id: result[0].id, name: result[0].name })
      : res.status(404).end();
  });
});

// create user account
app.post("/createaccount", (req, res) => {
  createAccount(req.body, (result) => {
    res.status(200).send(result);
  });
});

app.listen(PORT);
console.log(`Server running...`);
