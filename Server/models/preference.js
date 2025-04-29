"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Preference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Preference.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
      });
    }
  }
  Preference.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User Id is required" },
          notEmpty: { msg: "User Id is required" },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Location is required" },
          notEmpty: { msg: "Location is required" },
        },
      },
      job: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Job is required" },
          notEmpty: { msg: "Job is required" },
        },
      },
      degree: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Degree is required" },
          notEmpty: { msg: "Degree is required" },
        },
      },
      skill: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Skill is required" },
          notEmpty: { msg: "Skill is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "Preference",
    }
  );
  return Preference;
};
