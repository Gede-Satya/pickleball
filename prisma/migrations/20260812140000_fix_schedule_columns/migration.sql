-- Perbaikan drift: kolom jadwal tidak terbuat saat migrasi match_schedule tercatat applied
ALTER TABLE `poolmatch` ADD COLUMN `court` VARCHAR(191) NULL,
    ADD COLUMN `startTime` DATETIME(3) NULL;
ALTER TABLE `knockoutmatch` ADD COLUMN `court` VARCHAR(191) NULL,
    ADD COLUMN `startTime` DATETIME(3) NULL;