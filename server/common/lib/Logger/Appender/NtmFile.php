<?php
/**
 * File.php
 *
 * @package
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

class Logger_Appender_NtmFile {
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
		
		//var_dump($token);
		if ( empty($token['logid']) ) {
			$line		=	$token['time'] .
						"\t" . $token['level'] .
						"\t" . $remoteAddr .
						"\t" . $serverAddr .
						"\t" . $token['file'] .
						":" . $token['line'] .
						"\t" . $token['code'] .
						"\t" . $token['msg'];
		} else {
			$type = ($token["type"] == 'NUM') ? 2 : 1 ;

			$levelMask	=	constant('LogLevel::' . $token['level']);
			$levelcode = log($levelMask, 2);

			$line		=	"[{$token['time']}]" .
				"[{$token['level']}]" .
				"[{$token['file']}]"  .
				"[{$token['line']}]"  .
				"[+++TNM2+++{$type}+++{$token['logid']}+++{$levelcode}+++{$token['msg']}+++]\n";

  //define LOG_P_ALARM_STR(lvl, logid, fmt, args...)	        log_i(LOG_FLAG_TIME|LOG_FLAG_LEVEL, LOG_FATAL, "[%-10s][%-4d][%-10s][+++TNM2+++1+++%-2d+++%-6d+++"fmt"+++]\n", __FILE__, __LINE__, __FUNCTION__, logid, lvl, ##args)
		}
		
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
		$logsubdir = 'ntm';
		$logdir = $this->_options['logBaseDir'] . $logsubdir;

		if ( is_dir($logdir) === false ) {
			umask(0);
			mkdir($logdir, 0777);
		}

		$fileName	=	$logdir . '/' . $this->_options['fileName'];

		if (is_file($fileName) && filesize($fileName) > $this->_options['maxFileSize']  ) {
			for ( $i = $this->_options['maxArchives'] - 1; $i > 0; --$i ) {
				if ( is_file($fileName . '.' . $i) ) {
					rename($fileName . '.' . $i, $fileName . '.' . ($i + 1));
				}
			}
			if ( is_file($fileName) ) {
				rename($fileName, $fileName . '.1');
			}
		}

		//maybe write \n at begin of file
		if ( file_put_contents($fileName, implode("\n", $this->_msgQueue)  . "\n", FILE_APPEND) === false ) {
			//throw new Exception(__METHOD__ . '|' . __LINE__ . ': Cannot write contents to file ' . $fileName);
			trigger_error(__METHOD__ . '|' . __LINE__ . ': cannot write contents to file ' . $fileName);
		}
		$this->_msgQueue	=	array();

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
