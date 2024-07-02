module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define("Users", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "user",
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});

	return Users;
};
