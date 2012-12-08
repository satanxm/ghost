<?php
/**
 * 资源管理器
 *
 * @author    Nick Yan <nickyan@tencent.com>
 * @copyright 2009 Tencent Inc. All Rights Reserved.
 */

require_once COMM_PATH . 'etc/conf.inc.php';

final class resource {
	private static $dirty = null;
	private static $ttc_server = array();
	private static $db = array();
	private static $memcache = array();

	private function __construct() {}

	/**
	 * 产生一个脏话库
	 *
	 * @return object qp_dirty
	 */
	static function get_dirty()	{
		if (is_null(self::$dirty)) {
			if (!class_exists('qp_dirty')) {
				require_once COMM_PATH . 'lib/qp_dirty.inc.php';
			}
			self::$dirty = new qp_dirty(COMM_PATH . DIRTY_FILE);
		}
		return self::$dirty;
	}

	/**
	 * 获取日志
	 *
	 * @param string $name
	 * @param array $configure
	 * @return object logger
	 */
	static function get_logger($name = '', $configure = array()) {
		if (!class_exists('Logger'))
		{
			require_once COMM_PATH . 'lib/Logger.php';
		}
		return Logger::getLogger($name, $configure);
	}

	/**
	 * 根据名字返回一个数据库查询
	 *
	 * @param string $name DB_XXX
	 * @param int $errcode
	 * @return object DataBase
	 */
	static function get_db($name, &$errcode) {
		$errcode = 0;
		if (empty(self::$db[$name])) {
			// 确认所有东西都配置好
			if (!defined("DB_{$name}")
				|| !defined("DB_NAME_{$name}")
				|| !defined("DB_USER_{$name}")
				|| !defined("DB_PASSWORD_{$name}")
				|| !defined("DB_HOST_{$name}")
				|| !defined("DB_PORT_{$name}")) {
				$errcode = CODE::DB_NO_CONFIG;
				return null;
			}

			if (!class_exists('Database')) {
				require_once COMM_PATH . 'lib/database.class.php';
			}

			self::$db[$name] = new Database(
				constant("DB_HOST_{$name}"),
				constant("DB_USER_{$name}"),
				constant("DB_PASSWORD_{$name}"),
				constant("DB_NAME_{$name}"),
				constant("DB_PORT_{$name}")
				);
		}
		return self::$db[$name];
	}

	/**
	 * 根据名字返回一个Memcache实例
	 *
	 * @param string $type MEM_TEMP（临时缓存）或 MEM_STAND（长久缓存）表示不同的Memcache缓存组
	 * @param int $errcode 错误代码
	 * @return object Memcache
	 */
	static function get_memcache($type, &$errcode) {
		$errcode=0;
		if(!empty(self::$memcache[$type])){
			return self::$memcache[$type];
		}
		global $memcache_servers,$memcache_stand_servers;
		$Memcache = new Memcache;
		if ($type==MEM_TEMP){
			$memcache=$memcache_servers;
		}else{
			$memcache=$memcache_stand_servers;
		}
		foreach ($memcache as $server){
			$ret=$Memcache->addServer($server['host'], $server['port'], $server['pconnect']);
			if(!$ret){
				$errcode = CODE::MEMCACHE_ERR ;
				return null;
			}
		}
		self::$memcache[$type]=$Memcache;
		return self::$memcache[$type];
	}
}
//end of script

