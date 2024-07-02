const dotenv = require("dotenv");
const http = require("http");

dotenv.config({
	path: "./.env",
});

const db = require("./models/index.js");
const { app } = require("./app.js");

let server;

// const { Users } = require("./models");
// Users.sync({ alter: true })
// 	.then(() => console.log("Users table has been updated."))
// 	.catch(console.error);

// const { Tasks } = require("./models");
// Tasks.sync({ alter: true })
// 	.then(() => console.log("Tasks table has been updated."))
// 	.catch(console.error);

db.sequelize
	.sync()
	.then(() => {
		console.log("Database connected!");
		const h_server = http.createServer(app);
		server = h_server.listen(process.env.PORT || 5000, () => {
			console.log(`⚙️  Server running on port : ${process.env.PORT}`);
		});
	})
	.catch((err) => {
		console.error("Error connecting to the database: ", err);
	});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			console.log("Server closed");
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (error) => {
	console.error(error);
	exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
	console.info("SIGTERM received");
	if (server) {
		server.close();
	}
});
