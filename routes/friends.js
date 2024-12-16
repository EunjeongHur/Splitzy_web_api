const express = require("express");
const router = express.Router();
const db_user = require("../database/users");

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await db_user.getFriends({ userId });
        res.status(200).json({ success: true, result });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch friends",
        });
    }
});

module.exports = router;
