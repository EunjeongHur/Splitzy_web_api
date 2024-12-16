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

		UNION

		SELECT DISTINCT 
			ug.id AS id,
			ug.name AS name,
			ug.total AS total
		FROM group_members gm
		INNER JOIN user_groups ug ON gm.group_id = ug.id
		INNER JOIN friends f ON 
			(f.user_one_id = :user_id AND f.user_two_id = gm.user_id)
			OR (f.user_two_id = :user_id AND f.user_one_id = gm.user_id);
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

        const createGroupMembersQuery = `
            INSERT INTO group_members (group_id, user_id)
            VALUES ?
        `;

        const memberValues = postData.memberIds.map((userId) => [
            groupId,
            userId,
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
