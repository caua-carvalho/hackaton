<?php
// disciplina_update.php — Atualiza uma disciplina existente
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id           = $input['id']           ?? 0;
$nome         = $input['nome']         ?? '';
$abreviacao   = $input['abreviacao']   ?? '';
$id_curso     = $input['id_curso']     ?? 0;

if (!$id || !$nome || !$abreviacao || !$id_curso) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
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

// Atualiza disciplina
$stmt = $conn->prepare("
    UPDATE tb_disciplina
       SET nome = ?, abreviacao = ?, id_curso = ?
     WHERE id = ?
");
$stmt->bind_param("ssii", $nome, $abreviacao, $id_curso, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
