const express = require("express");
const router = express.Router();
const db_group = require("../database/groups");
const db_expenses = require("../database/expenses");
const { verifyToken } = require("../utils");

// Create a new expense
router.post("/", verifyToken, async (req, res) => {
    try {
        const user_id = req.userId;

        const { group_id, description, amount, selectedPaidBy } = req.body;

        console.log(group_id, description, amount, selectedPaidBy);
        if (!group_id || !description || !amount || !selectedPaidBy) {
            return res.status(400).send({ error: "Invalid input data" });
        }

        const groupMembers = await db_group.getGroupMembers({ group_id });
        if (groupMembers.length === 0) {
            return res
                .status(404)
                .send({ error: "Group not found or has no members" });
        }

        const splitAmount = parseFloat(
            (amount / groupMembers.length).toFixed(2)
        );

        const splitBetween = groupMembers.map((member) => ({
            user_id: member.user_id,
            share: splitAmount,
        }));

        const result = await db_expenses.addExpense({
            group_id,
            description,
            amount,
            paid_by: selectedPaidBy,
            split_between: splitBetween,
        });

        await db_group.updateGroupTotal({ group_id, amount });

        res.status(201).send({ success: true, expense_id: result.expense_id });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;
