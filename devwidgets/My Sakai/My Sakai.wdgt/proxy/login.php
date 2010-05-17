<?php
// Set your return content type
header('Content-type: application/xml');

// Website url to open
$daurl = "http://localhost:8080/system/sling/formlogin";

// Get that website's content
$handle = fopen($daurl, "r");

// If there is something, read and return
if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
?>