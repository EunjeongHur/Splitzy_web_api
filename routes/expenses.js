const express = require("express");
const router = express.Router();
const db_user = require("../database/users");
const db_group = require("../database/groups");
const db_expenses = require("../database/expenses");
const jwt = require("jsonwebtoken");

// Create a new expense
router.post("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send("Unauthorized");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.userId;

        const { group_id, description, amount } = req.body;

        if (!group_id || !description || !amount) {
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
            paid_by: user_id,
            split_between: splitBetween,
        });
        res.status(201).send({ success: true, expense_id: result.expense_id });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;
