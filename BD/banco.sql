-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS hackathon_etec
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hackathon_etec;

-- Tabela de Cursos Técnicos
CREATE TABLE curso_tecnico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  abreviacao VARCHAR(20) NOT NULL,
  periodo ENUM('Diurno','Noturno','Modular') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Professores
CREATE TABLE professor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  abreviacao VARCHAR(20) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Disciplinas (vinculada ao curso correspondente)
CREATE TABLE disciplina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  abreviacao VARCHAR(20) NOT NULL,
  curso_id INT NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES curso_tecnico(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Horários Possíveis
CREATE TABLE horario_possivel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  horario_inicial TIME NOT NULL,
  horario_final   TIME NOT NULL,
  descricao       VARCHAR(100),
  intervalo       BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Relacionamento Professor × Disciplina
CREATE TABLE professor_disciplina (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professor_id  INT NOT NULL,
  disciplina_id INT NOT NULL,
  FOREIGN KEY (professor_id) REFERENCES professor(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (disciplina_id) REFERENCES disciplina(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Horários Agendados
CREATE TABLE horario_agendado (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana    ENUM('Segunda','Terca','Quarta','Quinta','Sexta','Sabado','Domingo') NOT NULL,
  horario_id    INT NOT NULL,
  prof_disc_id  INT NOT NULL,
  FOREIGN KEY (horario_id)    REFERENCES horario_possivel(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (prof_disc_id)  REFERENCES professor_disciplina(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Usuários de Acesso (admin e cliente)
CREATE TABLE usuario (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(100) NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  senha          VARCHAR(255) NOT NULL,
  tipo           ENUM('ADMIN','CLIENTE') NOT NULL,
  data_cadastro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso  DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
