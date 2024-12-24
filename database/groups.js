const database = include("databaseConnection");

async function getUserGroup(postData) {
	let getUserGroupQuery = `
		SELECT DISTINCT 
			ug.id AS id,
			ug.name AS name,
			ug.total AS total
		FROM group_members gm
		INNER JOIN user_groups ug ON gm.group_id = ug.id
		WHERE gm.user_id = :user_id
	`;

	let params = {
		user_id: postData.user_id,
	};

	try {
		const results = await database.query(getUserGroupQuery, params);
		return results[0];
	} catch (error) {
		return [];
	}
}

async function createGroup(postData) {
	const connection = await database.getConnection();
	try {
		await connection.beginTransaction();

		const createGroupQuery = `
            INSERT INTO user_groups (name, total, created_at)
            VALUES (?, 0.00, NOW())
        `;

		const groupParams = [postData.groupName];
		const [groupResult] = await connection.query(
			createGroupQuery,
			groupParams
		);
		const groupId = groupResult.insertId;

		const InsertUsertoGroupQuery = `
            INSERT INTO group_members (group_id, user_id)
            VALUES (?, ?)
        `;

		await connection.query(InsertUsertoGroupQuery, [
			groupId,
			postData.user_id,
		]);

		const CreateInvitationsQuery = `
            INSERT INTO invitations (group_id, inviter_id, invitee_id)
            VALUES (?, ?, ?)
        `;

		for (let user of postData.invitedUsers) {
			await connection.query(CreateInvitationsQuery, [
				groupId,
				postData.user_id,
				user,
			]);
		}

		await connection.commit();

		return { success: true, groupId };
	} catch (error) {
		await connection.rollback();
		return { success: false, error: error.message };
	} finally {
		connection.release();
	}
}

async function getGroupMembers(postData) {
	let getGroupMembersQuery = `
		SELECT user_id FROM group_members WHERE group_id = :group_id
	`;

	let params = {
		group_id: postData.group_id,
	};

	try {
		const results = await database.query(getGroupMembersQuery, params);
		return results[0];
	} catch (error) {
		return [];
	}
}

async function getGroupMembersWithNames(postData) {
	let getGroupMembersQuery = `
        SELECT u.id AS user_id, u.username AS user_name
        FROM group_members gm
        INNER JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = :group_id
    `;

	let params = {
		group_id: postData.groupId,
	};

	try {
		const results = await database.query(getGroupMembersQuery, params);
		return results[0];
	} catch (error) {
		return [];
	}
}

async function getGroupDetails({ groupId }) {
	try {
		// Fetch group basic details
		const groupQuery = `
            SELECT id, name, total, created_at
            FROM user_groups
            WHERE id = ?;
        `;
		const [groupResult] = await database.query(groupQuery, [groupId]);

		if (groupResult.length === 0) {
			return null; // Group not found
		}
		const group = groupResult[0];

		// Fetch group expenses
		const expenseQuery = `
            SELECT 
                e.id AS expense_id,
                e.description,
                e.amount,
                e.paid_by,
                u.username AS paid_by_name,
                DATE_FORMAT(e.created_at, '%M %d') AS date
            FROM expenses e
            INNER JOIN users u ON e.paid_by = u.id
            WHERE e.group_id = ?
            ORDER BY e.created_at DESC;
        `;
		const [expensesResult] = await database.query(expenseQuery, [groupId]);

		return {
			id: group.id,
			name: group.name,
			total: group.total,
			created_at: group.created_at,
			expenses: expensesResult,
		};
	} catch (error) {
		console.error("Error fetching group details.");
		throw error;
	}
}

async function updateGroupTotal(postData) {
	const connection = await database.getConnection();
	try {
		await connection.beginTransaction();

		const updateTotalQuery = `
            UPDATE user_groups
            SET total = total + ?
            WHERE id = ?
        `;

		const updateParams = [postData.amount, postData.group_id];
		await connection.query(updateTotalQuery, updateParams);

		await connection.commit();

		return { success: true };
	} catch (error) {
		await connection.rollback();
		return { success: false, error: error.message };
	} finally {
		connection.release();
	}
}

async function deleteGroup(postData) {
	const connection = await database.getConnection();
	try {
		await connection.beginTransaction();

		const deleteGroupQuery = `
			DELETE FROM user_groups
			WHERE id = ?
		`;

		const deleteGroupParams = [postData.groupId];
		await connection.query(deleteGroupQuery, deleteGroupParams);

		await connection.commit();

		return { success: true };
	} catch (error) {
		await connection.rollback();
		return { success: false, error: error.message };
	} finally {
		connection.release();
	}
}

module.exports = {
	getUserGroup,
	createGroup,
	getGroupMembers,
	getGroupDetails,
	updateGroupTotal,
	getGroupMembersWithNames,
	deleteGroup,
};
