'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const users = await queryInterface.bulkInsert('users', [
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        bio: 'I work at a software company',
        image: 'https://i.pravatar.cc/200?u=john',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: hashedPassword,
        bio: 'Software developer and tech writer',
        image: 'https://i.pravatar.cc/200?u=jane',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Add seed tags
    const tags = await queryInterface.bulkInsert('tags', [
      {
        name: 'nestjs',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'sequelize',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'javascript',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'programming',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'typescript',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Create a function to generate a slug
    const generateSlug = (title) => {
      return title.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') + 
        '-' + 
        (Math.random() * Math.pow(36, 6) | 0).toString(36);
    };

    // Add seed articles
    const articles = await queryInterface.bulkInsert('articles', [
      {
        title: 'Getting Started with NestJS',
        slug: generateSlug('Getting Started with NestJS'),
        description: 'A comprehensive guide to NestJS framework',
        body: 'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. In this article, we will explore the basic concepts of NestJS and set up a simple application.',
        author_id: 1, // John Doe
        favorites_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Sequelize ORM with TypeScript',
        slug: generateSlug('Sequelize ORM with TypeScript'),
        description: 'Learn how to use Sequelize ORM with TypeScript',
        body: 'Sequelize is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server. In this tutorial, we will integrate Sequelize with TypeScript to build a robust backend application.',
        author_id: 2, // Jane Doe
        favorites_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Add seed article tags
    await queryInterface.bulkInsert('article_tags', [
      {
        article_id: 1,
        tag_id: 1, // nestjs
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        article_id: 1,
        tag_id: 5, // typescript
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        article_id: 1,
        tag_id: 4, // programming
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        article_id: 2,
        tag_id: 2, // sequelize
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        article_id: 2,
        tag_id: 5, // typescript
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        article_id: 2,
        tag_id: 3, // javascript
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add seed comments
    await queryInterface.bulkInsert('comments', [
      {
        body: 'Great article! I learned a lot about NestJS.',
        author_id: 2, // Jane Doe
        article_id: 1, // NestJS article
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        body: 'Thanks for sharing this information about Sequelize.',
        author_id: 1, // John Doe
        article_id: 2, // Sequelize article
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add seed follows
    await queryInterface.bulkInsert('user_follows', [
      {
        follower_id: 1, // John follows Jane
        following_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add seed favorites
    await queryInterface.bulkInsert('article_favorites', [
      {
        user_id: 1, // John favorites Jane's article
        article_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Update favorites count
    await queryInterface.sequelize.query(
      `UPDATE articles SET favorites_count = 1 WHERE id = 2`
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove seed data in reverse order
    await queryInterface.bulkDelete('article_favorites', null, {});
    await queryInterface.bulkDelete('user_follows', null, {});
    await queryInterface.bulkDelete('comments', null, {});
    await queryInterface.bulkDelete('article_tags', null, {});
    await queryInterface.bulkDelete('articles', null, {});
    await queryInterface.bulkDelete('tags', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
