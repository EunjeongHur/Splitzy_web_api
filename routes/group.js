const express = require("express");
const router = express.Router();
const db_user = require("../database/users");
const db_group = require("../database/groups");

// Fetch a user's groups
router.get("/", async (req, res) => {
	const user_id = req.session.user_id;
	console.log(user_id);
	try {
		const result = await db_group.getUserGroup({ user_id });
		res.status(200).send(result);
	} catch (error) {
		console.log(error);
		res.status(500).send("Internal Server Error");
	}
});

// Create a new group
router.post("/", async (req, res) => {
	const groupName = req.body.groupName;
	const memberIds = req.body.memberIds;

	console.log("GroupName: ", groupName);
	console.log("MemberIds: ", memberIds);
	try {
		const result = await db_group.createGroup({ groupName, memberIds });
		res.status(200).send(result);
	} catch (error) {
		console.log(error);
		res.status(500).send("Internal Server Error");
	}
});
module.exports = router;
