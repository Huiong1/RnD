
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
    res.render('./disclosure_info/search_disclosure', { companies: results });
  });
});


// 2) 특정 회사 OpenDART API (JSON만 내려줌 → Ajax로 사용)
router.get('/search-disclosure/:company_code', async (req,res) => {
  const corpCode = req.params.company_code;
  const url = "https://opendart.fss.or.kr/api/list.json";

  try {
    const response = await axios.get(url, {
      params: {
        crtfc_key: OPEN_DART_KEY,
        corp_code: corpCode,
        bgn_de: "20200101",  // 필요시 동적 날짜로 바꿀 수 있음
        end_de: "20231231"
      }
    });

    res.json(response.data);   // JSON만 내려줌
  } catch (err) {
    console.error("OpenDART API 호출 오류:", err.message);
    res.status(500).json({ error: "OpenDART API 호출 실패" });
  }
});

module.exports = router;