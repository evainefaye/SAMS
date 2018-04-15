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
CREATE DATABASE IF NOT EXISTS `sams_fde` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_fde`;

-- Dumping structure for table sams_fde.duration_log_session
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
  `city` varchar(25) DEFAULT NULL,
  `active_org` text,
  `asset_id` text,
  `call_back_number` text,
  `caller_name` text,
  `caller_phone` text,
  `client_name` text,
  `client_ticket_num` text,
  `contact_email` text,
  `contact_name` text,
  `contact_phone` text,
  `email_address` text,
  `end_user_name` text,
  `end_user_phone` text,
  `environment` text,
  `ip` text,
  `mac` text,
  `master_state` text,
  `parent_ticket_number` text,
  `problem_abstract` text,
  `room_number` text,
  `run_location` text,
  `ticket_number` text,
  `ticket_role` text,
  `ticket_state` text,
  `ticket_type` text,
  `t2_team_name` text,
  `venue_code` text,
  `venue_name` text,
  `work_queue` text,
  `userInfo` json DEFAULT NULL,
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`),
  KEY `elapsed_seconds` (`elapsed_seconds`),
  KEY `att_uid` (`att_uid`),
  KEY `manager_id` (`manager_id`),
  KEY `work_source` (`work_source`),
  KEY `business_line` (`business_line`),
  KEY `city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.duration_log_step_automation
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
  `city` varchar(25) DEFAULT 'Y',
  `in_progress` char(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.duration_log_step_manual
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
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_fde.screenshots
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`),
  KEY `in_progress` (`in_progress`),
  KEY `smp_session_id` (`smp_session_id`),
  KEY `recorded` (`recorded`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping database structure for sams_preprod
CREATE DATABASE IF NOT EXISTS `sams_preprod` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_preprod`;

-- Dumping structure for table sams_preprod.duration_log_session
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
  `city` varchar(25) DEFAULT NULL,
  `active_org` text,
  `asset_id` text,
  `call_back_number` text,
  `caller_name` text,
  `caller_phone` text,
  `client_name` text,
  `client_ticket_num` text,
  `contact_email` text,
  `contact_name` text,
  `contact_phone` text,
  `email_address` text,
  `end_user_name` text,
  `end_user_phone` text,
  `environment` text,
  `ip` text,
  `mac` text,
  `master_state` text,
  `parent_ticket_number` text,
  `problem_abstract` text,
  `room_number` text,
  `run_location` text,
  `ticket_number` text,
  `ticket_role` text,
  `ticket_state` text,
  `ticket_type` text,
  `t2_team_name` text,
  `venue_code` text,
  `venue_name` text,
  `work_queue` text,
  `userInfo` json DEFAULT NULL,
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`),
  KEY `elapsed_seconds` (`elapsed_seconds`),
  KEY `att_uid` (`att_uid`),
  KEY `manager_id` (`manager_id`),
  KEY `business_line` (`business_line`),
  KEY `work_source` (`work_source`),
  KEY `city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.duration_log_step_automation
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
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.duration_log_step_manual
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
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_preprod.screenshots
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `city` varchar(25) DEFAULT 'Y',
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`),
  KEY `in_progress` (`in_progress`),
  KEY `smp_session_id` (`smp_session_id`),
  KEY `recorded` (`recorded`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping database structure for sams_prod
CREATE DATABASE IF NOT EXISTS `sams_prod` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sams_prod`;

-- Dumping structure for table sams_prod.duration_log_session
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
  `work_source` varchar(30) NOT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `city` varchar(25) DEFAULT NULL,
  `active_org` text,
  `asset_id` text,
  `call_back_number` text,
  `caller_name` text,
  `client_name` text,
  `caller_phone` text,
  `client_ticket_num` text,
  `contact_email` text,
  `contact_name` text,
  `contact_phone` text,
  `email_address` text,
  `end_user_name` text,
  `end_user_phone` text,
  `environment` text,
  `ip` text,
  `mac` text,
  `master_state` text,
  `parent_ticket_number` text,
  `problem_abstract` text,
  `room_number` text,
  `run_location` text,
  `ticket_number` text,
  `ticket_role` text,
  `ticket_state` text,
  `ticket_type` text,
  `t2_team_name` text,
  `venue_code` text,
  `venue_name` text,
  `work_queue` text,
  `userInfo` json DEFAULT NULL,
  PRIMARY KEY (`smp_session_id`),
  KEY `START TIME` (`start_time`),
  KEY `att_uid` (`att_uid`),
  KEY `manager_id` (`manager_id`),
  KEY `work_source` (`work_source`),
  KEY `business_line` (`business_line`),
  KEY `elapsed_seconds` (`elapsed_seconds`),
  KEY `city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Stores information on the duration of time the agent was working on a SASHA flow from ';

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.duration_log_step_automation
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
  `work_source` varchar(30) NOT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  KEY `att_uid` (`att_uid`),
  KEY `smp_session_id` (`smp_session_id`),
  KEY `start_time` (`start_time`),
  KEY `business_line` (`business_line`),
  KEY `work_source` (`work_source`),
  KEY `manager_id` (`manager_id`),
  KEY `flow_name` (`flow_name`),
  KEY `step_name` (`step_name`),
  KEY `elapsed_seconds` (`elapsed_seconds`),
  KEY `in_progress` (`in_progress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.duration_log_step_manual
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
  `work_source` varchar(30) NOT NULL,
  `business_line` varchar(50) DEFAULT NULL,
  `task_type` varchar(10) DEFAULT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  KEY `smp_session_id` (`smp_session_id`),
  KEY `start_time` (`start_time`),
  KEY `att_uid` (`att_uid`),
  KEY `business_line` (`business_line`),
  KEY `work_source` (`work_source`),
  KEY `step_name` (`step_name`),
  KEY `manager_id` (`manager_id`),
  KEY `elapsed_seconds` (`elapsed_seconds`),
  KEY `flowname_stepname` (`flow_name`,`step_name`),
  KEY `flow_name` (`flow_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table sams_prod.screenshots
CREATE TABLE IF NOT EXISTS `screenshots` (
  `GUID` varchar(45) NOT NULL,
  `recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `smp_session_id` varchar(65) NOT NULL,
  `screenshot_time` varchar(30) NOT NULL,
  `flow_name` varchar(250) NOT NULL,
  `step_name` varchar(250) NOT NULL,
  `image_data` longtext NOT NULL,
  `city` varchar(25) DEFAULT NULL,
  `in_progress` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`GUID`),
  KEY `in_progress` (`in_progress`),
  KEY `smp_session_id` (`smp_session_id`),
  KEY `recorded` (`recorded`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
