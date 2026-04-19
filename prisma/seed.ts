import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Clear existing data (order matters due to foreign keys)
    console.log('Clearing existing data...');
    await prisma.comment.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const adminUser = await prisma.user.create({
      data: {
        login: 'admin',
        password: 'admin123',
        role: 'admin',
      },
    });

    const editorUser = await prisma.user.create({
      data: {
        login: 'editor',
        password: 'editor123',
        role: 'editor',
      },
    });

    const viewerUser = await prisma.user.create({
      data: {
        login: 'viewer',
        password: 'viewer123',
        role: 'viewer',
      },
    });

    console.log(
      `Created users: admin (${adminUser.id}), editor (${editorUser.id}), viewer (${viewerUser.id})`,
    );

    // Create categories
    console.log('Creating categories...');
    const categoryTechnology = await prisma.category.create({
      data: {
        name: 'Technology',
        description:
          'Articles about technology, programming, and software development',
      },
    });

    const categoryBusiness = await prisma.category.create({
      data: {
        name: 'Business',
        description:
          'Articles about business strategy, entrepreneurship, and management',
      },
    });

    const categoryLifestyle = await prisma.category.create({
      data: {
        name: 'Lifestyle',
        description:
          'Articles about lifestyle, wellness, and personal development',
      },
    });

    console.log(`Created categories: Technology, Business, Lifestyle`);

    // Create tags
    console.log('Creating tags...');
    const tags = await Promise.all([
      prisma.tag.create({ data: { name: 'JavaScript' } }),
      prisma.tag.create({ data: { name: 'TypeScript' } }),
      prisma.tag.create({ data: { name: 'React' } }),
      prisma.tag.create({ data: { name: 'NestJS' } }),
      prisma.tag.create({ data: { name: 'Database' } }),
    ]);

    console.log(`Created tags: ${tags.map((t) => t.name).join(', ')}`);

    // Create articles with different statuses
    console.log('Creating articles...');
    const article1 = await prisma.article.create({
      data: {
        title: 'Getting Started with NestJS',
        content:
          'Learn how to build scalable server-side applications using NestJS framework.',
        status: 'published',
        authorId: editorUser.id,
        categoryId: categoryTechnology.id,
        tags: {
          connect: [{ id: tags[3].id }, { id: tags[0].id }], // NestJS, JavaScript
        },
      },
    });

    const article2 = await prisma.article.create({
      data: {
        title: 'TypeScript Best Practices',
        content:
          'Master TypeScript with these essential best practices and design patterns.',
        status: 'published',
        authorId: editorUser.id,
        categoryId: categoryTechnology.id,
        tags: {
          connect: [{ id: tags[1].id }, { id: tags[4].id }], // TypeScript, Database
        },
      },
    });

    const article3 = await prisma.article.create({
      data: {
        title: 'Building Reactive UIs with React',
        content:
          'Discover how to create modern, interactive user interfaces using React.',
        status: 'published',
        authorId: adminUser.id,
        categoryId: categoryTechnology.id,
        tags: {
          connect: [{ id: tags[2].id }, { id: tags[0].id }], // React, JavaScript
        },
      },
    });

    await prisma.article.create({
      data: {
        title: 'Startup Growth Strategies That Work',
        content:
          'Proven strategies for scaling your startup from zero to success.',
        status: 'draft',
        authorId: adminUser.id,
        categoryId: categoryBusiness.id,
        tags: {
          connect: [{ id: tags[4].id }], // Database
        },
      },
    });

    await prisma.article.create({
      data: {
        title: 'Wellness and Productivity in Remote Work',
        content:
          'Tips and tricks for maintaining health and productivity while working from home.',
        status: 'archived',
        authorId: editorUser.id,
        categoryId: categoryLifestyle.id,
        tags: {
          connect: [{ id: tags[0].id }], // JavaScript (just for demo)
        },
      },
    });

    console.log(
      `Created 5 articles with different statuses (published, draft, archived)`,
    );

    // Create comments
    console.log('Creating comments...');
    await prisma.comment.create({
      data: {
        content:
          'Great introduction to NestJS! Very helpful. Thank you for sharing.',
        authorId: viewerUser.id,
        articleId: article1.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'I would like more examples of advanced TypeScript features.',
        authorId: adminUser.id,
        articleId: article2.id,
      },
    });
    await prisma.comment.create({
      data: {
        content:
          'The React section was exactly what I needed to understand hooks better.',
        authorId: editorUser.id,
        articleId: article3.id,
      },
    });

    console.log(`Created 3 comments`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
