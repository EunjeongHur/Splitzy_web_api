const express = require("express");
const router = express.Router();
const db_user = require("../database/users");
const { verifyToken } = require("../utils");

router.get("/search", verifyToken, async (req, res) => {
	try {
		const user_id = req.userId;
		const { query } = req.query;
		const results = await db_user.findUsers({
			user_id: user_id,
			query: query,
		});

		console.log("Results: ", results);

		res.status(200).json(results);
	} catch (error) {
		console.log(error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
