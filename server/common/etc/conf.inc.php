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

// 日志配置
$_log_cfg = array();
$_log_cfg['appenders']['file'] = array(
	'type'		=> 'File',
	'options'	=> array(
		'maxQueueSize'	=> 1, // 每多少条消息刷入硬盘，外网环境，这个配置要修改成比较大的数值
		'logBaseDir'	=> ROOT_PATH . 'log/',
	),
);

// 日志级别
if (!interface_exists('LogLevel')) {
	require_once COMM_PATH . 'lib/Logger/Core.php';
}
// 默认日志
$_log_cfg['loggers']['root'] = array(
	'level'		=> LogLevel::DEBUG,
	'appenders' => array('file'),
);



?>
