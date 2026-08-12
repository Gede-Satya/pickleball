-- AlterTable
ALTER TABLE `player` ADD COLUMN `paymentConfirmedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('TRANSFER', 'QRIS', 'EWALLET', 'VENUE') NULL,
    ADD COLUMN `paymentOrderId` VARCHAR(191) NULL,
    ADD COLUMN `paymentProof` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PAID') NULL;

-- AlterTable
ALTER TABLE `pool` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmatch` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `poolmember` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `team` ADD COLUMN `paymentConfirmedAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('TRANSFER', 'QRIS', 'EWALLET', 'VENUE') NULL,
    ADD COLUMN `paymentOrderId` VARCHAR(191) NULL,
    ADD COLUMN `paymentProof` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PAID') NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

