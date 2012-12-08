<?php

define('DEFAULT_DOMAIN', 'ghost.com');

define('DEFAULT_QR_SIZE', 6);
define('DEFAULT_QR_LEVEL', 'Q');

define('QR_MAX_SIZE', 10);
define('QR_MIN_SIZE', 1);

$_qr_level = array(
	1 => 'L',
	2 => 'M',
	3 => 'Q',
	4 => 'H',
);

// 域名白名单
$_trust_domain = array(
	DEFAULT_DOMAIN,
);

?>
