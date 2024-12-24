const express = require("express");
const router = express.Router();
const db_users = require("../database/users");

router.get("/search", async (req, res) => {
	try {
		const { query } = req.query;
		const results = await db_users.searchUsers({
			userId: req.userId,
			query,
		});

		return res.status(200).json(results);
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

router.get("/getUserInformation", async (req, res) => {
	try {
		const userId = req.userId;
		const result = await db_users.getUserInformation({ userId });

		return res.status(200).send(result);
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
});

router.put("/updateUserInformation", async (req, res) => {
	try {
		const userId = req.userId;
		const updateInfo = req.body;
		const result = await db_users.updateUserInformation({
			userId,
			updateInfo,
		});

		if (result) {
			return res.status(200).send(result);
		} else {
			return res.status(500).send("Internal Server Error");
		}
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
