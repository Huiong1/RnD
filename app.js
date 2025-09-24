const express = require('express');
const path = require("path");
const mysql = require('mysql2');

const app = express();

app.set('port', process.env.PORT || 3000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'dart_api'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

app.use((req, res, next) => {
  req.db = connection; // MySQL 연결을 모든 요청에 추가
  next();
});

app.get('/', (req, res) => {
    const query = "SELECT * FROM company_info";
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB Error");
        }
        // main.ejs로 데이터 넘기기
        res.render('main', { companies: results });
    });
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});