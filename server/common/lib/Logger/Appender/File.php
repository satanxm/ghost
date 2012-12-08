<?php
/**
 * File.php
 *
 * @package
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

class Logger_Appender_File {
	protected static $_instances	=	array();

	protected $_msgQueue	=	array();
	protected $_options		=	array(
		'logBaseDir'	=>	'./log/',
		'logName'		=>	'',
		'fileName'		=>	'',
		'maxFileSize'	=>	104857600,		//100M
		'maxQueueSize'	=>	5,
		'maxArchives'	=>	128,
		'flushSpace'	=>	5				//
	);

	protected $_date		=	'';
	protected $_flushAge	=	0;
	
	protected function __construct($params) {
		$this->_options		=	array_merge($this->_options, $params);
		$this->_date		=	date('Ymd');
		//clearstatcache();
		if ( is_dir($this->_options['logBaseDir'] . $this->_date) === false ) {
			umask(0);
			mkdir($this->_options['logBaseDir'] . $this->_date, 0777);
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
		$remoteAddr	=	(isset($_SERVER['REMOTE_ADDR'])) ? $_SERVER['REMOTE_ADDR'] : 0;
		$serverAddr	=	(isset($_SERVER['SERVER_ADDR'])) ? $_SERVER['SERVER_ADDR'] : 0;
		$line		=	$token['time'] .
						"\t" . $token['level'] .
						"\t" . $remoteAddr .
						"\t" . $serverAddr .
						"\t" . $token['file'] .
						":" . $token['line'] .
						"\t" . $token['code'] .
						"\t" . $token['msg'];

		$this->_msgQueue[]	=	$line;
		if ( (count($this->_msgQueue) >= $this->_options['maxQueueSize']) || (time() > $this->_flushAge) ) {
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
		$this->_flushAge	=	time() + $this->_options['flushSpace'];
		$curDate			=	date('Ymd');
		if ( $this->_date < $curDate ) {
			$this->_date	=	$curDate;
			if ( is_dir($this->_options['logBaseDir'] . $this->_date) === false ) {
				umask(0);
				mkdir($this->_options['logBaseDir'] . $this->_date, 0777);
			}
			
			$tmpMsgs			=	$this->_msgQueue;
			$this->_msgQueue	=	array();
			foreach ( $tmpMsgs as $msg ) {
				$msgDate	=	str_replace('-', '', substr($msg, 0, 10));
				if ( $curDate > $msgDate ) {
					$fileName	=	$this->_options['logBaseDir'] . $msgDate . '/' . $this->_options['fileName'];
					//dir may be not existed
					if ( file_put_contents($fileName, $msg  . "\n", FILE_APPEND) === false ) {
						//throw new Exception(__METHOD__ . '|' . __LINE__ . ': Cannot write contents to file ' . $fileName);
						trigger_error(__METHOD__ . '|' . __LINE__ . ': cannot write contents to file ' . $fileName);
					}
				} else {
					$this->_msgQueue[]	=	$msg;
				}
			}
		}

		//maybe write \n at begin of file
		$fileName	=	$this->_options['logBaseDir'] . $this->_date . '/' . $this->_options['fileName'];
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
