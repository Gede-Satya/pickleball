-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `club` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `postId` INTEGER NOT NULL,

    INDEX `Comment_postId_fkey`(`postId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `pesan` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groupmatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `player1Name` VARCHAR(191) NOT NULL,
    `player2Name` VARCHAR(191) NOT NULL,
    `score1` INTEGER NULL,
    `score2` INTEGER NULL,
    `winnerName` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'ONGOING', 'DONE') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupMatch_groupId_idx`(`groupId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groupmember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `seedOrder` INTEGER NOT NULL DEFAULT 0,
    `played` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `pointsFor` INTEGER NOT NULL DEFAULT 0,
    `pointsAgainst` INTEGER NOT NULL DEFAULT 0,
    `pointDiff` INTEGER NOT NULL DEFAULT 0,
    `rank` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupMember_groupId_idx`(`groupId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knockoutmatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `roundText` VARCHAR(191) NOT NULL,
    `matchOrder` INTEGER NOT NULL,
    `player1Name` VARCHAR(191) NULL,
    `player2Name` VARCHAR(191) NULL,
    `score1` INTEGER NULL,
    `score2` INTEGER NULL,
    `winnerName` VARCHAR(191) NULL,
    `nextMatchId` INTEGER NULL,
    `status` ENUM('SCHEDULED', 'ONGOING', 'DONE') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KnockoutMatch_tournamentId_category_idx`(`tournamentId` ASC, `category` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tournamentId` INTEGER NOT NULL,
    `seedOrder` INTEGER NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `grade` ENUM('SD', 'SMP', 'SMA') NOT NULL,
    `matchType` ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL,
    `teamId` INTEGER NULL,

    INDEX `Player_teamId_fkey`(`teamId` ASC),
    INDEX `Player_tournamentId_fkey`(`tournamentId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `poolCode` VARCHAR(191) NOT NULL,
    `categoryKey` VARCHAR(191) NOT NULL,
    `grade` ENUM('SD', 'SMP', 'SMA') NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `matchType` ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL,
    `maxSize` INTEGER NOT NULL DEFAULT 8,
    `status` ENUM('OPEN', 'FULL', 'COMPLETED') NOT NULL DEFAULT 'OPEN',
    `tournamentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pool_tournamentId_categoryKey_idx`(`tournamentId` ASC, `categoryKey` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poolmatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poolId` INTEGER NOT NULL,
    `member1Id` INTEGER NOT NULL,
    `member2Id` INTEGER NOT NULL,
    `score1` INTEGER NULL,
    `score2` INTEGER NULL,
    `winnerId` INTEGER NULL,
    `winnerName` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'ONGOING', 'DONE') NOT NULL DEFAULT 'SCHEDULED',
    `matchOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PoolMatch_member1Id_fkey`(`member1Id` ASC),
    INDEX `PoolMatch_member2Id_fkey`(`member2Id` ASC),
    INDEX `PoolMatch_poolId_idx`(`poolId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poolmember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poolId` INTEGER NOT NULL,
    `memberName` VARCHAR(191) NOT NULL,
    `playerId` INTEGER NULL,
    `teamId` INTEGER NULL,
    `played` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `pointsFor` INTEGER NOT NULL DEFAULT 0,
    `pointsAgainst` INTEGER NOT NULL DEFAULT 0,
    `pointDiff` INTEGER NOT NULL DEFAULT 0,
    `rank` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PoolMember_playerId_fkey`(`playerId` ASC),
    INDEX `PoolMember_poolId_idx`(`poolId` ASC),
    INDEX `PoolMember_teamId_fkey`(`teamId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `authorId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Post_authorId_fkey`(`authorId` ASC),
    INDEX `Post_categoryId_fkey`(`categoryId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `matchType` ENUM('SINGLE', 'DOUBLE', 'MIXED') NOT NULL,
    `grade` ENUM('SD', 'SMP', 'SMA') NOT NULL,
    `categoryKey` VARCHAR(191) NOT NULL,
    `tournamentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Team_tournamentId_categoryKey_idx`(`tournamentId` ASC, `categoryKey` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `registrationFee` INTEGER NOT NULL DEFAULT 0,
    `prizePool` VARCHAR(191) NULL,
    `maxParticipants` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `category` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `poolSize` INTEGER NOT NULL DEFAULT 8,

    UNIQUE INDEX `Tournament_slug_key`(`slug` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournamentgroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tournamentId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TournamentGroup_tournamentId_category_idx`(`tournamentId` ASC, `category` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groupmatch` ADD CONSTRAINT `GroupMatch_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `tournamentgroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groupmember` ADD CONSTRAINT `GroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `tournamentgroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knockoutmatch` ADD CONSTRAINT `KnockoutMatch_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player` ADD CONSTRAINT `Player_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player` ADD CONSTRAINT `Player_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pool` ADD CONSTRAINT `Pool_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmatch` ADD CONSTRAINT `PoolMatch_member1Id_fkey` FOREIGN KEY (`member1Id`) REFERENCES `poolmember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmatch` ADD CONSTRAINT `PoolMatch_member2Id_fkey` FOREIGN KEY (`member2Id`) REFERENCES `poolmember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmatch` ADD CONSTRAINT `PoolMatch_poolId_fkey` FOREIGN KEY (`poolId`) REFERENCES `pool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmember` ADD CONSTRAINT `PoolMember_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmember` ADD CONSTRAINT `PoolMember_poolId_fkey` FOREIGN KEY (`poolId`) REFERENCES `pool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poolmember` ADD CONSTRAINT `PoolMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team` ADD CONSTRAINT `Team_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournamentgroup` ADD CONSTRAINT `TournamentGroup_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

