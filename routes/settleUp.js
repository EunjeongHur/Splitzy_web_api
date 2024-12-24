const express = require("express");
const router = express.Router();
const db_settlements = require("../database/settlements");
const { verifyToken } = require("../utils");

router.get("/:groupId", verifyToken, async (req, res) => {
	try {
		const { groupId } = req.params;

		const settlements = await db_settlements.getGroupSettlements(groupId);

		res.status(200).json({ settlements });
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

router.put("/:settlementId/settle", verifyToken, async (req, res) => {
	try {
		const { settlementId } = req.params;
		const result = await db_settlements.settleUp(settlementId);
		if (result) {
			res.status(200).send({ success: true });
		} else {
			res.status(500).send({ error: "Failed to settle up" });
		}
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

router.put("/:settlementId/undo", verifyToken, async (req, res) => {
	try {
		const { settlementId } = req.params;
		const result = await db_settlements.undoSettle(settlementId);
		if (result) {
			res.status(200).send({ success: true });
		} else {
			res.status(500).send({ error: "Failed to undo settle up" });
		}
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
