const express = require("express");
const router = express.Router();
const db_user = require("../database/users");
const db_invitations = require("../database/invitations");
const db_expenses = require("../database/expenses");
const { settleBalances } = require("../utils");
const { verifyToken } = require("../utils");

// Fetch all invitations for the authenticated user
router.get("/", async (req, res) => {
    try {
        const userId = req.userId;
        const invitations = await db_invitations.getUserInvitations(userId);
        if (!invitations) {
            return res.status(404).send({ error: "No invitations found." });
        }

        res.status(200).send(invitations);
    } catch (error) {
        console.error("Error fetching invitations:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Accept an invitation
router.post("/:invitationId/:groupId/accept", async (req, res) => {
    try {
        const { invitationId, groupId } = req.params;
        const userId = req.userId;

        const result = await db_invitations.acceptInvitation(
            invitationId,
            userId
        );

        await db_expenses.updateExpenseShares(groupId);

        const balances = await db_expenses.getGroupBalancesWithId(groupId);

        const transactions = settleBalances(balances);
        await db_expenses.UpdateSettlement({
            transactions,
            group_id: groupId,
        });

        if (result) {
            res.status(200).send({ success: true });
        } else {
            res.status(400).send({ error: "Failed to accept invitation." });
        }
    } catch (error) {
        console.error("Error accepting invitation:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Decline an invitation
router.post("/:invitationId/decline", async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.userId;

        const result = await db_invitations.declineInvitation(
            invitationId,
            userId
        );

        if (result) {
            res.status(200).send({ success: true });
        } else {
            res.status(400).send({ error: "Failed to decline invitation." });
        }
    } catch (error) {
        console.error("Error declining invitation:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
