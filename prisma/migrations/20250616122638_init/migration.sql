/*
  Warnings:

  - You are about to drop the column `availableFrom` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `availableTo` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seasonEnd` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seasonStart` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `CategoryPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryPromotion" DROP CONSTRAINT "CategoryPromotion_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryPromotion" DROP CONSTRAINT "CategoryPromotion_promotionId_fkey";

-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "availableFrom",
DROP COLUMN "availableTo",
DROP COLUMN "displayOrder",
DROP COLUMN "parentId",
DROP COLUMN "seasonEnd",
DROP COLUMN "seasonStart",
DROP COLUMN "slug",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "CategoryPromotion";

-- DropTable
DROP TABLE "Promotion";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "resetToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "menuItemId" TEXT NOT NULL,
    "priceAdd" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuVariant" ADD CONSTRAINT "MenuVariant_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
