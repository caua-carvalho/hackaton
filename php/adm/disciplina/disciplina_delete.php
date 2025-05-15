<?php
// disciplina_delete.php — Remove uma disciplina
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID não informado']);
    exit;
}

// Configurações de conexão
$servername = "sql301.infinityfree.com";
$dbUsername = "if0_38976000";
$dbPassword = "HackathonEtec7";
$dbname     = "if0_38976000_hackathon";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset('utf8');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Falha na conexão']);
    exit;
}

// Deleta disciplina
$stmt = $conn->prepare("DELETE FROM tb_disciplina WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
