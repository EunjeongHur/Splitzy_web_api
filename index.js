require("./utils");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
// const https = require("https");
// const fs = require("fs");
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const passphrase = process.env.PASSPHRASE;

const databaseTablesModule = require("./database/create_tables");
const groupsModule = require("./database/groups");

const authRouter = require("./routes/auth");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// const httpsOptions = {
// 	key: fs.readFileSync("./key.pem"),
// 	cert: fs.readFileSync("./cert.pem"),
// 	passphrase: passphrase,
// };

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

app.use("/auth", authRouter);

app.get("/", (req, res) => {
	res.send("Hello World");
});

const db_test = require("./database/users");
app.get("/testing", async (req, res) => {
	try {
		const result = await db_test.testing();
		console.log("result", result);
		res.send(result);
	} catch (error) {
		console.log(error);
		res.send([]);
	}
});

app.get("/groups", async (req, res) => {
	try {
		const result = await groupsModule.getGroups();
		console.log("result", result);
		res.send(result);
	} catch (error) {
		console.log(error);
		res.send([]);
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

// https.createServer(httpsOptions, app).listen(port, () => {
// 	console.log(`Server is running on https://localhost:${port}`);
// });
