const express = require("express");
const router = express.Router();
const { Tasks, Users } = require("../models");
const { body, param, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Utility function to handle validation errors
const handleValidationErrors = (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
};

// Create Task
router.post(
	"/create",
	[
		body("title").notEmpty().withMessage("Title is required"),
		body("dueDate").notEmpty().withMessage("Due date is required"),
		body("userId").notEmpty().withMessage("User ID is required"),
	],
	asyncHandler(async (req, res) => {
		handleValidationErrors(req, res);

		const { title, description, priority, status, dueDate, userId } =
			req.body;

		const userExists = await Users.findByPk(userId);

		if (!userExists) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (userExists.role !== "user") {
			return res.status(403).json({ message: "Unauthorized access" });
		}

		const createdTask = await Tasks.create({
			title,
			description,
			priority,
			status,
			dueDate,
			userId,
		});

		if (!createdTask) {
			return res
				.status(500)
				.json({ message: "Something went wrong while creating task" });
		}

		res.status(201).json(createdTask);
	})
);

// Get All Tasks for a User
router.get(
	"/all/:userId",
	[param("userId").notEmpty().withMessage("User ID is required")],
	asyncHandler(async (req, res) => {
		handleValidationErrors(req, res);

		const { userId } = req.params;

		const userExists = await Users.findByPk(userId);

		if (!userExists) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (userExists.role !== "user") {
			return res.status(403).json({ message: "Unauthorized access" });
		}

		const tasks = await Tasks.findAll({ where: { userId } });

		if (!tasks) {
			return res.status(404).json({ message: "No tasks found" });
		}

		res.json(tasks);
	})
);

// Edit Task
router.put(
	"/edit/:id",
	[
		param("id").notEmpty().withMessage("Task ID is required"),
		body("title").notEmpty().withMessage("Title is required"),
		body("dueDate").notEmpty().withMessage("Due date is required"),
		body("userId").notEmpty().withMessage("User ID is required"),
	],
	asyncHandler(async (req, res) => {
		handleValidationErrors(req, res);

		const { id } = req.params;
		const { title, description, priority, status, dueDate, userId } =
			req.body;

		const taskExist = await Tasks.findByPk(id);

		if (!taskExist) {
			return res.status(404).json({ message: "Task does not exist" });
		}

		const userExists = await Users.findByPk(userId);

		if (!userExists) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (userExists.role !== "user") {
			return res.status(403).json({ message: "Unauthorized access" });
		}

		const updatedTask = await Tasks.update(
			{
				title,
				description,
				priority,
				status,
				dueDate,
				userId,
			},
			{ where: { id } }
		);

		if (!updatedTask) {
			return res
				.status(500)
				.json({ message: "Something went wrong while updating task" });
		}

		res.status(200).json({ message: "Task updated successfully" });
	})
);

// Delete Task
router.delete(
	"/delete/:id",
	[param("id").notEmpty().withMessage("Task ID is required")],
	asyncHandler(async (req, res) => {
		handleValidationErrors(req, res);

		const { id } = req.params;

		const taskExist = await Tasks.findByPk(id);

		if (!taskExist) {
			return res.status(404).json({ message: "Task does not exist" });
		}

		const userExists = await Users.findByPk(taskExist.userId);

		if (!userExists) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (userExists.role !== "user") {
			return res.status(403).json({ message: "Unauthorized access" });
		}

		await Tasks.destroy({ where: { id } });

		res.status(200).json({ message: "Task deleted successfully" });
	})
);

module.exports = router;
