const express = require("express");
const router = express.Router();
const db_expenses = require("../database/expenses");
const { verifyToken } = require("../utils");

// Greedy algorithm to settle balances
function settleBalances(balances) {
    const transactions = [];
    const positive = [];
    const negative = [];

    for (const [user, balance] of Object.entries(balances)) {
        if (balance > 0) positive.push({ user, balance });
        else if (balance < 0) negative.push({ user, balance: -balance });
    }

    let i = 0,
        j = 0;

    while (i < positive.length && j < negative.length) {
        const giveAmount = Math.min(positive[i].balance, negative[j].balance);

        transactions.push({
            from: negative[j].user,
            to: positive[i].user,
            amount: giveAmount,
        });

        positive[i].balance -= giveAmount;
        negative[j].balance -= giveAmount;

        if (positive[i].balance === 0) i++;
        if (negative[j].balance === 0) j++;
    }

    return transactions;
}

router.get("/:groupId", verifyToken, async (req, res) => {
    try {
        const { groupId } = req.params;

        const balances = await db_expenses.getGroupBalances(groupId);

        console.log(balances);
        const transactions = settleBalances(balances);

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Error calculating settlements:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
