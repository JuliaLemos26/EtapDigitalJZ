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
-- Table structure for table `wagtailcore_taskstate`
--

DROP TABLE IF EXISTS `wagtailcore_taskstate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wagtailcore_taskstate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `started_at` datetime(6) NOT NULL,
  `finished_at` datetime(6) DEFAULT NULL,
  `content_type_id` int NOT NULL,
  `revision_id` int NOT NULL,
  `task_id` int NOT NULL,
  `workflow_state_id` int NOT NULL,
  `finished_by_id` int DEFAULT NULL,
  `comment` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `wagtailcore_taskstat_workflow_state_id_9239a775_fk_wagtailco` (`workflow_state_id`),
  KEY `wagtailcore_taskstat_content_type_id_0a758fdc_fk_django_co` (`content_type_id`),
  KEY `wagtailcore_taskstate_task_id_c3677c34_fk_wagtailcore_task_id` (`task_id`),
  KEY `wagtailcore_taskstate_finished_by_id_13f98229_fk_auth_user_id` (`finished_by_id`),
  KEY `wagtailcore_taskstat_revision_id_df25a499_fk_wagtailco` (`revision_id`),
  CONSTRAINT `wagtailcore_taskstat_content_type_id_0a758fdc_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `wagtailcore_taskstat_revision_id_df25a499_fk_wagtailco` FOREIGN KEY (`revision_id`) REFERENCES `wagtailcore_revision` (`id`),
  CONSTRAINT `wagtailcore_taskstat_workflow_state_id_9239a775_fk_wagtailco` FOREIGN KEY (`workflow_state_id`) REFERENCES `wagtailcore_workflowstate` (`id`),
  CONSTRAINT `wagtailcore_taskstate_finished_by_id_13f98229_fk_auth_user_id` FOREIGN KEY (`finished_by_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `wagtailcore_taskstate_task_id_c3677c34_fk_wagtailcore_task_id` FOREIGN KEY (`task_id`) REFERENCES `wagtailcore_task` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wagtailcore_taskstate`
--

LOCK TABLES `wagtailcore_taskstate` WRITE;
/*!40000 ALTER TABLE `wagtailcore_taskstate` DISABLE KEYS */;
/*!40000 ALTER TABLE `wagtailcore_taskstate` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 12:20:33
