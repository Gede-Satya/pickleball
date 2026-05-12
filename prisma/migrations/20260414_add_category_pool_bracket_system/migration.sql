-- ============================================================
-- Migration: add_category_pool_bracket_system
-- Tanggal: 2026-04-14
-- Deskripsi: Tambah sistem kategori pemain (Gender/Grade/MatchType),
--            Team, Pool, PoolMember, PoolMatch
-- ============================================================

-- STEP 1: Update data Player lama agar tidak NULL sebelum ALTER TABLE
-- (Data lama diisi dengan default sementara)
UPDATE `player` SET `gender` = 'MALE'   WHERE `gender` IS NULL OR `gender` = '';
UPDATE `player` SET `grade`  = 'SMA'    WHERE `grade`  IS NULL OR `grade`  = '';

-- STEP 2: Hapus kolom lama yang diganti
ALTER TABLE `player` DROP COLUMN `category`;

-- STEP 3: Alter kolom gender & grade ke ENUM NOT NULL
ALTER TABLE `player`
    MODIFY `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    MODIFY `grade`  ENUM('SD', 'SMP', 'SMA') NOT NULL DEFAULT 'SMA';

-- STEP 4: Tambah kolom matchType & teamId ke Player
ALTER TABLE `player`
    ADD COLUMN `matchType` ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL DEFAULT 'SINGLE',
    ADD COLUMN `teamId` INTEGER NULL;

-- Hapus default setelah penambahan kolom (agar konsisten dgn schema Prisma)
ALTER TABLE `player`
    ALTER COLUMN `gender` DROP DEFAULT,
    ALTER COLUMN `grade`  DROP DEFAULT,
    ALTER COLUMN `matchType` DROP DEFAULT;

-- STEP 5: Tambah poolSize ke Tournament
ALTER TABLE `tournament`
    ADD COLUMN `poolSize` INTEGER NOT NULL DEFAULT 8;

-- STEP 6: Buat tabel Team
CREATE TABLE IF NOT EXISTS `Team` (
    `id`           INTEGER      NOT NULL AUTO_INCREMENT,
    `name`         VARCHAR(191) NOT NULL,
    `matchType`    ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL,
    `grade`        ENUM('SD', 'SMP', 'SMA') NOT NULL,
    `categoryKey`  VARCHAR(191) NOT NULL,
    `tournamentId` INTEGER      NOT NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `Team_tournamentId_categoryKey_idx`(`tournamentId`, `categoryKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 7: Buat tabel Pool
CREATE TABLE IF NOT EXISTS `Pool` (
    `id`           INTEGER      NOT NULL AUTO_INCREMENT,
    `label`        VARCHAR(191) NOT NULL,
    `poolCode`     VARCHAR(191) NOT NULL,
    `categoryKey`  VARCHAR(191) NOT NULL,
    `grade`        ENUM('SD', 'SMP', 'SMA') NOT NULL,
    `gender`       ENUM('MALE', 'FEMALE')   NULL,
    `matchType`    ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL,
    `maxSize`      INTEGER      NOT NULL DEFAULT 8,
    `status`       ENUM('OPEN', 'FULL', 'COMPLETED') NOT NULL DEFAULT 'OPEN',
    `tournamentId` INTEGER      NOT NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `Pool_tournamentId_categoryKey_idx`(`tournamentId`, `categoryKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 8: Buat tabel PoolMember
CREATE TABLE IF NOT EXISTS `PoolMember` (
    `id`            INTEGER      NOT NULL AUTO_INCREMENT,
    `poolId`        INTEGER      NOT NULL,
    `memberName`    VARCHAR(191) NOT NULL,
    `playerId`      INTEGER      NULL,
    `teamId`        INTEGER      NULL,
    `played`        INTEGER      NOT NULL DEFAULT 0,
    `wins`          INTEGER      NOT NULL DEFAULT 0,
    `losses`        INTEGER      NOT NULL DEFAULT 0,
    `pointsFor`     INTEGER      NOT NULL DEFAULT 0,
    `pointsAgainst` INTEGER      NOT NULL DEFAULT 0,
    `pointDiff`     INTEGER      NOT NULL DEFAULT 0,
    `rank`          INTEGER      NULL,
    `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `PoolMember_poolId_idx`(`poolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 9: Buat tabel PoolMatch
CREATE TABLE IF NOT EXISTS `PoolMatch` (
    `id`         INTEGER      NOT NULL AUTO_INCREMENT,
    `poolId`     INTEGER      NOT NULL,
    `member1Id`  INTEGER      NOT NULL,
    `member2Id`  INTEGER      NOT NULL,
    `score1`     INTEGER      NULL,
    `score2`     INTEGER      NULL,
    `winnerId`   INTEGER      NULL,
    `winnerName` VARCHAR(191) NULL,
    `status`     ENUM('SCHEDULED', 'ONGOING', 'DONE') NOT NULL DEFAULT 'SCHEDULED',
    `matchOrder` INTEGER      NOT NULL DEFAULT 0,
    `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `PoolMatch_poolId_idx`(`poolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 10: Foreign Keys

-- Player → Team
ALTER TABLE `Player`
    ADD CONSTRAINT `Player_teamId_fkey`
    FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Team → Tournament
ALTER TABLE `Team`
    ADD CONSTRAINT `Team_tournamentId_fkey`
    FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Pool → Tournament
ALTER TABLE `Pool`
    ADD CONSTRAINT `Pool_tournamentId_fkey`
    FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PoolMember → Pool
ALTER TABLE `PoolMember`
    ADD CONSTRAINT `PoolMember_poolId_fkey`
    FOREIGN KEY (`poolId`) REFERENCES `Pool`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PoolMember → Player
ALTER TABLE `PoolMember`
    ADD CONSTRAINT `PoolMember_playerId_fkey`
    FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- PoolMember → Team
ALTER TABLE `PoolMember`
    ADD CONSTRAINT `PoolMember_teamId_fkey`
    FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- PoolMatch → Pool
ALTER TABLE `PoolMatch`
    ADD CONSTRAINT `PoolMatch_poolId_fkey`
    FOREIGN KEY (`poolId`) REFERENCES `Pool`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PoolMatch → PoolMember (member1)
ALTER TABLE `PoolMatch`
    ADD CONSTRAINT `PoolMatch_member1Id_fkey`
    FOREIGN KEY (`member1Id`) REFERENCES `PoolMember`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- PoolMatch → PoolMember (member2)
ALTER TABLE `PoolMatch`
    ADD CONSTRAINT `PoolMatch_member2Id_fkey`
    FOREIGN KEY (`member2Id`) REFERENCES `PoolMember`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
