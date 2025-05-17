<?php
// Garante que todo output seja JSON
header('Content-Type: application/json; charset=utf-8');
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responde preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Caminho absoluto para o config
require_once __DIR__ . '/../../db_config.php';

// Lê JSON do corpo
$input = json_decode(file_get_contents('php://input'), true);
$nome    = trim($input['nome']    ?? '');
$periodo = trim($input['periodo'] ?? '');

// Função para gerar resposta de erro
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}

// Função para validar campos
function validateFields($data, $required = []) {
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            sendError("O campo '$field' é obrigatório");
        }
    }
}

// Função para conectar ao banco de dados
function connectDB() {
    global $db_host, $db_name, $db_user, $db_pass;
    
    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        sendError("Erro de conexão com banco de dados: " . $e->getMessage(), 500);
    }
}

// ROTAS DE API

// Cadastro de usuário
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'cadastrar') {
    // Lê JSON do corpo
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Valida campos
    validateFields($input, ['nome', 'periodo']);
    
    $nome = trim($input['nome']);
    $periodo = trim($input['periodo']);
    $email = trim($input['email'] ?? '');
    $telefone = trim($input['telefone'] ?? '');
    
    // Validações adicionais
    if (strlen($nome) < 3) {
        sendError("O nome deve ter pelo menos 3 caracteres");
    }
    
    if (!in_array($periodo, ['Manhã', 'Tarde', 'Noite'])) {
        sendError("Período inválido. Use 'Manhã', 'Tarde' ou 'Noite'");
    }
    
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError("Email inválido");
    }
    
    try {
        $pdo = connectDB();
        
        // Verifica se usuário já existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0 && !empty($email)) {
            sendError("Este email já está cadastrado", 409);
        }
        
        // Insere o novo usuário
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, periodo, email, telefone, data_cadastro) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$nome, $periodo, $email, $telefone]);
        
        $userId = $pdo->lastInsertId();
        
        // Retorna sucesso
        echo json_encode([
            'success' => true,
            'message' => 'Usuário cadastrado com sucesso',
            'data' => [
                'id' => $userId,
                'nome' => $nome,
                'periodo' => $periodo
            ]
        ]);
    } catch (PDOException $e) {
        sendError("Erro ao cadastrar usuário: " . $e->getMessage(), 500);
    }
}

// Listar usuários
else if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'listar') {
    $periodo = isset($_GET['periodo']) ? trim($_GET['periodo']) : '';
    
    try {
        $pdo = connectDB();
        
        if (!empty($periodo)) {
            // Filtra por período
            $stmt = $pdo->prepare("SELECT id, nome, periodo, email, telefone, DATE_FORMAT(data_cadastro, '%d/%m/%Y %H:%i') as data_cadastro FROM usuarios WHERE periodo = ? ORDER BY nome");
            $stmt->execute([$periodo]);
        } else {
            // Lista todos
            $stmt = $pdo->query("SELECT id, nome, periodo, email, telefone, DATE_FORMAT(data_cadastro, '%d/%m/%Y %H:%i') as data_cadastro FROM usuarios ORDER BY nome");
        }
        
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'total' => count($usuarios),
            'data' => $usuarios
        ]);
    } catch (PDOException $e) {
        sendError("Erro ao listar usuários: " . $e->getMessage(), 500);
    }
}
