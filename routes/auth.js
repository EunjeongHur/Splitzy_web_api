const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const db_user = require("../database/users");

const SECRET_KEY = process.env.JWT_SECRET;

const expireTime = 3 * 60 * 60 * 1000;

const { validatePassword } = include("utils");

router.post("/signup", async (req, res) => {
	const { fname, lname, username, email, password } = req.body;

	const isUsernameInUse = await db_user.isUsernameInUse({ username });
	if (isUsernameInUse) {
		return res.status(400).send("Username already in use");
	}

	const isEmailInUse = await db_user.isEmailInUse({ email });
	if (isEmailInUse) {
		return res.status(400).send("Email already in use");
	}
	if (!validatePassword(password)) {
		return res
			.status(400)
			.send("Password must be at least 8 characters long");
	}
	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const success = await db_user.createUser({
			fname,
			lname,
			username,
			email,
			password: hashedPassword,
		});

		if (success) {
			var result = await db_user.getUserByEmail({ email });
			req.session.authenticated = true;
			req.session.user_id = result[0].id;
			req.session.name = result[0].name;
			req.session.cookie.maxAge = expireTime;
			return res.send(success);
		} else {
			return res.status(500).send("Internal Server Error");
		}
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	var result = await db_user.getUserByEmail({ email });

	if (result.length == 1) {
		const match = bcrypt.compareSync(password, result[0].password_hash);

		if (match) {
			const token = jwt.sign({ userId: result[0].id }, SECRET_KEY, {
				expiresIn: "3h",
			});
			req.session.authenticated = true;
			req.session.user_id = result[0].id;
			req.session.name = result[0].name;
			req.session.cookie.maxAge = expireTime;
			return res.status(200).json({
				token,
				user: {
					id: result[0].id,
					name: result[0].name,
					email: result[0].email,
				},
			});
		} else {
			return res.status(400).send("Invalid email or password");
		}
	} else {
		return res.status(400).send("Invalid email or password");
	}
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).send("Internal Server Error");
		}
		res.clearCookie("connect.sid");
		return res.status(200).send("Logged out");
	});
});

module.exports = router;
