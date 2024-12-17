const express = require("express");
const router = express.Router();
const db_group = require("../database/groups");
const { verifyToken } = require("../utils");

// Fetch a user's groups
router.get("/", verifyToken, async (req, res) => {
    try {
        const user_id = req.userId;

        console.log(user_id);
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

// Get group details for a specific group
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

// Get group members list for a specific group
router.get("/:groupId/members", async (req, res) => {
    const groupId = req.params.groupId;

    try {
        const members = await db_group.getGroupMembersWithNames({ groupId });
        res.status(200).send({ success: true, members });
    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).send({ error: "Failed to fetch group members" });
    }
});

module.exports = router;
