const database = include("databaseConnection");

async function createTables() {
    const createTableQueries = [
        `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `,
        `
        CREATE TABLE IF NOT EXISTS user_groups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            total DECIMAL(10, 2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `,
        `
        CREATE TABLE IF NOT EXISTS group_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            amount_owed DECIMAL(10, 2) DEFAULT 0.00,
            FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `,
        `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            paid_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
        );
    `,
        `
        CREATE TABLE IF NOT EXISTS expense_shares (
            id INT AUTO_INCREMENT PRIMARY KEY,
            expense_id INT NOT NULL,
            user_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `,
        `
        CREATE TABLE friends (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_one_id INT NOT NULL,
            user_two_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT unique_friendship UNIQUE (user_one_id, user_two_id)
        );
    `,
    ];

    try {
        for (const query of createTableQueries) {
            await database.query(query);
        }
        console.log("Successfully created tables");
        return true;
    } catch (err) {
        console.log(err);
        console.log("Error Creating tables");
        return false;
    }
}

async function deleteTables() {
    const deleteTableQueries = [
        "DROP TABLE IF EXISTS friends;",
        "DROP TABLE IF EXISTS expense_shares;",
        "DROP TABLE IF EXISTS expenses;",
        "DROP TABLE IF EXISTS group_members;",
        "DROP TABLE IF EXISTS user_groups;",
        "DROP TABLE IF EXISTS users;",
    ];

    try {
        for (const query of deleteTableQueries) {
            await database.query(query);
        }
        console.log("Successfully deleted tables");
        return true;
    } catch (err) {
        console.error("Error deleting tables:", err);
        return false;
    }
}

module.exports = { createTables, deleteTables };
