"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("destinations", [
      {
        id: uuidv4(),
        name: "Oman",
        slug: "oman",
        description:
          "Desert sunsets, wadis, and mountain escapes — calm luxury with rich culture. Experience the untouched beauty of Arabian landscapes and world-class hospitality.",
        image:
          "https://res.cloudinary.com/traveon/image/upload/v1/destinations/oman.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Seychelles",
        slug: "seychelles",
        description:
          "Crystal beaches, island serenity, and slow mornings — perfect for a true reset. Discover pristine waters and tropical paradise like nowhere else on Earth.",
        image:
          "https://res.cloudinary.com/traveon/image/upload/v1/destinations/seychelles.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Vietnam",
        slug: "vietnam",
        description:
          "Heritage towns, scenic bays, and vibrant streets — nature and energy in one trip. Immerse yourself in culture, cuisine, and stunning natural wonders.",
        image:
          "https://res.cloudinary.com/traveon/image/upload/v1/destinations/vietnam.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("destinations", null, {});
  },
};
