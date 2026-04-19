-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now()))::int,
ALTER COLUMN "updatedAt" SET DEFAULT (EXTRACT(EPOCH FROM now()))::int;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now()))::int;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT (EXTRACT(EPOCH FROM now()))::int,
ALTER COLUMN "updatedAt" SET DEFAULT (EXTRACT(EPOCH FROM now()))::int;
