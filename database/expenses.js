const database = include("databaseConnection");

async function addExpense({
    group_id,
    description,
    amount,
    paid_by,
    split_between,
}) {
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();

        // Insert into expenses table
        const insertExpenseQuery = `
            INSERT INTO expenses (group_id, description, amount, paid_by, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [expenseResult] = await connection.query(insertExpenseQuery, [
            group_id,
            description,
            amount,
            paid_by,
        ]);
        const expense_id = expenseResult.insertId;

        // Insert into expense_shares table
        const insertExpenseSharesQuery = `
            INSERT INTO expense_shares (expense_id, user_id, amount)
            VALUES ?
        `;
        const shareValues = split_between.map(({ user_id, share }) => [
            expense_id,
            user_id,
            share,
        ]);
        await connection.query(insertExpenseSharesQuery, [shareValues]);

        await connection.commit();

        return { success: true, expense_id };
    } catch (error) {
        await connection.rollback();
        console.error("Error adding expense:", error);
        throw error;
    } finally {
        connection.release();
    }
}

async function getGroupBalances(groupId) {
    let getGroupBalancesQuery = `
        SELECT 
            u.username AS user,
            IFNULL(paid.total_paid, 0) - IFNULL(share.total_share, 0) AS balance
        FROM users u
        LEFT JOIN (
            SELECT 
                paid_by AS user_id, 
                SUM(amount) AS total_paid
            FROM expenses
            WHERE group_id = ?
            GROUP BY paid_by
        ) AS paid ON paid.user_id = u.id
        LEFT JOIN (
            SELECT 
                user_id, 
                SUM(amount) AS total_share
            FROM expense_shares
            WHERE expense_id IN (SELECT id FROM expenses WHERE group_id = ?)
            GROUP BY user_id
        ) AS share ON share.user_id = u.id
        WHERE u.id IN (SELECT user_id FROM group_members WHERE group_id = ?);

    `;

    try {
        const [results] = await database.query(getGroupBalancesQuery, [
            groupId,
            groupId,
            groupId,
        ]);

        const balances = {};
        results.forEach((row) => {
            balances[row.user] = row.balance;
        });
        return balances;
    } catch (error) {
        console.log(error);
        return {};
    }
}

async function getGroupBalancesWithId(groupId) {
    let getGroupBalancesQuery = `
        SELECT 
            u.id AS user,
            IFNULL(paid.total_paid, 0) - IFNULL(share.total_share, 0) AS balance
        FROM users u
        LEFT JOIN (
            SELECT 
                paid_by AS user_id, 
                SUM(amount) AS total_paid
            FROM expenses
            WHERE group_id = ?
            GROUP BY paid_by
        ) AS paid ON paid.user_id = u.id
        LEFT JOIN (
            SELECT 
                user_id, 
                SUM(amount) AS total_share
            FROM expense_shares
            WHERE expense_id IN (SELECT id FROM expenses WHERE group_id = ?)
            GROUP BY user_id
        ) AS share ON share.user_id = u.id
        WHERE u.id IN (SELECT user_id FROM group_members WHERE group_id = ?);

    `;

    try {
        const [results] = await database.query(getGroupBalancesQuery, [
            groupId,
            groupId,
            groupId,
        ]);

        const balances = {};
        results.forEach((row) => {
            balances[row.user] = row.balance;
        });
        return balances;
    } catch (error) {
        console.log(error);
        return {};
    }
}

async function UpdateSettlement(postData) {
    let insertSettlementQuery = `
        INSERT INTO settlements (group_id, from_user_id, to_user_id, amount)
        VALUES (:group_id, :from_user_id, :to_user_id, :amount)
        ON DUPLICATE KEY UPDATE
        amount = :amount;
    `;

    let params = {
        group_id: postData.group_id,
    };

    try {
        for (const transaction of postData.transactions) {
            params.from_user_id = transaction.from;
            params.to_user_id = transaction.to;
            params.amount = transaction.amount;

            await database.query(insertSettlementQuery, params);
        }

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateExpenseShares(groupId) {
    // Fetch group members
    const members = await database.query(
        `SELECT user_id FROM group_members WHERE group_id = ?`,
        [groupId]
    );

    const memberCount = members[0].length;

    // Fetch all expenses for the group
    const expenses = await database.query(
        `SELECT id, amount FROM expenses WHERE group_id = ?`,
        [groupId]
    );

    for (const expense of expenses[0]) {
        const splitAmount = parseFloat(
            (expense.amount / memberCount).toFixed(2)
        );

        // Delete old shares
        await database.query(
            `DELETE FROM expense_shares WHERE expense_id = ?`,
            [expense.id]
        );

        // Insert new shares
        const shareValues = members[0].map((member) => [
            expense.id,
            member.user_id,
            splitAmount,
        ]);

        await database.query(
            `INSERT INTO expense_shares (expense_id, user_id, amount) VALUES ?`,
            [shareValues]
        );
    }
}

module.exports = {
    addExpense,
    getGroupBalances,
    UpdateSettlement,
    getGroupBalancesWithId,
    updateExpenseShares,
};
