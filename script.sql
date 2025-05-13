-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS etec_horarios;
USE etec_horarios;

-- Tabela de cursos técnicos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10) NOT NULL,
    periodo VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

-- Tabela de professores
CREATE TABLE professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL -- armazenar hash
) ENGINE=InnoDB;

-- Tabela de disciplinas
CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10) NOT NULL,
    id_curso INT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de possibilidades de horários
CREATE TABLE possibilidades_horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    horario_inicial TIME NOT NULL,
    horario_final TIME NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    intervalo BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- Tabela de relacionamento professor x disciplina
CREATE TABLE professor_disciplina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_professor INT NOT NULL,
    id_disciplina INT NOT NULL,
    FOREIGN KEY (id_professor) REFERENCES professores(id)
        ON DELETE CASCADE,
    FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de horários
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    id_possibilidade_horario INT NOT NULL,
    id_professor_disciplina INT NOT NULL,
    id_curso INT NOT NULL,
    FOREIGN KEY (id_possibilidade_horario) REFERENCES possibilidades_horario(id)
        ON DELETE CASCADE,
    FOREIGN KEY (id_professor_disciplina) REFERENCES professor_disciplina(id)
        ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de usuários administradores
CREATE TABLE usuarios_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    email_recuperacao VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Inserção de um admin padrão (senha fictícia — sempre criptografar no backend)
INSERT INTO usuarios_admin (username, senha, email_recuperacao)
VALUES ('admin', '123456', 'admin@etecsjc.com');

-- Inserção de horários base
INSERT INTO possibilidades_horario (horario_inicial, horario_final, descricao, intervalo)
VALUES
('07:00:00', '07:50:00', '1ª Aula', FALSE),
('07:50:00', '08:40:00', '2ª Aula', FALSE),
('08:40:00', '09:30:00', '3ª Aula', FALSE),
('09:30:00', '09:50:00', 'Intervalo', TRUE),
('09:50:00', '10:40:00', '4ª Aula', FALSE),
('10:40:00', '11:30:00', '5ª Aula', FALSE);
