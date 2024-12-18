require("./utils");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const port = process.env.PORT || 3000;

const app = express();

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const databaseTablesModule = require("./database/create_tables");

const { verifyToken } = require("./utils");

const authRouter = require("./routes/auth");
const groupRouter = require("./routes/group");
const expensesRouter = require("./routes/expenses");
const settleUpRouter = require("./routes/settleUp");
const usersRouter = require("./routes/users");
const invitationRouter = require("./routes/invitations");

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

app.use("/auth", authRouter);
app.use("/groups", groupRouter);
app.use("/expenses", expensesRouter);
app.use("/settle", settleUpRouter);
app.use("/users", verifyToken, usersRouter);
app.use("/invitations", verifyToken, invitationRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
