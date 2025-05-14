<?php
// api/login.php

// 1) Headers CORS e tipo de resposta
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Responde pré-voo CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2) Configuração do banco
$servername   = "localhost";
$dbUsername   = "seu_usuario";
$dbPassword   = "sua_senha";
$dbName       = "seu_banco";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);
mysqli_set_charset($conn, "utf8");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro na conexão: ' . $conn->connect_error]);
    exit;
}

// 3) Leitura do JSON enviado pelo React
$input    = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username']  ?? '');
$password = trim($input['password']  ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username e password são obrigatórios']);
    exit;
}

// 4) Consulta o usuário
$stmt = $conn->prepare("
    SELECT idUsuario, nome, senha_hash 
    FROM tb_usuario 
    WHERE username = ?
");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->bind_result($idUsuario, $nome, $senhaHash);
$found = $stmt->fetch();
$stmt->close();

if (!$found) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
    $conn->close();
    exit;
}

// 5) Verifica a senha
if (!password_verify($password, $senhaHash)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
    $conn->close();
    exit;
}

// 6) Autenticação OK — retorna dados do usuário
echo json_encode([
    'success' => true,
    'user'    => [
        'id'   => $idUsuario,
        'nome' => $nome,
        'username' => $username
    ]
]);

$conn->close();
