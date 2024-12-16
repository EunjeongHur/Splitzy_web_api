const database = include("databaseConnection");

async function testing() {
    let testQuery = "SELECT * FROM testing";

    let params = {};

    try {
        const results = await database.query(testQuery, params);
        return results[0];
    } catch (error) {
        console.log(error);
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
        console.log(error);
        return [];
    }
}

async function createUser(postData) {
    let createUserQuery = `
        INSERT INTO users (name, email, password_hash)
        VALUES (:name, :email, :password)
    `;

    let params = {
        name: postData.name,
        email: postData.email,
        password: postData.password,
    };

    try {
        const results = await database.query(createUserQuery, params);
        return true;
    } catch (error) {
        console.log(error);
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
        console.log(error);
        return [];
    }
}

async function getFriends(postData) {
    let getFriendsQuery = `
        SELECT 
            CASE
                WHEN f.user_one_id = :userId THEN f.user_two_id
                ELSE f.user_one_id
            END AS friend_id,
            u.name AS friend_name
        FROM friends f
        INNER JOIN users u
            ON u.id = CASE
                WHEN f.user_one_id = :userId THEN f.user_two_id
                ELSE f.user_one_id
            END
        WHERE f.user_one_id = :userId OR f.user_two_id = :userId;
    `;

    let params = {
        userId: postData.userId,
    };

    try {
        const results = await database.query(getFriendsQuery, params);
        return results[0];
    } catch (error) {
        console.log(error);
        return [];
    }
}

module.exports = {
    testing,
    createUser,
    isEmailInUse,
    getUserByEmail,
    getFriends,
};
