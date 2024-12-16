const database = include("databaseConnection");

async function getUserGroup(postData) {
	let getUserGroupQuery = `
		SELECT ug.id as group_id,
			ug.name as group_name,
			ug.total as group_total,
			ug.created_at as group_created_at
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
		console.log(error);
		return [];
	}
}

async function createGroup(postData) {
	const connection = await database.getConnection();
	try {
		await connection.beginTransaction();

		let createGroupQuery = `
			INSERT INTO user_groups (name, total, created_at)
			VALUES (:groupName, 0.00, NOW())
		`;

		let params = {
			groupName: postData.groupName,
			memberIds: postData.memberIds,
		};

		const [groupResult] = await connection.query(createGroupQuery, params);
		const groupId = groupResult.insertId;

		const createGroupMembersQuery = `
			INSERT INTO group_members (group_id, user_id)
			VALUES (:groupId, :userId)
		`;

		const memberValues = postData.memberIds.map((user_id) => [
			groupId,
			user_id,
		]);
		await connection.query(createGroupMembersQuery, [memberValues]);

		await connection.commit();
		console.log("Group created successfully with ID:", groupId);

		return { success: true, groupId };
	} catch (error) {
		await connection.rollback();
		console.log(error);
		return { success: false, error: error.message };
	} finally {
		connection.release();
	}
}

module.exports = {
	getUserGroup,
	createGroup,
};
