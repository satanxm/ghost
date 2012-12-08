<?php
/**
 * Appender.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

/**
 * appender factory
 *
 */
abstract class Logger_Appender {
	/**
	 * Enter description here...
	 *
	 * @param string $name
	 * @param string $type
	 * @param array $options
	 * 
	 * @return Logger_Appender_Interface
	 */
	public static function singleton($type, $options)
	{
		static $instances	=	array();
		$key	=	self::_makeKey($type, $options);
		if ( !isset($instances[$key]) )
		{
			require_once ROOT_PATH . 'includes/Logger/Appender/' . $type . '.php';
			$className	=	'Logger_Appender_' . $type;
			$appender	=	new $className($options);
			$instances[$key]	=	$appender;
		}
		
		return $instances[$key];
	}
	
	public static function factory($type, $options)
	{
		require_once ROOT_PATH . 'includes/Logger/Appender/' . $type . '.php';
		$className	=	'Logger_Appender_' . $type;
		$appender	=	new $className($options);
		
		return $appender;
	}
	
	protected static function _makeKey($type, $options)
	{
		$key	=	md5($type . serialize($options));
		return $key;
	}
}

//end of script
