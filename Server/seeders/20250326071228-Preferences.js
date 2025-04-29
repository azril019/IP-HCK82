"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Preferences",
      [
        {
          userId: 1,
          location: "Jakarta",
          job: "Software Engineer",
          degree: "S1",
          skill: "JavaScript, Python, Java, C++",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 2,
          location: "Bandung",
          job: "D4",
          degree: "Master",
          skill: "Python, R, SQL, Machine Learning",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Preferences", null, {});
  },
};
