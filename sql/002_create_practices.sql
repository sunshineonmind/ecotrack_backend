CREATE TABLE IF NOT EXISTS practices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,

    customer VARCHAR(255) NOT NULL,
    producer VARCHAR(255) NULL,
    transporter VARCHAR(255) NULL,
    disposal_company VARCHAR(255) NULL,

    waste_code VARCHAR(100) NULL,
    waste_description VARCHAR(500) NULL,

    status ENUM(
        'DRAFT',
        'OPEN',
        'IN_PROGRESS',
        'COMPLETED',
        'CLOSED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'DRAFT',

    notes TEXT NULL,

    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_practices_code (code)
);