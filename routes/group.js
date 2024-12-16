const express = require("express");
const router = express.Router();
const db_group = require("../database/groups");
const jwt = require("jsonwebtoken");

// Fetch a user's groups
router.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send("Unauthorized");
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.userId;

        const result = await db_group.getUserGroup({ user_id });
        console.log(result);
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

    try {
        const result = await db_group.createGroup({ groupName, memberIds });
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params;

    try {
        // Fetch group details and expenses
        const groupDetails = await db_group.getGroupDetails({ groupId });

        if (!groupDetails) {
            return res.status(404).send({ error: "Group not found" });
        }

        res.status(200).send(groupDetails);
    } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;
