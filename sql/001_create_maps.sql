CREATE TABLE maps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    notes TEXT NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE map_bags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    map_id BIGINT UNSIGNED NOT NULL,

    code VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    eer_code VARCHAR(20) NULL,
    color VARCHAR(30) NULL,

    quantity DECIMAL(10,2) NULL,
    unit VARCHAR(20) NULL,

    packaging_date DATE NULL,
    operator_name VARCHAR(255) NULL,

    position_x INT NOT NULL,
    position_y INT NOT NULL,
    position_z INT NOT NULL DEFAULT 1,

    notes TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_map_bags_map
        FOREIGN KEY (map_id)
        REFERENCES maps(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_map_bag_code (map_id, code)
);

CREATE TABLE bag_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bag_id BIGINT UNSIGNED NOT NULL,

    from_x INT NULL,
    from_y INT NULL,
    from_z INT NULL,

    to_x INT NOT NULL,
    to_y INT NOT NULL,
    to_z INT NOT NULL,

    operator_name VARCHAR(255) NOT NULL,
    notes TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bag_movements_bag
        FOREIGN KEY (bag_id)
        REFERENCES map_bags(id)
        ON DELETE CASCADE
);

CREATE TABLE map_photos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    map_id BIGINT UNSIGNED NOT NULL,

    file_url VARCHAR(1000) NOT NULL,
    description VARCHAR(500) NULL,
    operator_name VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_map_photos_map
        FOREIGN KEY (map_id)
        REFERENCES maps(id)
        ON DELETE CASCADE
);