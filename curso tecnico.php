<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sistema_cursos');

class Database {
    private $connection;

    public function __construct() {
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($this->connection->connect_error) {
            die('Erro na conexão: ' . $this->connection->connect_error);
        }
        
        $this->connection->set_charset("utf8");
    }

    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql) {
        return $this->connection->query($sql);
    }
    
    public function escape($value) {
        return $this->connection->real_escape_string($value);
    }
    
    public function close() {
        $this->connection->close();
    }
}
class CursoTecnico {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
        $this->verificarTabela();
    }
    
    private function verificarTabela() {
        $sql = "CREATE TABLE IF NOT EXISTS cursos_tecnicos (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            abreviacao VARCHAR(10) NOT NULL,
            periodo VARCHAR(20) NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        $this->db->query($sql);
    }
    
    public function adicionar($nome, $abreviacao, $periodo) {
        $nome = $this->db->escape($nome);
        $abreviacao = $this->db->escape($abreviacao);
        $periodo = $this->db->escape($periodo);
        
        $sql = "INSERT INTO cursos_tecnicos (nome, abreviacao, periodo) 
                VALUES ('$nome', '$abreviacao', '$periodo')";
        
        if ($this->db->query($sql)) {
            return true;
        }
        
        return false;
    }
    
    public function listarTodos() {
        $sql = "SELECT * FROM cursos_tecnicos ORDER BY nome";
        $result = $this->db->query($sql);
        
        $cursos = [];
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $cursos[] = $row;
            }
        }
        
        return $cursos;
    }
    
    public function obterPorId($id) {
        $id = (int)$id;
        
        $sql = "SELECT * FROM cursos_tecnicos WHERE id = $id";
        $result = $this->db->query($sql);
        
        if ($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    public function atualizar($id, $nome, $abreviacao, $periodo) {
        $id = (int)$id;
        $nome = $this->db->escape($nome);
        $abreviacao = $this->db->escape($abreviacao);
        $periodo = $this->db->escape($periodo);
        
        $sql = "UPDATE cursos_tecnicos 
                SET nome = '$nome', 
                    abreviacao = '$abreviacao', 
                    periodo = '$periodo' 
                WHERE id = $id";
        
        if ($this->db->query($sql)) {
            return true;
        }
        
        return false;
    }
    
    public function excluir($id) {
        $id = (int)$id;
        
        $sql = "DELETE FROM cursos_tecnicos WHERE id = $id";
        
        if ($this->db->query($sql)) {
            return true;
        }
        
        return false;
    }
}

function executarAcao() {
    $acao = isset($_GET['acao']) ? $_GET['acao'] : 'listar';
    $cursoTecnico = new CursoTecnico();
    
    switch ($acao) {
        case 'adicionar':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $nome = $_POST['nome'] ?? '';
                $abreviacao = $_POST['abreviacao'] ?? '';
                $periodo = $_POST['periodo'] ?? '';
                
                if ($cursoTecnico->adicionar($nome, $abreviacao, $periodo)) {
                    header('Location: index.php?mensagem=Curso adicionado com sucesso!');
                } else {
                    header('Location: index.php?mensagem=Erro ao adicionar curso.');
                }
                exit;
            }
            include 'form_adicionar.php';
            break;
            
        case 'editar':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            $curso = $cursoTecnico->obterPorId($id);
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $nome = $_POST['nome'] ?? '';
                $abreviacao = $_POST['abreviacao'] ?? '';
                $periodo = $_POST['periodo'] ?? '';
                
                if ($cursoTecnico->atualizar($id, $nome, $abreviacao, $periodo)) {
                    header('Location: index.php?mensagem=Curso atualizado com sucesso!');
                } else {
                    header('Location: index.php?mensagem=Erro ao atualizar curso.');
                }
                exit;
            }
            
            if ($curso) {
                include 'form_editar.php';
            } else {
                header('Location: index.php?mensagem=Curso não encontrado.');
                exit;
            }
            break;
            
        case 'excluir':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            if ($cursoTecnico->excluir($id)) {
                header('Location: index.php?mensagem=Curso excluído com sucesso!');
            } else {
                header('Location: index.php?mensagem=Erro ao excluir curso.');
            }
            exit;
            break;
            
        case 'listar':
        default:
            $cursos = $cursoTecnico->listarTodos();
            include 'listar_cursos.php';
            break;
    }
}
executarAcao();
?>