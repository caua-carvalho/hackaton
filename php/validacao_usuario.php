<?php
// 📌 Cabeçalhos CORS + JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db_config.php';

// 📥 Lê JSON do corpo
$input    = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username']  ?? '');
$password = trim($input['password']  ?? '');

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['message' => 'Username e password são obrigatórios'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 🔎 Busca ID, SENHA e TIPO na tabela USUARIO
$stmt = $conn->prepare("SELECT id, senha, tipo FROM usuario WHERE email = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->bind_result($userId, $dbPassword, $userType);
$found = $stmt->fetch();
$stmt->close();

if (!$found) {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciais inválidas'], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

// 🔐 Verifica senha em texto puro
if (hash('sha256', $password) !== $dbPassword) {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciais inválidas'], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

// 🛡️ Gera token simples
$token = bin2hex(random_bytes(16));

// ✅ Retorna JSON com token e dados do usuário
echo json_encode([
    'token' => $token,
    'user'  => [
        'id'       => $userId,
        'username' => $username,
        'type'     => $userType
    ]
], JSON_UNESCAPED_UNICODE);

$conn->close();
