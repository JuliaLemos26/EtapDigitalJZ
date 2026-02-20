-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: etapdigital
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `wagtailcore_modellogentry`
--

DROP TABLE IF EXISTS `wagtailcore_modellogentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wagtailcore_modellogentry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` longtext NOT NULL,
  `action` varchar(255) NOT NULL,
  `data` json NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `content_changed` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `object_id` varchar(255) NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `uuid` char(32) DEFAULT NULL,
  `revision_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wagtailcore_modellog_content_type_id_68849e77_fk_django_co` (`content_type_id`),
  KEY `wagtailcore_modellogentry_action_d2d856ee` (`action`),
  KEY `wagtailcore_modellogentry_content_changed_8bc39742` (`content_changed`),
  KEY `wagtailcore_modellogentry_object_id_e0e7d4ef` (`object_id`),
  KEY `wagtailcore_modellogentry_user_id_0278d1bf` (`user_id`),
  KEY `wagtailcore_modellogentry_timestamp_9694521b` (`timestamp`),
  KEY `wagtailcore_modellogentry_revision_id_df6ca33a` (`revision_id`),
  CONSTRAINT `wagtailcore_modellog_content_type_id_68849e77_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wagtailcore_modellogentry`
--

LOCK TABLES `wagtailcore_modellogentry` WRITE;
/*!40000 ALTER TABLE `wagtailcore_modellogentry` DISABLE KEYS */;
/*!40000 ALTER TABLE `wagtailcore_modellogentry` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 12:20:31
