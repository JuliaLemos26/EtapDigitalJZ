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
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (39,'admin','logentry'),(41,'auth','group'),(40,'auth','permission'),(42,'auth','user'),(43,'contenttypes','contenttype'),(45,'home','aluno'),(2,'home','homepage'),(46,'home','professor'),(44,'sessions','session'),(37,'taggit','tag'),(38,'taggit','taggeditem'),(3,'wagtailadmin','admin'),(36,'wagtailadmin','editingsession'),(11,'wagtailcore','collection'),(10,'wagtailcore','collectionviewrestriction'),(24,'wagtailcore','comment'),(25,'wagtailcore','commentreply'),(4,'wagtailcore','groupapprovaltask'),(12,'wagtailcore','groupcollectionpermission'),(20,'wagtailcore','grouppagepermission'),(7,'wagtailcore','groupsitepermission'),(5,'wagtailcore','locale'),(8,'wagtailcore','modellogentry'),(1,'wagtailcore','page'),(23,'wagtailcore','pagelogentry'),(26,'wagtailcore','pagesubscription'),(21,'wagtailcore','pageviewrestriction'),(27,'wagtailcore','referenceindex'),(9,'wagtailcore','revision'),(6,'wagtailcore','site'),(18,'wagtailcore','task'),(19,'wagtailcore','taskstate'),(13,'wagtailcore','uploadedfile'),(16,'wagtailcore','workflow'),(14,'wagtailcore','workflowcontenttype'),(22,'wagtailcore','workflowpage'),(15,'wagtailcore','workflowstate'),(17,'wagtailcore','workflowtask'),(28,'wagtaildocs','document'),(32,'wagtailembeds','embed'),(30,'wagtailforms','formsubmission'),(29,'wagtailimages','image'),(34,'wagtailimages','rendition'),(31,'wagtailredirects','redirect'),(35,'wagtailsearch','indexentry'),(33,'wagtailusers','userprofile');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 12:20:32
