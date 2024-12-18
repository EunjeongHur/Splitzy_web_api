const jwt = require("jsonwebtoken");

global.base_dir = __dirname;
global.abs_path = function (path) {
    return base_dir + path;
};
global.include = function (file) {
    return require(abs_path("/" + file));
};

function validatePassword(password) {
    // Minimum length of 10 characters
    if (password.length < 10) {
        return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
        return false;
    }

    // Check for at least one special character (symbol)
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
        return false;
    }
    return true;
}

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.log("Token expired.");
                return res.status(401).json({ message: "Token expired." });
            }
            console.log(err);
            return res.status(403).json({ message: "Unauthorized." });
        }
        req.userId = decoded.userId;
        console.log("Inside verifyToken");
        next();
    });
}

// Greedy algorithm to settle balances
function settleBalances(balances) {
    const transactions = [];
    const positive = [];
    const negative = [];

    for (const [user, balance] of Object.entries(balances)) {
        if (balance > 0) positive.push({ user, balance });
        else if (balance < 0) negative.push({ user, balance: -balance });
    }

    let i = 0,
        j = 0;

    while (i < positive.length && j < negative.length) {
        const giveAmount = Math.min(positive[i].balance, negative[j].balance);

        transactions.push({
            from: negative[j].user,
            to: positive[i].user,
            amount: giveAmount,
        });

        positive[i].balance -= giveAmount;
        negative[j].balance -= giveAmount;

        if (positive[i].balance === 0) i++;
        if (negative[j].balance === 0) j++;
    }

    return transactions;
}

module.exports = { validatePassword, verifyToken, settleBalances };
