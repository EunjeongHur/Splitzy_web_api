const database = include("databaseConnection");

async function isUsernameInUse(postData) {
	let isUsernameInUseQuery = "SELECT * FROM users WHERE username = :username";

	let params = {
		username: postData.username,
	};

	try {
		const results = await database.query(isUsernameInUseQuery, params);
		return results[0].length > 0;
	} catch (error) {
		return [];
	}
}

async function isEmailInUse(postData) {
	let isEmailInUseQuery = "SELECT * FROM users WHERE email = :email";

	let params = {
		email: postData.email,
	};

	try {
		const results = await database.query(isEmailInUseQuery, params);
		return results[0].length > 0;
	} catch (error) {
		return [];
	}
}

async function createUser(postData) {
	let createUserQuery = `
        INSERT INTO users (fname, lname, username, email, password_hash)
        VALUES (:fname, :lname, :username, :email, :password)
    `;

	let params = {
		fname: postData.fname,
		lname: postData.lname,
		username: postData.username,
		email: postData.email,
		password: postData.password,
	};

	try {
		const results = await database.query(createUserQuery, params);
		return true;
	} catch (error) {
		return false;
	}
}

async function getUserByEmail(postData) {
	let getUserByEmailQuery = "SELECT * FROM users WHERE email = :email";

	let params = {
		email: postData.email,
	};

	try {
		const results = await database.query(getUserByEmailQuery, params);
		return results[0];
	} catch (error) {
		return [];
	}
}

async function searchUsers(postData) {
	let searchUsersQuery = `
        SELECT id, fname, lname, username, email
        FROM users
        WHERE id != :userId AND (fname LIKE :query OR lname LIKE :query OR username LIKE :query)
        LIMIT 8;
    `;

	let params = {
		userId: postData.userId,
		query: `%${postData.query}%`,
	};

	try {
		const results = await database.query(searchUsersQuery, params);
		return results[0];
	} catch (error) {
		return [];
	}
}

async function getUserInformation(postData) {
	const getUserInformationQuery = `
        SELECT fname as firstName,
        lname as lastName,
        email, 
        username
        FROM users
        WHERE id = :userId;
    `;

	let params = {
		userId: postData.userId,
	};

	try {
		const results = await database.query(getUserInformationQuery, params);
		return results[0];
	} catch (err) {
		return [];
	}
}

async function updateUserInformation(postData) {
	const updateUserInformationQuery = `
		UPDATE users
		SET fname = :fname, lname = :lname, email = :email, username = :username
		WHERE id = :userId;
	`;

	let params = {
		userId: postData.userId,
		fname: postData.updateInfo.firstName,
		lname: postData.updateInfo.lastName,
		email: postData.updateInfo.email,
		username: postData.updateInfo.username,
	};

	try {
		const results = await database.query(
			updateUserInformationQuery,
			params
		);
		return true;
	} catch (err) {
		return false;
	}
}

module.exports = {
	createUser,
	isUsernameInUse,
	isEmailInUse,
	getUserByEmail,
	searchUsers,
	getUserInformation,
	updateUserInformation,
};
