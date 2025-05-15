<?php
// disciplinas.php — Lista todas as disciplinas
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
    echo json_encode(['message' => 'Falha na conexão: '.$conn->connect_error]);
    exit;
}

// Busca todas as disciplinas
$sql = "SELECT id, nome, curso_id, professor_id FROM disciplina";
$result = $conn->query($sql);

$disciplinas = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $disciplinas[] = $row;
    }
}

echo json_encode(['disciplinas' => $disciplinas], JSON_UNESCAPED_UNICODE);
$conn->close();
