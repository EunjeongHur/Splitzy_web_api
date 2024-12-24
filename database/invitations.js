const database = include("databaseConnection");

async function getUserInvitations(userId) {
	const query = `
        SELECT 
            i.id AS invitation_id, 
            i.group_id AS group_id,
            g.name AS group_name, 
            u.username AS inviter_name
        FROM invitations i
        JOIN user_groups g ON i.group_id = g.id
        JOIN users u ON i.inviter_id = u.id
        WHERE i.invitee_id = ?
    `;

	const [rows] = await database.query(query, [userId]);
	return rows;
}

async function acceptInvitation(invitationId, userId) {
	const connection = await database.getConnection();
	try {
		await connection.beginTransaction();

		// Get group ID and invitee ID
		const [invitation] = await connection.query(
			"SELECT group_id FROM invitations WHERE id = ? AND invitee_id = ?",
			[invitationId, userId]
		);

		if (!invitation.length) {
			throw new Error("Invitation not found or unauthorized.");
		}

		const groupId = invitation[0].group_id;

		// Add the user to the group_members table
		await connection.query(
			"INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
			[groupId, userId]
		);

		// Delete the invitation
		await connection.query("DELETE FROM invitations WHERE id = ?", [
			invitationId,
		]);

		await connection.commit();
		return true;
	} catch (error) {
		await connection.rollback();
		console.error("Error accepting invitation");
		return false;
	} finally {
		connection.release();
	}
}

async function declineInvitation(invitationId, userId) {
	const query = `
        DELETE FROM invitations 
        WHERE id = ? AND invitee_id = ?
    `;

	const [result] = await database.query(query, [invitationId, userId]);
	return result.affectedRows > 0;
}

async function getUserInvitationCount(userId) {
	const query = `
        select count(invitee_id) as count
        from invitations
        where invitee_id = ?
    `;

	const [rows] = await database.query(query, [userId]);
	return rows;
}

module.exports = {
	getUserInvitations,
	acceptInvitation,
	declineInvitation,
	getUserInvitationCount,
};
