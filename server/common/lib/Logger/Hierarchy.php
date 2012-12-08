<?php
/**
 * Factory.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

require_once COMM_PATH . 'lib/Logger/Core.php';

/**
 * logger hierarchy
 *
 */
class Logger_Hierarchy
{
	protected $_configure	=	array();
	protected $_root		=	null;
	protected $_ht			=	array();
	
	public function __construct(array $configure)
	{
		$this->_configure	=	$configure;
		$this->_root		=	$this->factory('root');
	}

	/**
	 * get a logger
	 *
	 * @param string $name
	 * 
	 * @return Logger_Core
	 */
	public function getLogger($name)
	{		
		if ( empty($this->_ht[$name]) )
		{
			if ( isset($this->_configure['loggers'][$name]) )
			{
				$logger	=	$this->factory($name);
			}
			else
			{
				$logger	=	clone $this->_root;
				$logger->setName($name);
				foreach ( $this->_configure['loggers']['root']['appenders'] as $appenderName )
				{
					if ( isset($this->_configure['appenders'][$appenderName]) )
					{
						$type	=	$this->_configure['appenders'][$appenderName]['type'];
						$params	=	$this->_configure['appenders'][$appenderName]['options'];
						$params['logName']	=	$name;
						
						require_once COMM_PATH . 'lib/Logger/Appender/' . $type . '.php';
						$appender	=	call_user_func(array('Logger_Appender_' . $type, 'getInstance'), $params);
						$logger->addAppender($appenderName, $appender);
					}
				}
			}
			$this->_ht[$name]	=	$logger;
		}
		
		return $this->_ht[$name];
	}
	
	/**
	 * set configure
	 *
	 * @param array $configure
	 */
	public function setConfigure(array $configure)
	{
		$this->_configure	=	array_merge($this->_configure, $configure);
	}
	
	/**
	 * 
	 *
	 * @param string $name
	 * 
	 * @return Logger_Core
	 */
	public function factory($name)
	{
		$logger	=	new Logger_Core($name);
		
		if ( isset($this->_configure['loggers'][$name]['appenders']) )
		{
			foreach ( $this->_configure['loggers'][$name]['appenders'] as $appenderName )
			{
				if ( isset($this->_configure['appenders'][$appenderName]) )
				{
					//add appender
					$type	=	$this->_configure['appenders'][$appenderName]['type'];
					$params	=	$this->_configure['appenders'][$appenderName]['options'];
					$params['logName']	=	$name;
					
					require_once COMM_PATH . 'lib/Logger/Appender/' . $type . '.php';
					$appender	=	call_user_func(array('Logger_Appender_' . $type, 'getInstance'), $params);
					$logger->addAppender($appenderName, $appender);
				}
			}
		}
		
		$logger->setLevel($this->_configure['loggers'][$name]['level']);
		
		return $logger;
	}
}


//end of script
