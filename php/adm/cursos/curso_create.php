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

// Validação mínima
if (!$nome || !$periodo) {
    http_response_code(400);
    echo json_encode([
      'success' => false,
      'message' => 'Nome e período são obrigatórios'
    ], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

// Insere no banco
$stmt = $conn->prepare("
  INSERT INTO curso_tecnico (nome, periodo)
  VALUES (?, ?)
");
$stmt->bind_param("ss", $nome, $periodo);

if ($stmt->execute()) {
    echo json_encode([
      'success' => true,
      'id'      => $stmt->insert_id
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Erro ao criar curso'
    ], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
