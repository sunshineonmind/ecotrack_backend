SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'maps'
      AND COLUMN_NAME = 'practice_id'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE maps ADD COLUMN practice_id BIGINT UNSIGNED NULL AFTER id',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @unique_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'maps'
      AND INDEX_NAME = 'uq_maps_practice'
);

SET @sql = IF(
    @unique_exists = 0,
    'ALTER TABLE maps ADD CONSTRAINT uq_maps_practice UNIQUE (practice_id)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'maps'
      AND CONSTRAINT_NAME = 'fk_maps_practice'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql = IF(
    @fk_exists = 0,
    'ALTER TABLE maps ADD CONSTRAINT fk_maps_practice FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;