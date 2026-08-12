-- AlterTable
ALTER TABLE `player` MODIFY `grade` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pool` MODIFY `grade` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmatch` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmember` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `team` MODIFY `grade` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
