<?php
// api/login.php

// 1) CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Configurações de conexão
$servername = "localhost";
$dbUsername = "seu_usuario";
$dbPassword = "sua_senha";
$dbname     = "seu_banco";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
mysqli_set_charset($conn, "utf8");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['message' => 'Falha na conexão: ' . $conn->connect_error]);
    exit;
}

// 3) Pega JSON do body
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['message' => 'Username e password são obrigatórios']);
    exit;
}

// 4) Busca usuário no banco
$stmt = $conn->prepare("SELECT idUsuario, senha_hash FROM tb_usuario WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->bind_result($userId, $hash);
$found = $stmt->fetch();
$stmt->close();

if (!$found) {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciais inválidas']);
    $conn->close();
    exit;
}

// 5) Verifica senha
if (!password_verify($password, $hash)) {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciais inválidas']);
    $conn->close();
    exit;
}

// 6) Gera token simples (você pode trocar por JWT)
$token = bin2hex(random_bytes(16));

// (Opcional) Salvar token no banco para validar depois

// 7) Retorna resposta com token e dados do usuário
echo json_encode([
    'token' => $token,
    'user'  => [
        'id'       => $userId,
        'username' => $username
    ]
]);

$conn->close();
