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

module.exports = { addExpense };
