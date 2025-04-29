"use strict";

const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "rafal@mail.com",
          password: hashPassword("123456"),
          name: "Rafal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "zalvin@gmail.com",
          password: hashPassword("123456"),
          name: "Zalvin Punjabi",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
