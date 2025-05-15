-- 1. Cursos técnicos (criado primeiro para usar como referência)
CREATE TABLE curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  abreviacao VARCHAR(20) NOT NULL,
  periodo ENUM('Diurno','Noturno','Modular') NOT NULL
);

-- 2. Usuários (ADM, PROFESSOR, ALUNO)
CREATE TABLE usuario (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100)     NOT NULL,
  email VARCHAR(150)    NOT NULL UNIQUE,
  senha VARCHAR(255)    NOT NULL,
  tipo  ENUM('ADM','PROFESSOR','ALUNO') NOT NULL
);

-- 3. Matrícula de alunos em curso (1-aluno ⇆ 1-curso)
CREATE TABLE matricula_aluno (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  curso_id   INT NOT NULL,
  UNIQUE(usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (curso_id)   REFERENCES curso(id)
);

-- 4. Disciplinas, vinculadas a um curso e a um único professor
CREATE TABLE disciplina (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL,
  curso_id      INT          NOT NULL,
  professor_id  INT          NOT NULL,
  FOREIGN KEY (curso_id)     REFERENCES curso(id),
  FOREIGN KEY (professor_id) REFERENCES usuario(id)
);

-- 5. Horários fixos por período (sem aulas sáb/dom)
CREATE TABLE horario (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  periodo    ENUM('Diurno','Noturno','Modular') NOT NULL,
  dia_semana TINYINT NOT NULL,    -- 1=Segunda ... 5=Sexta
  inicio     TIME    NOT NULL,
  fim        TIME    NOT NULL
);

-- 6. Grade de aulas: combinação Disciplina + Horário
CREATE TABLE grade (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  disciplina_id INT NOT NULL,
  horario_id    INT NOT NULL,
  FOREIGN KEY (disciplina_id) REFERENCES disciplina(id),
  FOREIGN KEY (horario_id)    REFERENCES horario(id)
);
