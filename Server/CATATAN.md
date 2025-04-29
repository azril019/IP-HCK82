CREATE TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
name VARCHAR(255) NOT NULL,
birthdate DATE NOT NULL
domicile VARCHAR NOT NULL
);

CREATE TABLE experiences (
id SERIAL PRIMARY KEY,
user_id INT NOT NULL,
job VARCHAR(255) NOT NULL,
start_date DATE NOT NULL,
end_date DATE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE educations (
id SERIAL PRIMARY KEY,
user_id INT NOT NULL,
school VARCHAR(255) NOT NULL,
degree VARCHAR(255) NOT NULL,
start_date DATE NOT NULL,
end_date DATE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE skills (
id SERIAL PRIMARY KEY,
user_id INT NOT NULL,
skill VARCHAR(255) NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

{
"educations": [
{"level": "S1", "institution": "ITB", "major": "IT", "gpa": 3.6, "startDate": 2016, "endDate": 2020 }
],
"experiences": [
{ "company": "PT. SRI", "position": "Software Engineer", "start_date": 2021, "end_date": 2023 }
],
"skills": [
{ "name": "JavaScript" }
]
}

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      level: {
        type: Sequelize.STRING,
      },
      institution: {
        type: Sequelize.STRING,
      },
      major: {
        type: Sequelize.STRING,
      },
      gpa: {
        type: Sequelize.FLOAT,
      },
      startDate: {
        type: Sequelize.INTEGER,
      },
      endDate: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
