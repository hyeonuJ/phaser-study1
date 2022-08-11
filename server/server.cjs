const cors = require("cors"); // CORS 오류 해결
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const db = require("./config/db.cjs");
const bodyParser = require("body-parser"); // 없으면 console.log(req.body) 가 undefined 로 뜬다
db.connect();

// https://meyouus.tistory.com/68
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// 출처 : https://velog.io/@wiostz98kr/React-Express-CORS-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0#22-cors-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
app.use(cors()); // 모든 접근 허용
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // 특정도메인만 허용 (vite-project의 경우 :5173 포트로 되있음)
app.use(cors({ credentials: true, origin: "http://127.0.0.1:5173" }));

app.get("/data", (req, res) => {
  db.query("SELECT * FROM react_project", (err, data, fields) => {
    console.log(data);
    res.send(data);
  });
});

app.post("/register", (req, res) => {
  db.query(
    "select * from react_project order by id desc limit 1",
    (err, data) => {
      console.log(data);
      req.body.id = data.id + 1;
    }
  );
  //console.log(req.body.id);
  // console.log(req.body);
  db.query(
    "INSERT INTO react_project VALUES (" +
      req.body.id +
      ",'" +
      req.body.email +
      "','" +
      req.body.user_name +
      "','" +
      req.body.user_password +
      "','" +
      req.body.bday +
      "')"
  );
});

app.listen(PORT, () => {
  console.log(`Server On : http://localhost:${PORT}/`);
});
