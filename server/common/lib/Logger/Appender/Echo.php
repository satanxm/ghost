<?php
/**
 * Echo.php		echo log info
 *
 * @package		Logger.Appender
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */


class Logger_Appender_Echo
{
	protected static $_instance	=	null;
	
	protected function __construct($params) {}
	
	/**
	 * get instance
	 *
	 * @param array $params
	 * 
	 * @return Logger_Appender_Abstract
	 */
	public static function getInstance($params)
	{
		if ( self::$_instance == null )
		{
			self::$_instance	=	new self($params);
		}
		
		return self::$_instance;
	}
	
	public function doAppend($token)
	{
		echo '<pre>';
		var_dump($token);
		echo '</pre>';
	}
}

//end of script
