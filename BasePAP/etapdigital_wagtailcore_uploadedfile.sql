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
-- Table structure for table `wagtailcore_uploadedfile`
--

DROP TABLE IF EXISTS `wagtailcore_uploadedfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wagtailcore_uploadedfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file` varchar(200) NOT NULL,
  `for_content_type_id` int DEFAULT NULL,
  `uploaded_by_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wagtailcore_uploaded_for_content_type_id_b0fc87b2_fk_django_co` (`for_content_type_id`),
  KEY `wagtailcore_uploaded_uploaded_by_user_id_c7580fe8_fk_auth_user` (`uploaded_by_user_id`),
  CONSTRAINT `wagtailcore_uploaded_for_content_type_id_b0fc87b2_fk_django_co` FOREIGN KEY (`for_content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `wagtailcore_uploaded_uploaded_by_user_id_c7580fe8_fk_auth_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wagtailcore_uploadedfile`
--

LOCK TABLES `wagtailcore_uploadedfile` WRITE;
/*!40000 ALTER TABLE `wagtailcore_uploadedfile` DISABLE KEYS */;
/*!40000 ALTER TABLE `wagtailcore_uploadedfile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 12:20:34
