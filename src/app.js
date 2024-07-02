const express = require("express");
const cors = require("cors");
const app = express();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// Middleware
app.use(helmet());
app.use(
	cors({
		exposedHeaders: ["Authorization"],
		origin: process.env.CORS_ORIGIN || "*",
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Routes Import
const taskRouter = require("./routes/Tasks.js");
const userRouter = require("./routes/Users.js");

// Routes
app.use("/api/v1/tasks", taskRouter);
app.use("/api/auth", userRouter);

// Error Handling
app.use((req, res, next) => {
	const error = new Error("Not Found");
	error.status = 404;
	next(error);
});
app.use((error, req, res, next) => {
	res.status(error.status || 500).json({
		error: {
			message: error.message,
		},
	});
});

module.exports = { app };
