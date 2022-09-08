<?php
require 'inc/config.php';
require 'inc/funcs.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') require 'inc/post.php';
checkInstall();
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<?php include('header.php')?>
	</head>
	<body>
		<?php include('body.php')?>
	</body>
</html>
