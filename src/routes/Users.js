const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Utility function to generate JWT token
const generateToken = (user) => {
	const tokenData = {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
	};

	return jwt.sign(tokenData, process.env.TOKEN_SECRET, {
		expiresIn: "3d",
	});
};

// Register route
router.post(
	"/register",
	[
		body("name").notEmpty().withMessage("Name is required"),
		body("email").isEmail().withMessage("Valid email is required"),
		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long"),
	],
	asyncHandler(async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		const existingUser = await Users.findOne({ where: { email } });

		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await Users.create({
			name,
			email,
			password: hashedPassword,
		});

		const createdUser = await Users.findOne({
			where: { email },
			attributes: { exclude: ["password"] },
		});

		if (!createdUser) {
			return res
				.status(500)
				.json({ message: "Something went wrong while creating user" });
		}

		const token = generateToken(createdUser);

		res.json({ jwt_token: token, user: createdUser });
	})
);

// Login route
router.post(
	"/login",
	[
		body("email").isEmail().withMessage("Valid email is required"),
		body("password").notEmpty().withMessage("Password is required"),
	],
	asyncHandler(async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		const user = await Users.findOne({ where: { email } });

		if (!user) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (user.role !== "user") {
			return res.status(403).json({ message: "Unauthorized access" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const loggedInUser = await Users.findOne({
			where: { email },
			attributes: { exclude: ["password", "createdAt", "updatedAt"] },
		});

		if (!loggedInUser) {
			return res
				.status(500)
				.json({ message: "Something went wrong while logging in" });
		}

		const token = generateToken(loggedInUser);

		res.json({ jwt_token: token, user: loggedInUser });
	})
);

// Verify token route
router.get(
	"/verify-token",
	asyncHandler(async (req, res) => {
		const token = req.headers["authorization"]?.split(" ")[1];
		if (!token) {
			res.header("Cache-Control", "no-store");
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
			const user = await Users.findOne({
				where: { id: decoded.user.id },
				attributes: { exclude: ["password", "createdAt", "updatedAt"] },
			});

			if (!user) {
				res.header("Cache-Control", "no-store");
				return res.status(401).json({ message: "Unauthorized" });
			}

			res.json({ user });
		} catch (err) {
			res.header("Cache-Control", "no-store");
			return res.status(401).json({ message: "Unauthorized" });
		}
	})
);

// Logout route
router.post("/logout", (req, res) => {
	res.json({ message: "User logged out" });
});

module.exports = router;
