<?php
/**
 * Queue.php		
 *
 * @package		
 * @Copyright	(c) 1998-2008 All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

class Logger_Appender_Queue {
	protected static $_instances	=	array();
	
	protected $_options		=	array(
		'key'		=>	-1,
		'perm'		=>	0777,
		'msgtype'	=>	0,
		'blocking'	=>	0
	);
	
	protected $_msgKey;

	protected function __construct($params) {
		$this->_options		=	array_merge($this->_options, $params);
		
		$this->_msgKey		=	msg_get_queue($this->_options['key'], $this->_options['perm']);
	}

	public static function getInstance($params) {
		$key	=	self::_makeKey($params);
		if ( !isset(self::$_instances[$key]) ) {
			self::$_instances[$key]	=	new self($params);
		}

		return self::$_instances[$key];
	}

	public function doAppend(array $token) {
		if ( msg_send($this->_msgKey, $this->_options['msgtype'], $msg, 1, $this->_options['blocking'], $errorCode) === false ) {
			trigger_error("error send msg", E_CORE_WARNING);
		}
	}

	protected static function _makeKey($params) {
		return md5(serialize($params));
	}

	/**
	 * desctruct
	 *
	 */
	public function __destruct() {
	}
}

//end of script
