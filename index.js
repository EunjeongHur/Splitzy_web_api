require("./utils");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 1 * 60 * 60 * 1000;

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const databaseTablesModule = require("./database/create_tables");

const { validatePassword } = include("utils");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.pac1f.mongodb.net/`,
	crypto: {
		secret: mongodb_session_secret,
	},
});

app.use(
	session({
		secret: node_session_secret,
		store: mongoStore,
		saveUninitialized: false,
		resave: true,
		cookie: {
			secure: true,
			sameSite: "none",
		},
	})
);

app.get("/createTable", (req, res) => {
	databaseTablesModule.createTables();
	res.send("Tables created");
});

app.get("/deleteTable", (req, res) => {
	databaseTablesModule.deleteTables();
	res.send("Tables deleted");
});

app.get("/", (req, res) => {
    res.send("Hello World");
})


app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
