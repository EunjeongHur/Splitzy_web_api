const database = include("databaseConnection");

async function getGroupSettlements(groupId) {
    const query = `
        SELECT 
            s.id,
            s.group_id,
            u_from.username AS from_user_name,
            u_to.username AS to_user_name,
            s.amount,
            s.is_settled,
            s.created_at
        FROM settlements s
        INNER JOIN users u_from ON s.from_user_id = u_from.id
        INNER JOIN users u_to ON s.to_user_id = u_to.id
        WHERE s.group_id = ?
    `;

    try {
        const [rows] = await database.query(query, [groupId]);
        return rows;
    } catch (error) {
        console.error("Error fetching settlements:", error);
        throw error;
    }
}

async function settleUp(settlementId) {
    const query = `
        UPDATE settlements
        SET is_settled = TRUE
        WHERE id = ?
    `;

    try {
        await database.query(query, [settlementId]);
        return true;
    } catch (error) {
        console.error("Error settling up:", error);
        throw error;
    }
}

async function undoSettle(settlementId) {
    const query = `
        UPDATE settlements
        SET is_settled = FALSE
        WHERE id = ?
    `;

    try {
        await database.query(query, [settlementId]);
        return true;
    } catch (error) {
        console.error("Error undoing settle up:", error);
        throw error;
    }
}

module.exports = { getGroupSettlements, settleUp, undoSettle };
