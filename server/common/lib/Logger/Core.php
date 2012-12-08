<?php
/**
 * Core.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

/**
 * logger levle
 *
 */
interface LogLevel {
	const	DEBUG	=	1;
	const	INFO	=	2;
	const	NOTICE	=	4;
	const	WARN	=	8;
	const	ERR		=	16;
	const	FATAL	=	32;
	const 	SERVER	=	64;
	
	const	ALL		=	0;
	const 	NONE	=	0xFFFF;
}

/**
 * logger core
 *
 */
class Logger_Core {
    private $_traceFrame=   1;
	private $_level		=	0;
	private	$_appenders	=	array();
	private $_name		=	'';
	
	public function __construct($name) {
		$this->_name	=	$name;
	}
	
	public function setTraceFrame($frame) {
	    $this->_traceFrame    = $frame;
	}
	
	/**
	 * send token to appenders
	 *
	 * @param mixed $msg
	 * @param int $level
	 */
	protected function _write($msg, $level) {
		if ( is_array($msg) ) {
			if ( isset($msg['code']) ) {
				$code	=	intval($msg['code']);
			} else {
				throw new Exception('log code must be set!');
			}
			
			if ( isset($msg['msg']) ) {
				$msg	=	$msg['msg'];
			} else {
				$msg	=	'';
			}
		} else {
			if ( is_string($msg) ) {
				$code	=	0;
				$msg	=	$msg;
			} else if ( is_numeric($msg) ) {
				$code	=	intval($msg);
				$msg	=	'';
			}
		}
		$levelMask	=	constant('LogLevel::' . $level);
		if ( $levelMask >= $this->_level ) {
			$trace	=	debug_backtrace();
			// 获取调用时候的文件行
			$last_index=$this->_traceFrame;
			$token	=	array(
				'time'	=>	date('Y-m-d H:i:s'),
				'level'	=>	$level,
				'file'	=>	$trace[$last_index]['file'],
				'line'	=>	$trace[$last_index]['line'],
				'code'	=>	$code,
				'msg'	=>	$msg
			);
			foreach ( $this->_appenders as $appender ) {
				//call appender
				$appender->doAppend($token);
			}
		}
	}
	
	public function debug($msg) {
		$this->_write($msg, 'DEBUG');
	}
	
	public function info($msg) {
		$this->_write($msg, 'INFO');
	}
	
	public function notice($msg) {
		$this->_write($msg, 'NOTICE');
	}
	
	public function warn($msg) {
		$this->_write($msg, 'WARN');
	}
	
	public function err($msg) {
		$this->_write($msg, 'ERR');
	}
	
	public function fatal($msg) {
		$this->_write($msg, 'FATAL');
	}
	
	public function server($msg) {
		$this->_write($msg, 'SERVER');
	}
	
	public function __call($method, $msg) {
		$level	=	strtoupper($method);
		if ( defined('LogLevel::' . $level) ) {
			$this->_write($msg, $level);
		} else {
			//throw new Exception('Log level is not existed, level:' . $level);
			trigger_error('Log level is not existed, level:' . $level);
		}
	}
	
	public function __clone() {
		//clear appdenders
		$this->_appenders	=	array();
	}
	
	public function setLevel($level) {
		$this->_level	=	$level;
	}
	
	public function getLevel() {
		return $this->_level;
	}
	
	public function setName($name) {
		$this->_name	=	$name;
	}
	
	/**
	 * get logger name
	 *
	 * @return string
	 */
	public function getName() {
		return $this->_name;
	}
	
	/**
	 * add appender
	 *
	 * @param string $name
	 * @param Object $appender
	 */
	public function addAppender($name, $appender) {
		$this->_appenders[$name]		=	$appender;
		//$appender->setLogger($this->_name);
	}
}

//end of script
