
const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPEN_DART_KEY = "9e90974fba4ce9bf605b1c7a86c61e0a3f9969ac";

router.get('/debt-security', (req,res) => {
    const query = "SELECT * FROM company_info";
    req.db.query(query, (err, results) => {
        if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
        }
        res.render('./registration/debt_security', { 
            companies: results,
            companyProfileData: null
        });
    });
})

module.exports = router;