/*
Navicat MySQL Data Transfer

Source Server         : mb
Source Server Version : 50644
Source Host           : localhost:3306
Source Database       : xiyuan

Target Server Type    : MYSQL
Target Server Version : 50644
File Encoding         : 65001

Date: 2020-11-29 15:51:50
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for agument
-- ----------------------------
DROP TABLE IF EXISTS `agument`;
CREATE TABLE `agument` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pageid` int(11) NOT NULL,
  `usercount` varchar(11) NOT NULL,
  `content` text NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `agument-page-id` (`pageid`),
  KEY `agument-user-count` (`usercount`),
  CONSTRAINT `agument-page-id` FOREIGN KEY (`pageid`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agument-user-count` FOREIGN KEY (`usercount`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for childagu
-- ----------------------------
DROP TABLE IF EXISTS `childagu`;
CREATE TABLE `childagu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) NOT NULL,
  `usercount` varchar(11) NOT NULL,
  `content` text NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `childagu-agument-id` (`parentid`),
  KEY `childagu-user-count` (`usercount`),
  CONSTRAINT `childagu-agument-id` FOREIGN KEY (`parentid`) REFERENCES `agument` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `childagu-user-count` FOREIGN KEY (`usercount`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for component
-- ----------------------------
DROP TABLE IF EXISTS `component`;
CREATE TABLE `component` (
  `cpid` int(11) NOT NULL AUTO_INCREMENT,
  `pageid` int(11) NOT NULL,
  `cpname` varchar(50) NOT NULL,
  `cpdata` text,
  `cporder` int(11) NOT NULL,
  PRIMARY KEY (`cpid`),
  KEY `cp-page-id` (`pageid`),
  CONSTRAINT `cp-page-id` FOREIGN KEY (`pageid`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for follow
-- ----------------------------
DROP TABLE IF EXISTS `follow`;
CREATE TABLE `follow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `byfollowuc` varchar(11) NOT NULL,
  `followuc` varchar(11) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `follow-user-bycount` (`byfollowuc`),
  KEY `follow-user-count` (`followuc`),
  CONSTRAINT `follow-user-bycount` FOREIGN KEY (`byfollowuc`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `follow-user-count` FOREIGN KEY (`followuc`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` varchar(11) NOT NULL,
  `resever` varchar(11) NOT NULL,
  `content` text NOT NULL,
  `time` datetime NOT NULL,
  `isread` varchar(2) NOT NULL DEFAULT '未读',
  PRIMARY KEY (`id`),
  KEY `message-sender-count` (`sender`),
  KEY `message-resever-count` (`resever`),
  CONSTRAINT `message-resever-count` FOREIGN KEY (`resever`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message-sender-count` FOREIGN KEY (`sender`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for page
-- ----------------------------
DROP TABLE IF EXISTS `page`;
CREATE TABLE `page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usercount` varchar(11) NOT NULL,
  `url` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT '',
  `discription` text,
  `time` datetime NOT NULL,
  `style` text,
  `status` varchar(10) NOT NULL DEFAULT '草稿',
  `lookuser` varchar(20) NOT NULL DEFAULT 'all',
  `category` varchar(10) NOT NULL DEFAULT '文章',
  `version` int(3) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `page-user-count` (`usercount`),
  CONSTRAINT `page-user-count` FOREIGN KEY (`usercount`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for pagelike
-- ----------------------------
DROP TABLE IF EXISTS `pagelike`;
CREATE TABLE `pagelike` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pageid` int(11) NOT NULL,
  `usercount` varchar(11) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `like-page-id` (`pageid`),
  KEY `like-user-count` (`usercount`),
  CONSTRAINT `like-page-id` FOREIGN KEY (`pageid`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `like-user-count` FOREIGN KEY (`usercount`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for temp
-- ----------------------------
DROP TABLE IF EXISTS `temp`;
CREATE TABLE `temp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usercount` varchar(11) NOT NULL,
  `componentData` text,
  `pageConfig` text,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `temp-user-count` (`usercount`),
  CONSTRAINT `temp-user-count` FOREIGN KEY (`usercount`) REFERENCES `user` (`count`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `count` varchar(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(7) NOT NULL,
  `tel` varchar(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `sex` varchar(2) NOT NULL DEFAULT '男',
  `birthday` date DEFAULT NULL,
  `touxiang` varchar(255) DEFAULT '/public/touxiang/moren.jpg',
  PRIMARY KEY (`count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
