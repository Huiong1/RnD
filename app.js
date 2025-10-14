const express = require('express');
const path = require("path");
const mysql = require('mysql2');
const disclosure = require("./routes/disclosure");
const registration = require("./routes/registration");
const share_disclosure = require("./routes/share_disclosure");
const connection = require("./db/db_connect");

const app = express();

app.set('port', process.env.PORT || 3000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));

app.use((req, res, next) => {
  req.db = connection; // 
  next();
});

app.use("/disclosure", disclosure);
app.use("/registration", registration);
app.use("/share-disclosure", share_disclosure);
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