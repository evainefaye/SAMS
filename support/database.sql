-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.21-log - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             9.5.0.5253
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for sams_fde
DROP DATABASE IF EXISTS `sams_fde`;
CREATE DATABASE IF NOT EXISTS `sams_fde` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_fde`;

-- Dumping structure for table sams_fde.duration_log_session
DROP TABLE IF EXISTS `duration_log_session`;
CREATE TABLE IF NOT EXISTS `duration_log_session` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.duration_log_step_automation
DROP TABLE IF EXISTS `duration_log_step_automation`;
CREATE TABLE IF NOT EXISTS `duration_log_step_automation` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.duration_log_step_manual
DROP TABLE IF EXISTS `duration_log_step_manual`;
CREATE TABLE IF NOT EXISTS `duration_log_step_manual` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.screenshots
DROP TABLE IF EXISTS `screenshots`;
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping database structure for sams_preprod
DROP DATABASE IF EXISTS `sams_preprod`;
CREATE DATABASE IF NOT EXISTS `sams_preprod` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_preprod`;

-- Dumping structure for table sams_preprod.duration_log_session
DROP TABLE IF EXISTS `duration_log_session`;
CREATE TABLE IF NOT EXISTS `duration_log_session` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.duration_log_step_automation
DROP TABLE IF EXISTS `duration_log_step_automation`;
CREATE TABLE IF NOT EXISTS `duration_log_step_automation` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.duration_log_step_manual
DROP TABLE IF EXISTS `duration_log_step_manual`;
CREATE TABLE IF NOT EXISTS `duration_log_step_manual` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.screenshots
DROP TABLE IF EXISTS `screenshots`;
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping database structure for sams_prod
DROP DATABASE IF EXISTS `sams_prod`;
CREATE DATABASE IF NOT EXISTS `sams_prod` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_prod`;

-- Dumping structure for table sams_prod.duration_log_session
DROP TABLE IF EXISTS `duration_log_session`;
CREATE TABLE IF NOT EXISTS `duration_log_session` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.duration_log_step_automation
DROP TABLE IF EXISTS `duration_log_step_automation`;
CREATE TABLE IF NOT EXISTS `duration_log_step_automation` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.duration_log_step_manual
DROP TABLE IF EXISTS `duration_log_step_manual`;
CREATE TABLE IF NOT EXISTS `duration_log_step_manual` (
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `start_time` varchar(30) NOT NULL,
  `stop_time` varchar(30) NOT NULL,
  `elapsed_seconds` int(25) unsigned NOT NULL,
  `att_uid` char(6) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `manager_id` char(6) DEFAULT NULL,
  `work_source` varchar(30) DEFAULT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  `threshold_exceeded` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.screenshots
DROP TABLE IF EXISTS `screenshots`;
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
