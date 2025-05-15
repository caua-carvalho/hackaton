<?php
// Arquivo de conexão reutilizável
$servername = "sql301.infinityfree.com";
$dbUsername = "if0_38976000";
$dbPassword = "HackathonEtec7";
$dbname     = "if0_38976000_hackathon";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
mysqli_set_charset($conn, "utf8");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['message' => 'Falha na conexão: ' . $conn->connect_error], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
