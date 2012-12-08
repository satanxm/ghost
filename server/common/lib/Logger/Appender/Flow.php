<?php
/**
 * Flow.php		
 *
 * @package		
 * @Copyright	(c) 1998-2008 All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

class Logger_Appender_Flow {
	protected static $_instances	=	array();

	protected $_msgQueue	=	array();
	protected $_options		=	array(
		'logBaseDir'	=>	'./log/',
		'logName'		=>	'',
		'fileName'		=>	'',
		'maxFileSize'	=>	104857600,		//100M
		'maxQueueSize'	=>	1,
		'maxArchives'	=>	128,
		'flushSpace'	=>	5				//
	);

	protected function __construct($params) {
		$this->_options		=	array_merge($this->_options, $params);
		clearstatcache();
		if ( is_dir($this->_options['logBaseDir']) === false ) {
			umask(0);
			mkdir($this->_options['logBaseDir'], 0777);
		}
	}

	public static function getInstance($params) {
		if ( empty($params['fileName']) ) {
			$params['fileName']	=	$params['logName'] . '.log';
		}
		$key	=	self::_makeKey($params);
		if ( !isset(self::$_instances[$key]) ) {
			self::$_instances[$key]	=	new self($params);
		}

		return self::$_instances[$key];
	}

	public function doAppend(array $token) {
		$line		=	$token['time'] . "\t" . $token['msg'];

		$this->_msgQueue[]	=	$line;
		if ( (count($this->_msgQueue) >= $this->_options['maxQueueSize']) ) {
			$this->flush();
		}
	}

	/**
	 * set log name
	 *
	 * @param string $logName
	 */
	public function setLogger($logName) {
		$this->_logName	=	$logName;
	}

	/**
	 * flush queue to file
	 *
	 */
	public function flush() {
		clearstatcache();
		//maybe write \n at begin of file
		$fileName	=	$this->_options['logBaseDir'] . $this->_options['fileName'];
		if ( file_put_contents($fileName, implode("\n", $this->_msgQueue)  . "\n", FILE_APPEND) === false ) {
			//throw new Exception(__METHOD__ . '|' . __LINE__ . ': Cannot write contents to file ' . $fileName);
			trigger_error(__METHOD__ . '|' . __LINE__ . ': cannot write contents to file ' . $fileName);
		}
		$this->_msgQueue	=	array();

		if ( filesize($fileName) > $this->_options['maxFileSize'] ) {
			for ( $i = $this->_options['maxArchives'] - 1; $i > 0; --$i ) {
				if ( is_file($fileName . '.' . $i) ) {
					rename($fileName . '.' . $i, $fileName . '.' . ($i + 1));
				}
			}
			if ( is_file($fileName) ) {
				rename($fileName, $fileName . '.1');
			}
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
		if ( count($this->_msgQueue) > 0 ) {
			$this->flush();
		}
	}
}

//end of script
