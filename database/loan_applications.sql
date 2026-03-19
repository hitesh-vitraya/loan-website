CREATE TABLE loan_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  loan_amount INT NULL,
  loan_purpose VARCHAR(100) NOT NULL,
  zip_code VARCHAR(5) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  credit_score VARCHAR(50) NOT NULL,
  employment_status VARCHAR(50) NOT NULL,
  pay_frequency VARCHAR(50) NOT NULL,
  monthly_income INT NOT NULL,
  housing_status VARCHAR(50) NOT NULL,
  has_checking_account VARCHAR(10) NOT NULL,
  has_direct_deposit VARCHAR(10) NOT NULL,
  has_vehicle_registration VARCHAR(10) NOT NULL,
  military_affiliation VARCHAR(50) NOT NULL,
  unsecured_debt VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  phone_consent TINYINT(1) NOT NULL,
  date_of_birth VARCHAR(10) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  ssn VARCHAR(11) NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(100) NOT NULL,
  lead_api_status VARCHAR(50) NULL,
  lead_api_http_status INT NULL,
  lead_api_last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loan_application_api_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  api_name VARCHAR(100) NOT NULL,
  request_body LONGTEXT NOT NULL,
  response_body LONGTEXT NOT NULL,
  response_http_status INT NOT NULL,
  was_successful TINYINT(1) NOT NULL,
  duration_ms INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_loan_application_api_logs_application
    FOREIGN KEY (application_id) REFERENCES loan_applications(id)
    ON DELETE CASCADE
);

CREATE TABLE contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE do_not_sell_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
