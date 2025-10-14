
const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPEN_DART_KEY = "9e90974fba4ce9bf605b1c7a86c61e0a3f9969ac";

router.get('/equity-security', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/equity_security', { 
            companies: results,
            companyDebtData: null
        });
    });
});
router.get('/equity-security/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "	https://opendart.fss.or.kr/api/estkRs.json";

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
      res.render('./registration/equity_security', { 
        companies: results,
        companyEquityData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/debt-security', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/debt_security', { 
            companies: results,
            companyDebtData: null
        });
    });
});
router.get('/debt-security/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/bdRs.json";

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
      res.render('./registration/debt_security', { 
        companies: results,
        companyDebtData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/securities-depository', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/securities_depository_receipts', { 
            companies: results,
            companyDepositoryData: null
        });
    });
});
router.get('/securities-depository/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "	https://opendart.fss.or.kr/api/stkdpRs.json";

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
      res.render('./registration/securities_depository_receipts', { 
        companies: results,
        companyDepositoryData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/merger', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/merger', { 
            companies: results,
            companyMergerData: null
        });
    });
});
router.get('/merger/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/mgRs.json";

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
      res.render('./registration/merger', { 
        companies: results,
        companyMergerData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/stock-transfer', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/stock_transfer', { 
            companies: results,
            companyStockData: null
        });
    });
});
router.get('/stock-transfer/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "https://opendart.fss.or.kr/api/extrRs.json";

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
      res.render('./registration/stock_transfer', { 
        companies: results,
        companyStockData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

router.get('/division', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/division', { 
            companies: results,
            companyDivisionData: null
        });
    });
});
router.get('/division/:primary_code', async (req,res) => {
  const corpCode = req.params.primary_code;
  const url = "	https://opendart.fss.or.kr/api/dvRs.json";

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
      res.render('./registration/division', { 
        companies: results,
        companyDivisionData: response.data
      });
    });
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

module.exports = router;