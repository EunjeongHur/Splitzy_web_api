const express = require("express");
const router = express.Router();
const db_settlements = require("../database/settlements");
const { verifyToken } = require("../utils");

router.get("/:groupId", verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;

        const settlements = await db_settlements.getGroupSettlements(groupId);

        console.log("settlements: ", settlements);

        res.status(200).json({ settlements });
    } catch (error) {
        console.error("Error calculating settlements:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.put("/:settlementId/settle", verifyToken, async (req, res) => {
    try {
        const { settlementId } = req.params;
        console.log(settlementId);
        const result = await db_settlements.settleUp(settlementId);
        console.log(result);
        if (result) {
            res.status(200).send({ success: true });
        } else {
            res.status(500).send({ error: "Failed to settle up" });
        }
    } catch (error) {
        console.error("Error settling up:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
