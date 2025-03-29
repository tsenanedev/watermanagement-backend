-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema watermanagement
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema watermanagement
-- -----------------------------------------------------
-- CREATE SCHEMA IF NOT EXISTS `watermanagement` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema watermanagement
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema watermanagement
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `watermanagement` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `watermanagement` ;

-- -----------------------------------------------------
-- Table `watermanagement`.`provinces`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`provinces` (
  `id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`districts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`districts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `provinceId` INT NOT NULL,
  `provinces_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE  `nome` (`name` ASC) ,
  INDEX `fk_districts_provinces1_idx` (`provinces_id` ASC) ,
  CONSTRAINT `fk_districts_provinces1`
    FOREIGN KEY (`provinces_id`)
    REFERENCES `watermanagement`.`provinces` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 162
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`operators`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`operators` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  deletedAt timestamp NOT NULL,
  createdAt timestamp NOT NULL,
  deletedAt	timestamp NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`bankAccounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`bankAccounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bankId` INT NOT NULL,
  `accountNumber` VARCHAR(100) NOT NULL,
  `companyId` VARCHAR(100) NOT NULL,
  `status` VARCHAR(10) NOT NULL,
  `createdAt` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `accountNumber` (`accountNumber` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`system_suppliers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`system_suppliers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `districts_id` INT NOT NULL,
  `operators_id` INT NOT NULL,
  `accounts_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `fk_system_suppliers_districts_idx` (`districts_id` ASC) ,
  INDEX `fk_system_suppliers_operators1_idx` (`operators_id` ASC) ,
  INDEX `fk_system_suppliers_accounts1_idx` (`accounts_id` ASC) ,
  CONSTRAINT `fk_system_suppliers_districts`
    FOREIGN KEY (`districts_id`)
    REFERENCES `watermanagement`.`districts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_system_suppliers_operators1`
    FOREIGN KEY (`operators_id`)
    REFERENCES `watermanagement`.`operators` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_system_suppliers_accounts1`
    FOREIGN KEY (`accounts_id`)
    REFERENCES `watermanagement`.`bankAccounts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`readings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`readings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(25) NOT NULL,
  `receiptNumber` INT NOT NULL,
  `last` FLOAT NOT NULL DEFAULT '0',
  `current` FLOAT NULL DEFAULT '0',
  `consumption` FLOAT NOT NULL,
  `system_supplier_id` INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `takenAt` TEXT NOT NULL,
  `createdAt` TEXT NOT NULL,
  `consumptionPeriod` VARCHAR(25) NULL DEFAULT NULL,
  `staffName` VARCHAR(100) NULL DEFAULT NULL,
  `updatedBy` TEXT NULL DEFAULT NULL,
  `status` INT NOT NULL,
  `readingStatus` INT NOT NULL,
  `waterMeterImageUrl` TEXT NULL DEFAULT NULL,
  `lat` VARCHAR(45) NULL DEFAULT NULL,
  `lng` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniqueBillId` (`uniqueBillId` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 96595
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

-- -----------------------------------------------------
-- Table `watermanagement`.`billing`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`billing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  code  VARCHAR(100) NOT NULL,
  `createdAt` DATE NOT NULL,
  `readings_id` INT NOT NULL,
  `tarrif_type_id` INT NOT NULL,\
   `forfeit` FLOAT NOT NULL,
  `tarrifTypeId` INT NOT NULL,
  `dataEmissao` VARCHAR(25) NULL DEFAULT NULL,
  `dataLimite` VARCHAR(30) NULL DEFAULT NULL,
  `subTotal` FLOAT NULL DEFAULT NULL,
  `vat` FLOAT NULL DEFAULT NULL,
  `totalOfBill` FLOAT NULL DEFAULT NULL,
  `staffName` VARCHAR(100) NULL DEFAULT NULL,
   `consumoFacturado` INT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `fk_billing_readings1_idx` (`readings_id` ASC) ,
  INDEX `fk_billing_tarrif_type1_idx` (`tarrif_type_id` ASC) ,
  CONSTRAINT `fk_billing_readings1`
    FOREIGN KEY (`readings_id`)
    REFERENCES `watermanagement`.`readings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_billing_tarrif_type1`
    FOREIGN KEY (`tarrif_type_id`)
    REFERENCES `watermanagement`.`tarrif_type` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `watermanagement`.`tarrifs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`tarrifs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tarrifTypeId` INT NOT NULL,
  `serviceAvailabilityFee` FLOAT NULL DEFAULT '0',
  `pricePerMeterCubic` FLOAT NULL DEFAULT '0',
  `socialTire` FLOAT NOT NULL,
  `firstFive` FLOAT NOT NULL,
  `firstSeven` FLOAT NULL DEFAULT '0',
  `aboveSeven` FLOAT NOT NULL,
  `firstFifteen` FLOAT NOT NULL,
  `aboveFifteen` FLOAT NOT NULL,
  `createdAt` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `tarrifTypeId` (`tarrifTypeId` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 47
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `watermanagement`.`tarrif_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`tarrif_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(25) NOT NULL,
  `tarrifs_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_tarrif_type_tarrifs1_idx` (`tarrifs_id` ASC) ,
  CONSTRAINT `fk_tarrif_type_tarrifs1`
    FOREIGN KEY (`tarrifs_id`)
    REFERENCES `watermanagement`.`tarrifs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

-- -----------------------------------------------------
-- Table `watermanagement`.`debts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`debts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(50) NOT NULL,
  `readingId` INT NOT NULL,
  `amount` FLOAT NOT NULL,
  `tarrifTypeId` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `status` INT NOT NULL,
  `branchId` INT NOT NULL,
  `staffName` VARCHAR(100) NOT NULL,
  `createdAt` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 12405
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `watermanagement`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customerName` VARCHAR(255) NOT NULL,
  `barcode` VARCHAR(50) NOT NULL,
  `tarrifTypeId` VARCHAR(50) NOT NULL,
  `totalPaid` FLOAT NOT NULL,
  `reference` VARCHAR(30) NOT NULL,
  `phoneNumber` TEXT NOT NULL,
  `smsDetails` TEXT NOT NULL,
  `staffName` VARCHAR(100) NOT NULL,
  `paymentMethod` INT NOT NULL,
  `dateOfPayment` VARCHAR(50) NOT NULL,
  `createdAt` VARCHAR(50) NULL DEFAULT NULL,
  `debts_id` INT NOT NULL,
  `readings_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reference` (`reference` ASC) ,
  INDEX `fk_payments_debts1_idx` (`debts_id` ASC) ,
  INDEX `fk_payments_readings1_idx` (`readings_id` ASC) ,
  CONSTRAINT `fk_payments_debts1`
    FOREIGN KEY (`debts_id`)
    REFERENCES `watermanagement`.`debts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_payments_readings1`
    FOREIGN KEY (`readings_id`)
    REFERENCES `watermanagement`.`readings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 86995
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`billing_payment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`billing_payment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATE NOT NULL,
  `payments_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `fk_billing_payment_payments1_idx` (`payments_id` ASC) ,
  CONSTRAINT `fk_billing_payment_payments1`
    FOREIGN KEY (`payments_id`)
    REFERENCES `watermanagement`.`payments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `createdA` DATE NOT NULL,
  `table_name` VARCHAR(45) NOT NULL,
  table_name VARCHAR(45) NOT NULL
  `table_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idaccessLevel_UNIQUE` (`id` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`roles_has_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`roles_has_permissions` (
  `roles_id` INT NOT NULL,
  `permissions_id` INT NOT NULL,
  PRIMARY KEY (`roles_id`, `permissions_id`),
  INDEX `fk_roles_has_permissions_permissions1_idx` (`permissions_id` ASC) ,
  INDEX `fk_roles_has_permissions_roles1_idx` (`roles_id` ASC) ,
  CONSTRAINT `fk_roles_has_permissions_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `watermanagement`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roles_has_permissions_permissions1`
    FOREIGN KEY (`permissions_id`)
    REFERENCES `watermanagement`.`permissions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `watermanagement`.`regulators`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`regulators` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `code` VARCHAR(45) NOT NULL,
  `createdAt`timestamp NOT NULL,
  `updatedAt`timestamp NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idregulators_UNIQUE` (`id` ASC) ,
,
 )
ENGINE = InnoDB;

USE `watermanagement` ;

-- -----------------------------------------------------
-- Table `watermanagement`.`neighbourhoods`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`neighbourhoods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `districtId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `createdAt` VARCHAR(255) NOT NULL,
  `updatedAt`timestamp NOT NULL,
  `districts_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_branches_districts_idx` (`districts_id` ASC) ,
  CONSTRAINT `fk_branches_districts`
    FOREIGN KEY (`districts_id`)
    REFERENCES `watermanagement`.`districts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 166
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `watermanagement`.`support`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`support` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categoryType` INT NOT NULL,
  `fromNumber` VARCHAR(45) NOT NULL,
  `toNumber` VARCHAR(45) NOT NULL,
  `messageBody` LONGTEXT NOT NULL,
  `sentDateTime` VARCHAR(45) NOT NULL,
  `status` INT NOT NULL,
  `customerName` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`meters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`meters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meterNumber` VARCHAR(50) NOT NULL,
  `diameter` VARCHAR(15) NOT NULL,
  `description` TEXT NOT NULL,
  `status` INT NOT NULL DEFAULT '0',
  `createdAt` VARCHAR(100) NOT NULL,
  `readings_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `meterNumber` (`meterNumber` ASC) ,
  INDEX `fk_meters_readings1_idx` (`readings_id` ASC) ,
  CONSTRAINT `fk_meters_readings1`
    FOREIGN KEY (`readings_id`)
    REFERENCES `watermanagement`.`readings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 8156
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `watermanagement`.`customers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(50) NULL DEFAULT NULL,
  `meeter_type` INT NOT NULL,
  `uid` TEXT NULL DEFAULT NULL,
  `branchId` INT NOT NULL,
  `tarrifTypeId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` TEXT NULL DEFAULT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `password` TEXT NOT NULL,
  `passwordHint` VARCHAR(255) NULL DEFAULT '0',
  `meeter_id` TEXT NOT NULL,
  `nuit` VARCHAR(15) NULL DEFAULT '0',
  `address` TEXT NULL DEFAULT NULL,
  `lat` VARCHAR(255) NULL DEFAULT NULL,
  `lng` VARCHAR(255) NULL DEFAULT NULL,
  `status` INT NOT NULL,
  `whatsapp` INT NULL DEFAULT NULL,
  `appAndroid` INT NULL DEFAULT NULL,
  `readingStatus` INT NOT NULL DEFAULT '0',
  `createdAt` VARCHAR(100) NOT NULL,
  `support_id` INT NOT NULL,
  `meters_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `barcode` (`barcode` ASC) ,
  INDEX `fk_customers_support1_idx` (`support_id` ASC) ,
  INDEX `fk_customers_meters1_idx` (`meters_id` ASC) ,
  CONSTRAINT `fk_customers_support1`
    FOREIGN KEY (`support_id`)
    REFERENCES `watermanagement`.`support` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_customers_meters1`
    FOREIGN KEY (`meters_id`)
    REFERENCES `watermanagement`.`meters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 9017
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`proforma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`proforma` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoiceId` INT NOT NULL,
  `preRegistrationId` VARCHAR(255) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerAddress` TEXT NOT NULL,
  `customerPhoneNumber` INT NOT NULL,
  `customerNuit` INT NOT NULL,
  `customerEmail` VARCHAR(100) NOT NULL,
  `itemsDetails` TEXT NOT NULL,
  `staffName` VARCHAR(255) NOT NULL,
  `status` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `customers_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_proforma_customers1_idx` (`customers_id` ASC) ,
  CONSTRAINT `fk_proforma_customers1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `watermanagement`.`customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1755
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`pre_registration`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`pre_registration` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `phoneNumber` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NULL DEFAULT NULL,
  `nationalId` VARCHAR(45) NULL DEFAULT NULL,
  `nuit` VARCHAR(45) NULL DEFAULT NULL,
  `address` VARCHAR(45) NOT NULL,
  `status` INT NOT NULL,
  `createdAt` VARCHAR(45) NOT NULL,
  `proforma_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `fk_pre_registration_proforma1_idx` (`proforma_id` ASC) ,
  CONSTRAINT `fk_pre_registration_proforma1`
    FOREIGN KEY (`proforma_id`)
    REFERENCES `watermanagement`.`proforma` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 2235
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`prepaid_purchases`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`prepaid_purchases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(12) NOT NULL,
  `totalPaid` FLOAT NOT NULL,
  `totalUnities` FLOAT NOT NULL,
  `token` VARCHAR(50) NOT NULL,
  `receiptNumber` INT NOT NULL,
  `customerId` INT NOT NULL,
  `vat` FLOAT NOT NULL,
  `employeeId` VARCHAR(6) NOT NULL,
  `generatedDate` VARCHAR(100) NOT NULL,
  `paymentMethod` INT NOT NULL,
  `transactionId` VARCHAR(45) NOT NULL,
  `paidDebt` FLOAT NOT NULL,
  `debtBeforePurchase` FLOAT NOT NULL,
  `debtAfterPurchase` FLOAT NOT NULL,
  `amountValue` FLOAT NOT NULL,
  `customerName` VARCHAR(100) NOT NULL,
  `serviceAvailabilityFee` FLOAT NOT NULL,
  `staffName` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 35
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`reportnotes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`reportnotes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` TEXT NOT NULL,
  `staffName` VARCHAR(255) NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 95
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `watermanagement`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` TEXT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phoneNumber` VARCHAR(20) NOT NULL,
  `password` TEXT NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `status` INT NOT NULL,
  `createdAt`timestamp NOT NULL,
  `createdAt`timestamp NOT NULL,
  `token` TEXT NULL DEFAULT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `phoneNumber` (`phoneNumber` ASC) ,
  UNIQUE INDEX `email` (`email` ASC) ,
  INDEX `fk_users_roles1_idx` (`roles_id` ASC) ,
  CONSTRAINT `fk_users_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `watermanagement`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 276
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


-- -----------------------------------------------------
-- Table `watermanagement`.`whatsapp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `watermanagement`.`whatsapp` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(45) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `barcode` VARCHAR(15) NOT NULL,
  `staffName` VARCHAR(45) NOT NULL,
  `status` INT NULL DEFAULT NULL,
  `createdAt` VARCHAR(45) NOT NULL,
  `customers_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `fk_whatsapp_customers1_idx` (`customers_id` ASC) ,
  CONSTRAINT `fk_whatsapp_customers1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `watermanagement`.`customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 805
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
