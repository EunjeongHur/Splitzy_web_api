const database = include("databaseConnection");

async function getGroups() {
	let getGroupsQuery = "SELECT * FROM user_groups";

	let params = {};

	try {
		const results = await database.query(getGroupsQuery, params);
		return results[0];
	} catch (error) {
		console.log(error);
		return [];
	}
}

module.exports = {
	getGroups,
};
