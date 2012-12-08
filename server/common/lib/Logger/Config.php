<?php
/**
 * Config.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

$_log_cfg	=	array();

$_log_cfg['appenders']['file']	=	array(
	'type'		=>	'File',
	'options'	=>	array(
		'logBaseDir'	=>	ROOT_PATH . 'log/'
	)
);

$_log_cfg['appenders']['flow']	=	array(
	'type'		=>	'Flow',
	'options'	=>	array(
		'logBaseDir'	=>	ROOT_PATH . 'log/'
	)
);

$_log_cfg['appenders']['echo']	=	array(
	'type'		=>	'Echo',
	'options'	=>	array()
);

$_log_cfg['loggers']['root']	=	array(
	'level'			=>	LogLevel::ALL,
	'appenders'		=>	array('file')
);

$_log_cfg['loggers']['pdog']	=	array(
	'level'			=>	LogLevel::ALL,
	'appenders'		=>	array('flow')
);

//end of script
