<?php
/**
 * Logger.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

require_once COMM_PATH . 'lib/Logger/Hierarchy.php';

/**
 * logger factory
 *
 */
abstract class Logger {
	/**
	 * default construct
	 *
	 */
	public function __construct() {
	}
	
	/**
	 * get logger from hierarchy
	 *
	 * @param string $logName
	 * @param array $cfg
	 * 
	 * @return Logger_Core
	 */
	public static function getLogger($logName = '', array $cfg = array()) {
		static $hierarchy	=	null;
		if ( is_null($hierarchy) ) {
			if ( empty($cfg) ) {
				if ( empty($GLOBALS['_log_cfg']) ) {
					require_once COMM_PATH . 'lib/Logger/Config.php';
					$cfg	=	$_log_cfg;
				} else {
					$cfg	=	$GLOBALS['_log_cfg'];
				}
			}
			//class hierarchy
			$hierarchy	=	new Logger_Hierarchy($cfg);
		} else {
			if ( !empty($cfg) ) {
				$hierarchy->setConfigure($cfg);
			}
		}
		
		if ( empty($logName) ) {
			if ( isset($_REQUEST['mod']) ) {
				$logName	=	preg_replace("/[^a-z0-9]/", '', strtolower(trim($_REQUEST['mod'])));
			}
			
			if ( empty($logName) ) {
				$logName	=	rtrim(basename($_SERVER['SCRIPT_FILENAME']), '.php');
			}
		}
		
		$log	=	$hierarchy->getLogger($logName);
		
		return $log;
	}
}

//end of script
