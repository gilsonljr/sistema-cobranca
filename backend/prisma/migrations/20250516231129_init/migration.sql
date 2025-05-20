-- DropForeignKey
ALTER TABLE `billinghistory` DROP FOREIGN KEY `BillingHistory_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `billinghistory` DROP FOREIGN KEY `BillingHistory_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_collectorId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_sellerId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `Settings_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_tenantId_fkey`;

-- DropIndex
DROP INDEX `BillingHistory_createdById_fkey` ON `billinghistory`;

-- DropIndex
DROP INDEX `BillingHistory_orderId_fkey` ON `billinghistory`;

-- DropIndex
DROP INDEX `Order_orderNumber_tenantId_idx` ON `order`;

-- DropIndex
DROP INDEX `User_tenantId_fkey` ON `user`;

-- CreateIndex
CREATE INDEX `Order_status_idx` ON `Order`(`status`);

-- CreateIndex
CREATE INDEX `Order_createdAt_idx` ON `Order`(`createdAt`);

-- CreateIndex
CREATE FULLTEXT INDEX `Order_customerName_customerPhone_customerAddress_idx` ON `Order`(`customerName`, `customerPhone`, `customerAddress`);

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_collectorId_fkey` TO `Order_collectorId_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_sellerId_fkey` TO `Order_sellerId_idx`;

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_tenantId_fkey` TO `Order_tenantId_idx`;
