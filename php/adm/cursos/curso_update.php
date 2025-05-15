<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/../../db_config.php';

$input   = json_decode(file_get_contents('php://input'), true);
$id      = intval($input['id']      ?? 0);
$nome    = trim  ($input['nome']    ?? '');
$periodo = trim  ($input['periodo'] ?? '');

if ($id <= 0 || !$nome || !$periodo) {
    http_response_code(400);
    echo json_encode([
      'success' => false,
      'message' => 'ID, nome e período são obrigatórios'
    ], JSON_UNESCAPED_UNICODE);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("
  UPDATE curso
     SET nome = ?, periodo = ?
   WHERE id = ?
");
$stmt->bind_param("ssi", $nome, $periodo, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Erro ao atualizar curso'
    ], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
