<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/../../db_config.php';

$sql = "SELECT id, nome, periodo FROM curso_tecnico ORDER BY nome";
$result = $conn->query($sql);
$cursos = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $cursos[] = $row;
    }
}

echo json_encode(['cursos' => $cursos], JSON_UNESCAPED_UNICODE);
$conn->close();
?>