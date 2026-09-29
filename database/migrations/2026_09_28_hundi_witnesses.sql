CREATE TABLE IF NOT EXISTS `hundi_witnesses` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `hundi_id` bigint(20) UNSIGNED NOT NULL,
  `witness_full_name` varchar(150) NOT NULL,
  `witness_designation` varchar(150) DEFAULT NULL,
  `witness_email` varchar(150) DEFAULT NULL,
  `witness_phone` varchar(20) DEFAULT NULL,
  `witness_address_line1` varchar(255) DEFAULT NULL,
  `witness_address_line2` varchar(255) DEFAULT NULL,
  `witness_city` varchar(100) DEFAULT NULL,
  `witness_remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_hundi_witnesses_hundi` (`hundi_id`),
  KEY `idx_hundi_witnesses_name` (`witness_full_name`),
  CONSTRAINT `fk_hundi_witnesses_hundi` FOREIGN KEY (`hundi_id`) REFERENCES `hundi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
