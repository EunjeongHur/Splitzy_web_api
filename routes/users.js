const express = require("express");
const router = express.Router();
const db_group = require("../database/groups");
const db_users = require("../database/users");
const { verifyToken } = require("../utils");

router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        const results = await db_users.searchUsers({
            userId: req.userId,
            query,
        });

        console.log(results);

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error searching groups:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
