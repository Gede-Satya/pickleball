-- AlterTable
ALTER TABLE `player` MODIFY `grade` ENUM('SD', 'SMP', 'SMA', 'OPEN', 'U11', 'U13', 'U15', 'U17', 'U19', 'U21') NOT NULL;

-- AlterTable
ALTER TABLE `pool` MODIFY `grade` ENUM('SD', 'SMP', 'SMA', 'OPEN', 'U11', 'U13', 'U15', 'U17', 'U19', 'U21') NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmatch` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmember` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `team` MODIFY `grade` ENUM('SD', 'SMP', 'SMA', 'OPEN', 'U11', 'U13', 'U15', 'U17', 'U19', 'U21') NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `tournament` ADD COLUMN `gradeOptions` VARCHAR(191) NULL;