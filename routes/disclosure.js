
const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPEN_DART_KEY = "9e90974fba4ce9bf605b1c7a86c61e0a3f9969ac";


// 1) 회사 목록 (DB 조회 → EJS 렌더링)
router.get('/search-disclosure', (req, res) => {
  const query = "SELECT * FROM company_info";
  req.db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB Error");
    }
    res.render('./disclosure_info/search_disclosure', { 
        companies: results,
        disclosureData: null
     });
  });
});


router.get('/search-disclosure/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/list.json";

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
      res.render('./disclosure_info/search_disclosure', { 
        companies: results,
        disclosureData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});
router.get('/company-profile', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./disclosure_info/company_profile', { 
            companies: results,
            companyProfileData: null
        });
    });
})
router.get('/company-profile/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  console.log("고유번호",corpCode);
  const url = "https://opendart.fss.or.kr/api/company.json";

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
      res.render('./disclosure_info/company_profile', { 
        companies: results,
        companyProfileData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});
router.get('/corp-code', async (req,res) => {
  const corpCode = req.params.company_code;
  const url = "https://opendart.fss.or.kr/api/corpCode.xml";

  try {
    // DB 조회 (왼쪽 회사목록 유지)
    const query = "SELECT * FROM company_info";
    req.db.query(query, async (err, results) => {
      if (err) return res.status(500).send("DB Error");

      // OpenDART API 호출
      const response = await axios.get(url, {
        params: {
          crtfc_key: OPEN_DART_KEY
        }
      });
      console.log(response.data);

      // DB 목록 + API 데이터 동시에 EJS로 전달
      res.render('./disclosure_info/corp_code', { 
        companies: results,
        companyProfileData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

module.exports = router;