const express = require("express");
const router = express.Router();
const db_group = require("../database/groups");
const { verifyToken } = require("../utils");

// Fetch a user's groups
router.get("/", verifyToken, async (req, res) => {
    try {
        const user_id = req.userId;

        const result = await db_group.getUserGroup({ user_id });

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Create a new group
router.post("/", verifyToken, async (req, res) => {
    const { groupName, invitedUsers } = req.body;
    const user_id = req.userId;

    try {
        const result = await db_group.createGroup({
            groupName,
            invitedUsers,
            user_id,
        });
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// Get group details for a specific group
router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params;
    console.log(groupId);
    try {
        // Fetch group details and expenses
        const groupDetails = await db_group.getGroupDetails({ groupId });

        console.log(groupDetails);
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

router.delete("/:groupId/delete", verifyToken, async (req, res) => {
    const { groupId } = req.params;
    const user_id = req.userId;

    console.log(groupId, user_id);
    try {
        const result = await db_group.deleteGroup({ groupId, user_id });
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// router.post("/:groupId/settle", verifyToken, async (req, res) => {
//     try {
//         const user_id = req.userId;
//         const { groupId } = req.params;
//         const { settledTransactions } = req.body;

//         if (!Array.isArray(settledTransactions)) {
//             return res.status(400).json({ message: "Invalid input data" });
//         }

//         const result = await db_group.settleUp({ groupId, settledTransactions });
//     }
// })

module.exports = router;
