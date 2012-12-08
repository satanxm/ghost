<?php
/**
 * FileTwo.php		
 *
 * @package		
 * @Copyright	(c) 1998-2008 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

class Logger_Appender_FileTwo {
	protected static $_instances	=	array();
	
	protected $_msgQueue	=	array();
	protected $_options		=	array(
		'logName'		=>	'',
		'fileName'		=>	'',
		'maxFileSize'	=>	104857600,		//100M
		'maxQueueSize'	=>	10,
		'maxArchives'	=>	128
	);
	
	protected $_date	=	'';
	protected $_handle	=	null;
	
	protected function __construct($params)
	{
		$this->_options	=	array_merge($this->_options, $params);
		$this->_date	=	date('Ymd');
		if ( !is_dir(ROOT_PATH . 'logs/' . $this->_date) )
		{
			umask(0000);
			mkdir(ROOT_PATH . 'logs/' . $this->_date, 0777);
		}
	}
	
	public static function getInstance($params)
	{
		if ( empty($params['fileName']) )
		{
			$params['fileName']	=	$params['logName'] . '.log';
		}
		$key	=	self::_makeKey($params);
		if ( !isset(self::$_instances[$key]) )
		{
			self::$_instances[$key]	=	new self($params);
		}
		
		return self::$_instances[$key];
	}
	
	public function doAppend($token)
	{
		if ( count($this->_msgQueue) >= $this->_options['maxQueueSize'] )
		{
			$this->flush();
		}
		$remoteAddr	=	(isset($_SERVER['REMOTE_ADDR'])) ? $_SERVER['REMOTE_ADDR'] : 0;
		$serverAddr	=	(isset($_SERVER['SERVER_ADDR'])) ? $_SERVER['SERVER_ADDR'] : 0;
		
		$line	=	$token['time'] .
						"\t" . $token['level'] .
						"\t" . $remoteAddr .
						"\t" . $serverAddr .
						"\t" . $token['file'] .
						":" . $token['line'] .
						"\t" . $token['code'] .
						"\t" . $token['msg'];

		$this->_msgQueue[]	=	$line;
	}
	
	public function setLogger($logName)
	{
		$this->_logName	=	$logName;
	}
	
	/**
	 * flush queue to file
	 *
	 */
	public function flush()
	{
		$curDate	=	date('Ymd');
		if ( $this->_date < $curDate )
		{
			if ( is_resource($this->_handle) )
			{
				fclose($this->_handle);
			}
			$this->_date	=	$curDate;
			if ( !is_dir(ROOT_PATH . 'logs/' . $this->_date) )
			{
				umask(0000);
				mkdir(ROOT_PATH . 'logs/' . $this->_date, 0777);
			}
		}
		if ( !is_resource($this->_handle) )
		{
			$this->_handle	=	fopen(ROOT_PATH . 'logs/' . $this->_date . '/' .$this->_options['fileName'], 'a');
			stream_set_write_buffer($this->_handle, 0);
		}
		
		fseek($this->_handle, 0, SEEK_END);
		if ( ftell($this->_handle) > $this->_options['maxFileSize'] )
		{
			fclose($this->_handle);
			$fileName	=	ROOT_PATH . 'logs/' . $this->_date . '/' . $this->_options['fileName'];
			for ( $i = $this->_options['maxArchives'] - 1; $i > 0; --$i )
			{
				if ( is_file($fileName . '.' . $i) )
				{
					rename($fileName . '.' . $i, $fileName . '.' . ($i + 1));
				}
			}
			if ( is_file($fileName) )
			{
				rename($fileName, $fileName . '.1');
			}
			$this->_handle	=	fopen($fileName, 'a');
		}
		
		$logs	=	implode("\n", $this->_msgQueue);
		$this->_msgQueue	=	array();
		fwrite($this->_handle, $logs . "\n");
	}
	
	protected static function _makeKey($params)
	{
		return md5(serialize($params));
	}
	
	/**
	 * desctruct
	 *
	 */
	public function __destruct()
	{
		if ( count($this->_msgQueue) > 0 )
		{
			$this->flush();
		}
		if ( is_resource($this->_handle) )
		{
			fclose($this->_handle);
		}
	}
}

//end of script
