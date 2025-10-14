const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPEN_DART_KEY = "9e90974fba4ce9bf605b1c7a86c61e0a3f9969ac";

router.get('/majorstock', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./share_disclosure/majorstock', { 
            companies: results,
            companyData: null
        });
    });
});
router.get('/majorstock/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/majorstock.json";

  try {
    // DB 조회 (왼쪽 회사목록 유지)
    const query = "SELECT * FROM company_info";
    req.db.query(query, async (err, results) => {
      if (err) return res.status(500).send("DB Error");

      // OpenDART API 호출
      const response = await axios.get(url, {
              params: {
                crtfc_key: OPEN_DART_KEY,
                corp_code: corpCode,
                bgn_de: "20230101",
                end_de: "20231231",
              }
            });
      // DB 목록 + API 데이터 동시에 EJS로 전달
      res.render('./share_disclosure/majorstock', { 
        companies: results,
        companyData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/elestock', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./share_disclosure/elestock', { 
            companies: results,
            companyData: null
        });
    });
});
router.get('/elestock/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/majorstock.json";

  try {
    // DB 조회 (왼쪽 회사목록 유지)
    const query = "SELECT * FROM company_info";
    req.db.query(query, async (err, results) => {
      if (err) return res.status(500).send("DB Error");

      // OpenDART API 호출
      const response = await axios.get(url, {
              params: {
                crtfc_key: OPEN_DART_KEY,
                corp_code: corpCode,
              }
            });
      console.log(response.data);
      // DB 목록 + API 데이터 동시에 EJS로 전달
      res.render('./share_disclosure/elestock', { 
        companies: results,
        companyData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

module.exports = router;