<?php
/**
 * EchoText.php	echo log info
 *
 * @package		Logger.Appender
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id: EchoText.php 20837 2011-10-20 02:01:04Z spencerliang $
 */


class Logger_Appender_EchoText
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
		echo "{$token['msg']}\n";
	}
}

//end of script
