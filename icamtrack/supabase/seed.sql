-- ============================================================
-- SEED — Catégories et matériels ICAM Département Informatique
-- ============================================================

-- ── CATÉGORIES ──────────────────────────────────────────────

insert into categories (id, name, description) values
  ('c1000000-0000-0000-0000-000000000001', 'Microcontrôleurs & SBC',    'Arduino, Raspberry Pi, ESP et cartes de développement'),
  ('c1000000-0000-0000-0000-000000000002', 'Réseau',                    'Routeurs, switches et équipements réseau'),
  ('c1000000-0000-0000-0000-000000000003', 'Tablettes & Périphériques', 'Tablettes et périphériques informatiques'),
  ('c1000000-0000-0000-0000-000000000004', 'Capteurs',                  'Capteurs de température, humidité, pression, proximité, etc.'),
  ('c1000000-0000-0000-0000-000000000005', 'Affichage & LEDs',          'Écrans LCD, LEDs et composants d''affichage'),
  ('c1000000-0000-0000-0000-000000000006', 'Électronique passive',      'Résistances, condensateurs, diodes, transistors, potentiomètres'),
  ('c1000000-0000-0000-0000-000000000007', 'Connectique & Prototypage', 'Breadboards, câbles, connecteurs'),
  ('c1000000-0000-0000-0000-000000000008', 'Actionneurs',               'Moteurs, servos et composants mécaniques'),
  ('c1000000-0000-0000-0000-000000000009', 'Identification',            'Lecteurs RFID, codes à barres et systèmes d''identification'),
  ('c1000000-0000-0000-0000-000000000010', 'Interfaces utilisateur',    'Boutons, claviers et dispositifs d''entrée');

-- ── MATÉRIELS ───────────────────────────────────────────────
-- Microcontrôleurs & SBC

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Kit Raspberry Pi 5',      'c1000000-0000-0000-0000-000000000001', 'RPI5-001', 'available', 'good'),
  ('Kit Raspberry Pi 5',      'c1000000-0000-0000-0000-000000000001', 'RPI5-002', 'available', 'good'),
  ('Kit Raspberry Pi 5',      'c1000000-0000-0000-0000-000000000001', 'RPI5-003', 'available', 'good'),
  ('Clavier USB',             'c1000000-0000-0000-0000-000000000001', 'KB-001',   'available', 'good'),
  ('Clavier USB',             'c1000000-0000-0000-0000-000000000001', 'KB-002',   'available', 'good'),
  ('Clavier USB',             'c1000000-0000-0000-0000-000000000001', 'KB-003',   'available', 'good'),
  ('Souris USB',              'c1000000-0000-0000-0000-000000000001', 'MS-001',   'available', 'good'),
  ('Souris USB',              'c1000000-0000-0000-0000-000000000001', 'MS-002',   'available', 'good'),
  ('Souris USB',              'c1000000-0000-0000-0000-000000000001', 'MS-003',   'available', 'good'),
  ('Écran HDMI',              'c1000000-0000-0000-0000-000000000001', 'SCR-001',  'available', 'good'),
  ('Écran HDMI',              'c1000000-0000-0000-0000-000000000001', 'SCR-002',  'available', 'good'),
  ('Écran HDMI',              'c1000000-0000-0000-0000-000000000001', 'SCR-003',  'available', 'good'),
  ('PiCam v3',                'c1000000-0000-0000-0000-000000000001', 'CAM-001',  'available', 'good'),
  ('PiCam v3',                'c1000000-0000-0000-0000-000000000001', 'CAM-002',  'available', 'good'),
  ('Arduino Uno R3',          'c1000000-0000-0000-0000-000000000001', 'ARD-001',  'available', 'good'),
  ('Arduino Uno R3',          'c1000000-0000-0000-0000-000000000001', 'ARD-002',  'available', 'good'),
  ('Arduino Uno R3',          'c1000000-0000-0000-0000-000000000001', 'ARD-003',  'available', 'good'),
  ('Arduino Uno R3',          'c1000000-0000-0000-0000-000000000001', 'ARD-004',  'available', 'good'),
  ('Arduino Uno R3',          'c1000000-0000-0000-0000-000000000001', 'ARD-005',  'available', 'good'),
  ('ESP32',                   'c1000000-0000-0000-0000-000000000001', 'ESP-001',  'available', 'good'),
  ('ESP32',                   'c1000000-0000-0000-0000-000000000001', 'ESP-002',  'available', 'good'),
  ('ESP32',                   'c1000000-0000-0000-0000-000000000001', 'ESP-003',  'available', 'good'),
  ('ESP32',                   'c1000000-0000-0000-0000-000000000001', 'ESP-004',  'available', 'good'),
  ('ESP32',                   'c1000000-0000-0000-0000-000000000001', 'ESP-005',  'available', 'good'),
  ('ESP8266',                 'c1000000-0000-0000-0000-000000000001', 'ESP8-001', 'available', 'good'),
  ('ESP8266',                 'c1000000-0000-0000-0000-000000000001', 'ESP8-002', 'available', 'good'),
  ('ESP8266',                 'c1000000-0000-0000-0000-000000000001', 'ESP8-003', 'available', 'good');

-- Réseau

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Routeur Cisco C1300',     'c1000000-0000-0000-0000-000000000002', 'CIS-001',  'available', 'good'),
  ('Routeur Cisco C1300',     'c1000000-0000-0000-0000-000000000002', 'CIS-002',  'available', 'good');

-- Tablettes & Périphériques

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Tablette Android',        'c1000000-0000-0000-0000-000000000003', 'TAB-001',  'available', 'good'),
  ('Tablette Android',        'c1000000-0000-0000-0000-000000000003', 'TAB-002',  'available', 'good'),
  ('Tablette Android',        'c1000000-0000-0000-0000-000000000003', 'TAB-003',  'available', 'good'),
  ('Tablette Android',        'c1000000-0000-0000-0000-000000000003', 'TAB-004',  'available', 'good'),
  ('Tablette Android',        'c1000000-0000-0000-0000-000000000003', 'TAB-005',  'available', 'good');

-- Capteurs

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Capteur température DHT22',   'c1000000-0000-0000-0000-000000000004', 'TMP-001', 'available', 'good'),
  ('Capteur température DHT22',   'c1000000-0000-0000-0000-000000000004', 'TMP-002', 'available', 'good'),
  ('Capteur température DHT22',   'c1000000-0000-0000-0000-000000000004', 'TMP-003', 'available', 'good'),
  ('Capteur température DHT22',   'c1000000-0000-0000-0000-000000000004', 'TMP-004', 'available', 'good'),
  ('Capteur température DHT22',   'c1000000-0000-0000-0000-000000000004', 'TMP-005', 'available', 'good'),
  ('Capteur humidité DHT11',      'c1000000-0000-0000-0000-000000000004', 'HUM-001', 'available', 'good'),
  ('Capteur humidité DHT11',      'c1000000-0000-0000-0000-000000000004', 'HUM-002', 'available', 'good'),
  ('Capteur humidité DHT11',      'c1000000-0000-0000-0000-000000000004', 'HUM-003', 'available', 'good'),
  ('Photodétecteur LDR',          'c1000000-0000-0000-0000-000000000004', 'LDR-001', 'available', 'good'),
  ('Photodétecteur LDR',          'c1000000-0000-0000-0000-000000000004', 'LDR-002', 'available', 'good'),
  ('Photodétecteur LDR',          'c1000000-0000-0000-0000-000000000004', 'LDR-003', 'available', 'good'),
  ('Accéléromètre MPU-6050',      'c1000000-0000-0000-0000-000000000004', 'ACC-001', 'available', 'good'),
  ('Accéléromètre MPU-6050',      'c1000000-0000-0000-0000-000000000004', 'ACC-002', 'available', 'good'),
  ('Accéléromètre MPU-6050',      'c1000000-0000-0000-0000-000000000004', 'ACC-003', 'available', 'good'),
  ('Capteur proximité HC-SR04',   'c1000000-0000-0000-0000-000000000004', 'PRX-001', 'available', 'good'),
  ('Capteur proximité HC-SR04',   'c1000000-0000-0000-0000-000000000004', 'PRX-002', 'available', 'good'),
  ('Capteur proximité HC-SR04',   'c1000000-0000-0000-0000-000000000004', 'PRX-003', 'available', 'good'),
  ('Capteur proximité HC-SR04',   'c1000000-0000-0000-0000-000000000004', 'PRX-004', 'available', 'good'),
  ('Indicateur de pression BMP280','c1000000-0000-0000-0000-000000000004', 'PRS-001', 'available', 'good'),
  ('Indicateur de pression BMP280','c1000000-0000-0000-0000-000000000004', 'PRS-002', 'available', 'good'),
  ('Indicateur de pression BMP280','c1000000-0000-0000-0000-000000000004', 'PRS-003', 'available', 'good'),
  ('Capteur de niveau',           'c1000000-0000-0000-0000-000000000004', 'NIV-001', 'available', 'good'),
  ('Capteur de niveau',           'c1000000-0000-0000-0000-000000000004', 'NIV-002', 'available', 'good'),
  ('Capteur de niveau',           'c1000000-0000-0000-0000-000000000004', 'NIV-003', 'available', 'good');

-- Affichage & LEDs

insert into equipment (name, category_id, serial_number, status, quality) values
  ('LED rouge (x10)',         'c1000000-0000-0000-0000-000000000005', 'LED-R01',  'available', 'good'),
  ('LED rouge (x10)',         'c1000000-0000-0000-0000-000000000005', 'LED-R02',  'available', 'good'),
  ('LED verte (x10)',         'c1000000-0000-0000-0000-000000000005', 'LED-G01',  'available', 'good'),
  ('LED verte (x10)',         'c1000000-0000-0000-0000-000000000005', 'LED-G02',  'available', 'good'),
  ('LED bleue (x10)',         'c1000000-0000-0000-0000-000000000005', 'LED-B01',  'available', 'good'),
  ('LED RGB (x5)',            'c1000000-0000-0000-0000-000000000005', 'LED-RGB1', 'available', 'good'),
  ('Écran LCD 16x2 I2C',     'c1000000-0000-0000-0000-000000000005', 'LCD-001',  'available', 'good'),
  ('Écran LCD 16x2 I2C',     'c1000000-0000-0000-0000-000000000005', 'LCD-002',  'available', 'good'),
  ('Écran LCD 16x2 I2C',     'c1000000-0000-0000-0000-000000000005', 'LCD-003',  'available', 'good'),
  ('Écran LCD 20x4 I2C',     'c1000000-0000-0000-0000-000000000005', 'LCD-004',  'available', 'good'),
  ('Écran LCD 20x4 I2C',     'c1000000-0000-0000-0000-000000000005', 'LCD-005',  'available', 'good');

-- Électronique passive

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Kit résistances (x100)',      'c1000000-0000-0000-0000-000000000006', 'RES-001',  'available', 'good'),
  ('Kit résistances (x100)',      'c1000000-0000-0000-0000-000000000006', 'RES-002',  'available', 'good'),
  ('Kit résistances (x100)',      'c1000000-0000-0000-0000-000000000006', 'RES-003',  'available', 'good'),
  ('Kit condensateurs (x50)',     'c1000000-0000-0000-0000-000000000006', 'CAP-001',  'available', 'good'),
  ('Kit condensateurs (x50)',     'c1000000-0000-0000-0000-000000000006', 'CAP-002',  'available', 'good'),
  ('Kit diodes 1N4007 (x20)',     'c1000000-0000-0000-0000-000000000006', 'DIO-001',  'available', 'good'),
  ('Kit diodes 1N4007 (x20)',     'c1000000-0000-0000-0000-000000000006', 'DIO-002',  'available', 'good'),
  ('Transistor NPN 2N2222 (x10)', 'c1000000-0000-0000-0000-000000000006', 'TRS-001',  'available', 'good'),
  ('Transistor NPN 2N2222 (x10)', 'c1000000-0000-0000-0000-000000000006', 'TRS-002',  'available', 'good'),
  ('Potentiomètre 10kΩ',          'c1000000-0000-0000-0000-000000000006', 'POT-001',  'available', 'good'),
  ('Potentiomètre 10kΩ',          'c1000000-0000-0000-0000-000000000006', 'POT-002',  'available', 'good'),
  ('Potentiomètre 10kΩ',          'c1000000-0000-0000-0000-000000000006', 'POT-003',  'available', 'good');

-- Connectique & Prototypage

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-001',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-002',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-003',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-004',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-005',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-006',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-007',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-008',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-009',   'available', 'good'),
  ('Breadboard 830 points',       'c1000000-0000-0000-0000-000000000007', 'BB-010',   'available', 'good'),
  ('Kit câbles Breadboard (M-M)', 'c1000000-0000-0000-0000-000000000007', 'CBL-MM01', 'available', 'good'),
  ('Kit câbles Breadboard (M-M)', 'c1000000-0000-0000-0000-000000000007', 'CBL-MM02', 'available', 'good'),
  ('Kit câbles Breadboard (M-M)', 'c1000000-0000-0000-0000-000000000007', 'CBL-MM03', 'available', 'good'),
  ('Kit câbles Breadboard (M-F)', 'c1000000-0000-0000-0000-000000000007', 'CBL-MF01', 'available', 'good'),
  ('Kit câbles Breadboard (M-F)', 'c1000000-0000-0000-0000-000000000007', 'CBL-MF02', 'available', 'good'),
  ('Kit câbles Breadboard (F-F)', 'c1000000-0000-0000-0000-000000000007', 'CBL-FF01', 'available', 'good'),
  ('Câble alimentation USB-A/B',  'c1000000-0000-0000-0000-000000000007', 'PWR-001',  'available', 'good'),
  ('Câble alimentation USB-A/B',  'c1000000-0000-0000-0000-000000000007', 'PWR-002',  'available', 'good'),
  ('Câble alimentation USB-C',    'c1000000-0000-0000-0000-000000000007', 'PWR-003',  'available', 'good'),
  ('Câble alimentation USB-C',    'c1000000-0000-0000-0000-000000000007', 'PWR-004',  'available', 'good'),
  ('Kit connecteurs JST',         'c1000000-0000-0000-0000-000000000007', 'JST-001',  'available', 'good'),
  ('Kit connecteurs Dupont',      'c1000000-0000-0000-0000-000000000007', 'DUP-001',  'available', 'good');

-- Actionneurs

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Petit moteur DC 5V',          'c1000000-0000-0000-0000-000000000008', 'MOT-001',  'available', 'good'),
  ('Petit moteur DC 5V',          'c1000000-0000-0000-0000-000000000008', 'MOT-002',  'available', 'good'),
  ('Petit moteur DC 5V',          'c1000000-0000-0000-0000-000000000008', 'MOT-003',  'available', 'good'),
  ('Petit moteur DC 5V',          'c1000000-0000-0000-0000-000000000008', 'MOT-004',  'available', 'good'),
  ('Petit moteur DC 5V',          'c1000000-0000-0000-0000-000000000008', 'MOT-005',  'available', 'good'),
  ('Servo moteur SG90',           'c1000000-0000-0000-0000-000000000008', 'SRV-001',  'available', 'good'),
  ('Servo moteur SG90',           'c1000000-0000-0000-0000-000000000008', 'SRV-002',  'available', 'good'),
  ('Servo moteur SG90',           'c1000000-0000-0000-0000-000000000008', 'SRV-003',  'available', 'good'),
  ('Servo moteur SG90',           'c1000000-0000-0000-0000-000000000008', 'SRV-004',  'available', 'good'),
  ('Servo moteur SG90',           'c1000000-0000-0000-0000-000000000008', 'SRV-005',  'available', 'good');

-- Identification

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Kit RFID RC522 (lecteur + cartes)', 'c1000000-0000-0000-0000-000000000009', 'RFID-001', 'available', 'good'),
  ('Kit RFID RC522 (lecteur + cartes)', 'c1000000-0000-0000-0000-000000000009', 'RFID-002', 'available', 'good'),
  ('Kit RFID RC522 (lecteur + cartes)', 'c1000000-0000-0000-0000-000000000009', 'RFID-003', 'available', 'good'),
  ('Lecteur code à barres USB',         'c1000000-0000-0000-0000-000000000009', 'BAR-001',  'available', 'good'),
  ('Lecteur code à barres USB',         'c1000000-0000-0000-0000-000000000009', 'BAR-002',  'available', 'good');

-- Interfaces utilisateur

insert into equipment (name, category_id, serial_number, status, quality) values
  ('Boutons poussoirs (x10)',     'c1000000-0000-0000-0000-000000000010', 'BTN-001',  'available', 'good'),
  ('Boutons poussoirs (x10)',     'c1000000-0000-0000-0000-000000000010', 'BTN-002',  'available', 'good'),
  ('Boutons poussoirs (x10)',     'c1000000-0000-0000-0000-000000000010', 'BTN-003',  'available', 'good');
