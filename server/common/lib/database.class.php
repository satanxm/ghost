<?php
/*
*------------------------------------------------------------
*   Qzone Portal Database Class
*   ========================================
*   Author  : Mango Guo <mangoguo@tencent.com>;jinglzheng@tencent.com
*   Web Site: http://qzone.qq.com
*   Copyright (c) 2004-2006 Tencent Inc. All Rights Reserved.
*------------------------------------------------------------
*/

ini_set('mysqli.reconnect', 'On');

class Database
{
	private $db_host;
	private $db_user;
	private $db_password;
	private $db_database;
	private $db_port;

	private $query_id = '';
	private $debug = 0;
	private $stmt = False;

	public $connection;
	public $queries = 0;
	public $debug_info = '';
	public $sql_time = 0;
	public $error_info = '';
	public $error_no = 0;

	/**
	 * 正常执行的最长时间,超过此时间则记录到错误日志中以便后续分析
	 *
	 * @var int
	 */
	public static $MAX_TIME=1;

	/**
	 * 操作符
	 *
	 * @var array
	 */
	private static $arr_operator = array(
											'+',
											'-',
											'*',
											'/',
											'%',
											);

	/**
	  * cunstructor: Connect to database
	  *
	  * @param string db_host
	  * @param string db_user
	  * @param string db_password
	  * @param string db_database
	  * @param string db_port
	  *
	  */
	public function __construct($db_host, $db_user, $db_password, $db_database, $db_port)
	{
		$this->init($db_host, $db_user, $db_password, $db_database, $db_port);
	}

	public function __destruct()
	{
		$this->close_database();
	}

	public function init($db_host, $db_user, $db_password, $db_database, $db_port)
	{
		$this->db_host     = $db_host;
		$this->db_user     = $db_user;
		$this->db_password = $db_password;
		$this->db_database = $db_database;
		$this->db_port     = $db_port;

		$this->connection = @mysqli_connect($this->db_host, $this->db_user, $this->db_password, $this->db_database, $this->db_port);

		if (!$this->connection)
		{
			$this->error('Cannot connect to mysql server: '.$this->db_user.'@'.$this->db_host.':'.$this->db_user);
		}

//		@mysqli_query($this->connection, "SET NAMES 'GB2312'");

		$this->debug = isset($_GET['sql_debug']) ? 1 : 0;
	}

	public function check_connection()
	{
		if (!@mysqli_ping($this->connection))
		{
			$this->error('Cannot reconnect to mysql server: '.$this->db_user.'@'.$this->db_host.':'.$this->db_user);
			$this->close_database();
			$this->init($this->db_host, $this->db_user, $this->db_password, $this->db_database, $this->db_port);
		}
	}

	public function kill($thread_id)
	{
		if (!$this->connection)
		{
			return false;
		}
		if (intval($thread_id) <= 0)
		{
			return false;
		}
		return @mysqli_kill($this->connection, $thread_id);
	}

	public function thread_id()
	{
		if (!$this->connection)
		{
			return false;
		}
		return @mysqli_thread_id($this->connection);
	}

	/*-------------------------------------------------------------------------*/
	// resource query(string sqlstr)
	// ------------------
	// Execute an SQL query.
	/*-------------------------------------------------------------------------*/
	public function query($sqlstr)
	{
		if ($this->debug)
		{
			list ($start_time, $decimal) = explode(' ', microtime());
			$start_time += $decimal;
		}

		$this->check_connection();

		$time = time();
		$this->query_id = @mysqli_query($this->connection, $sqlstr);
		$time = time()-$time;
		if ($time>self::$MAX_TIME) {
			$log_prefix = empty($_SERVER['HTTP_HOST']) ? 'local' : 'http';
			$log_file = ROOT_PATH.'log/mysql/'.$log_prefix.'_errorlog_' . date('Y-m-d') . '.log';
			$sqlstr = preg_replace('/\s+/',' ', $sqlstr);
			//如果字符串超长则截断
			if(strlen($sqlstr)>1000)$sqlstr=substr($sqlstr,0,500)."........".substr($sqlstr,-100);
			$sqlstr = rtrim($sqlstr, ';').';';
			$content = date('Y-m-d H:i:s')."\t{$time}\tuse ".$this->db_database.";\texplain\t{$sqlstr}\n";
			$ret = file_put_contents($log_file, $content, FILE_APPEND | LOCK_EX );
			if (!$ret)
			{
				umask(0);
				mkdir(dirname($log_file), 0777, true);
				file_put_contents($log_file, $content, FILE_APPEND | LOCK_EX );
			}
		}
		if ($this->debug)
		{
			list($end_time, $decimal) = explode(' ', microtime());
			$end_time += $decimal - $start_time;
		}

		if($this->query_id)
		{
			$this->queries++;

			if ($this->debug)
			{
			    if ( preg_match( "/^select/i", $sqlstr ) )
        		{
        			$eid = mysqli_query($this->connection, "EXPLAIN $sqlstr");

        			$this->debug_info .= <<<EOF
					<table width="95%" border="1" cellpadding="6" cellspacing="0" bgcolor="#FFE8F3" align="center">
						<tr>
							<td colspan="8" style="font-size:14px" bgcolor="#FFC5Cb"><b>Select Query</b></td>
						</tr>
						<tr>
							<td colspan="8" style="font-family:courier, monaco, arial;font-size:14px;color:black">{$sqlstr}</td>
						</tr>
						<tr bgcolor="#FFC5Cb">
							<td><b>table</b></td>
							<td><b>type</b></td>
							<td><b>possible_keys</b></td>
							<td><b>key</b></td>
							<td><b>key_len</b></td>
							<td><b>ref</b></td>
							<td><b>rows</b></td>
							<td><b>Extra</b></td>
						</tr>
EOF;
					while( $array = mysqli_fetch_array($eid) )
					{
						$type_col = '#FFFFFF';

						if ($array['type'] == 'ref' or $array['type'] == 'eq_ref' or $array['type'] == 'const')
						{
							$type_col = '#D8FFD4';
						}
						else if ($array['type'] == 'ALL')
						{
							$type_col = '#FFEEBA';
						}

						$this->debug_info .= <<<EOF
						<tr bgcolor="#FFFFFF">
							<td>{$array['table']}&nbsp;</td>
							<td bgcolor={$type_col}>{$array['type']}&nbsp;</td>
							<td>{$array['possible_keys']}&nbsp;</td>
							<td>{$array['key']}&nbsp;</td>
							<td>{$array['key_len']}&nbsp;</td>
							<td>{$array['ref']}&nbsp;</td>
							<td>{$array['rows']}&nbsp;</td>
							<td>{$array['Extra']}&nbsp;</td>
						</tr>
EOF;
					}

					$this->sql_time += $end_time;

					if ($end_time > 0.1)
					{
						$end_time = '<span style="color:red"><b>'.$end_time.'</b></span>';
					}

					$this->debug_info .= <<<EOF
						<tr>
							<td colspan="8" bgcolor="#FFD6DC" style="font-size:14px"><b>MySQL time</b>: {$end_time}</b></td>
						</tr>
					</table>
					<br />
EOF;
				}
				else
				{
					$this->debug_info .= <<<EOF
					<table width="95%" border="1" cellpadding="6" cellspacing="0" bgcolor="#FEFEFE"  align="center">
						<tr>
							<td style="font-size:14px" bgcolor="#EFEFEF"><b>Non Select Query</b></td>
						</tr>
						<tr>
							<td style="font-family:courier, monaco, arial;font-size:14px">{$sqlstr}</td>
						</tr>
						<tr>
							<td style="font-size:14px" bgcolor="#EFEFEF"><b>MySQL time</b>: {$end_time}</span></td>
						</tr>
					</table>
					<br />
EOF;
					$this->sql_time += $end_time;
				}
			}

			return $this->query_id;
		}
		else
		{
			$this->error("Invalid SQL:\n  " . $sqlstr);
		}
		return false;
	}

	/*-------------------------------------------------------------------------*/
	// int get_insert_id(void)
	// ------------------
	// Returns the newly inserted auto_increment id.
	/*-------------------------------------------------------------------------*/
	public function get_insert_id()
	{
		$this->check_connection();
		return mysqli_insert_id($this->connection);
	}

	/*-------------------------------------------------------------------------*/
	// mixed result(string sqlstr)
	// ------------------
	// Select a single line or a single cell.
	// eg: $SDB->result("SELECT name FROM user WHERE uid=5")
	//       (returns a string)
	//     $SDB->result("SELECT name,email FROM user WHERE login_hash='$hash'")
	//       (returns an object)
	// Returns NULL if no such entry could be found.
	/*-------------------------------------------------------------------------*/
	public function result($sqlstr)
	{
		$result = $this->query($sqlstr . " LIMIT 1");
		if($result===FALSE)return NULL;
		
		if (mysqli_num_rows($result) == 0)
		{
			return NULL;
		}

		if (mysqli_num_fields($result) <= 1)
		{
			$array = mysqli_fetch_row($result);
			$this->free_result($result);
			return $array[0];
		}
		else
		{
			$array = mysqli_fetch_array($result);
			$this->free_result($result);
			return $array;
		}
	}

	/*-------------------------------------------------------------------------*/
	// array fetch_array(resource id)
	// ------------------
	// Fetch a row as an array from result by both assoc and num.
	/*-------------------------------------------------------------------------*/
	public function fetch_array($id = NULL)
	{
		return $id ? mysqli_fetch_array($id) : mysqli_fetch_array($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// array fetch_assoc(resource id)
	// ------------------
	// Fetch a row as an array from result by assoc.
	/*-------------------------------------------------------------------------*/
	public function fetch_assoc($id = NULL)
	{
		return $id ? mysqli_fetch_assoc($id) : mysqli_fetch_assoc($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// array fetch_row(resource id)
	// ------------------
	// Fetch a row as an array from result.
	/*-------------------------------------------------------------------------*/
	public function fetch_row($id = NULL)
	{
		return $id ? mysqli_fetch_row($id) : mysqli_fetch_row($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// object fetch_object(resource id)
	// ------------------
	// Fetch a row as an object from result.
	/*-------------------------------------------------------------------------*/
	public function fetch_object($id = NULL)
	{
		return $id ? mysqli_fetch_object($id) : mysqli_fetch_object($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// object fetch_fields(resource id)
	// ------------------
	// Fetch a row as an object from fields.
	/*-------------------------------------------------------------------------*/
	public function fetch_fields($id = NULL)
	{
		return $id ? mysqli_fetch_fields($id) : mysqli_fetch_fields($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// int num_fields(resource id)
	// ------------------
	// Returns number of collected fields.
	/*-------------------------------------------------------------------------*/
	public function num_fields($id = NULL)
	{
		return $id ? mysqli_num_fields($id) : mysqli_num_fields($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// int num_rows(resource id)
	// ------------------
	// Returns number of collected rows.
	/*-------------------------------------------------------------------------*/
	public function num_rows($id = NULL)
	{
		return $id ? mysqli_num_rows($id) : mysqli_num_rows($this->query_id);
	}

	/*-------------------------------------------------------------------------*/
	// int affected_rows(resource id)
	// ------------------
	// Returns number of affected rows.
	/*-------------------------------------------------------------------------*/
	public function affected_rows()
	{
		return mysqli_affected_rows($this->connection);
	}

	/*-------------------------------------------------------------------------*/
	// array free_result(resource id)
	// ------------------
	// Free the result set from mySQLs memory.
	/*-------------------------------------------------------------------------*/
	public function free_result($id = NULL)
	{
		if($id)
		{
			@mysqli_free_result($id);
		}
		else
		{
			@mysqli_free_result($this->query_id);
		}
	}

	public function stmt_prepare($query_string)
	{
		$this->stmt = mysqli_prepare($this->connection, $query_string);
		return $this->stmt;
	}

	public function stmt_bind_param()
	{
		$sys_arguments = array($this->stmt);
		$user_arguments = func_get_args();
		$arguments = array_merge($sys_arguments, $user_arguments);

		return call_user_func_array('mysqli_stmt_bind_param', $arguments);
	}

	public function stmt_execute()
	{
		return mysqli_stmt_execute($this->stmt);
	}

	public function stmt_bind_result()
	{
		$sys_variables = array($this->stmt);
		$user_variables = func_get_args();
		$variables = array_merge($sys_variables, $user_variables);

		return call_user_func_array('mysqli_stmt_bind_result', $variables);
	}

	public function stmt_fetch()
	{
		return mysqli_stmt_fetch($this->stmt);
	}

	public function stmt_close()
	{
		return mysqli_stmt_close($this->stmt);
	}

	public function autocommit($stat)
	{
		return mysqli_autocommit($this->connection, $stat);
	}

	public function commit()
	{
		return mysqli_commit($this->connection);
	}

	public function rollback()
	{
		return mysqli_rollback($this->connection);
	}

	public function ping()
	{
		return mysqli_ping($this->connection);
	}

	/*-------------------------------------------------------------------------*/
	// close_database()
	// ------------------
	// Close Database.
	/*-------------------------------------------------------------------------*/
    public function close_database()
	{
		if($this->connection)
		{
			if($this->query_id)
			{
				$this->free_result($this->query_id);
			}

			return @mysqli_close($this->connection);
		}
		else
		{
            $this->error("Cannot close mysql server");
		}
		return false;
    }

	public function compile_update_string($data)
	{
		$return = '';
		foreach ($data as $k => $v)
		{
			if ( is_numeric( $v ) and intval($v) == $v )
			{
				$return .= $k . "=".intval($v).",";
			}
			else
			{
				$return .= $k . "='".$this->format_string($v)."',";
			}
		}
		$return = preg_replace( "/,$/" , "" , $return );

		return $return;
	}

	public function compile_insert_string($data)
	{
    	$field_names  = '';
		$field_values = '';

		foreach ($data as $k => $v)
		{
			$field_names  .= "$k,";

			if ( is_numeric( $v ) and intval($v) == $v )
			{
				$field_values .= intval($v).",";
			}
			else
			{
				$field_values .= "'".$this->format_string($v)."',";
			}
		}
		$field_names  = preg_replace( "/,$/" , "" , $field_names  );
		$field_values = preg_replace( "/,$/" , "" , $field_values );

		return array( 'FIELD_NAMES'  => $field_names,
					  'FIELD_VALUES' => $field_values,
					);
	}

    public function do_update( $table, $array, $where='' )
    {
    	$string = $this->compile_update_string( $array );

    	$sql = 'UPDATE '.$table.' SET '.$string;

    	if ( $where )
    	{
    		$sql .= ' WHERE '.$where;
    	}

    	$query = $this->query( $sql );

    	return $query;
    }

    public function do_insert( $table, $array )
    {
    	$formated_array = $this->compile_insert_string( $array );

    	$query = $this->query('INSERT INTO '.$table.' ('.$formated_array['FIELD_NAMES'].') VALUES('.$formated_array['FIELD_VALUES'].')');

    	return $query;
    }

	// This will delete data at first, then insert data

	public function do_replace( $table, $array )
    {
    	$formated_array = $this->compile_insert_string( $array );

    	$query = $this->query('REPLACE INTO '.$table.' ('.$formated_array['FIELD_NAMES'].') VALUES('.$formated_array['FIELD_VALUES'].')');

    	return $query;
    }

	// Can only be used on MySQL 4.1 +
	// Please comfirm the table has the only one UNIQUE index or PRIMARY KEY
	// You should try to avoid using an ON DUPLICATE KEY clause on tables with multiple unique indexes.

	public function do_insert_or_update($table, $insert_array, $update_array, $where='')
	{
    	$insert = $this->compile_insert_string( $insert_array );
    	$update = '';
		foreach ($update_array as $field => $value) {
			if (preg_match('/^\w*'.$field.'\w*(\+)|(-)|(\*)|(\/)|(%)\w*-?(\d*\.)?\d+\s*$/', $value)) {
				$update .= "{$field}={$value},";
				unset($field);
			}
		}

    	$update .= $this->compile_update_string( $update_array );

    	$sql = 'INSERT INTO '.$table.' ('.$insert['FIELD_NAMES'].') VALUES('.$insert['FIELD_VALUES'].') ON DUPLICATE KEY UPDATE '.$update;

    	if ( $where )
    	{
    		$sql .= ' WHERE '.$where;
    	}
    	$query = $this->query( $sql );

    	return $query;
	}

    /**
     * 增加表的列自身组合运算
     *
     *
     * 相当于PHP的, "+=", "-="......
     * 数据库中的: column1=column1+23,
     * 第二个参数$arr_col_op,key为column1, value 为 +23 (运算符和操作数)
     *
     * @param string $table 要操作的表名
     * @param array $arr_col_op 自身组合运算的列, key为列,value为操作符和数值
     * @param string $where
     * @param array $arr_col_set 赋值运算的列
     * @return false fail, else statement
     *
     * @author nickyan
     */
    function operate($table,$arr_col_op,$where=null,$arr_col_set=null)
    {
		//组合操作的
		if (!is_array($arr_col_op) || empty($arr_col_op))
		{
			$this->error('operation param must be not empty array');
			return false;
		}
		//组合操作字符串暂存
		$arr_str_op = array();
		foreach ($arr_col_op as $col => $str)
		{
			//干掉空格
			$str = preg_replace('/\s+/','',$str);
			//抽出操作符
			$operator = $str[0];
			if (!in_array($operator,self::$arr_operator))
			{
				$this->error($operator.' operator for '.$col.' error');
				return false;
			}
			//抽出操作数
			$value = substr($str,1);
			if (!is_numeric($value))
			{
				$this->error($value.' operation value for '.$col.' must be number');
				return false;
			}
			$arr_str_op[] = $col . '=' . $col . $operator . $value;
		}
		//字符串
		$list_str_op = join(',',$arr_str_op);

		//赋值操作的
		if (!empty($arr_col_set) && is_array($arr_col_set))
		{
			$str_col_set = $this->compile_update_string($arr_col_set);
			$list_str_op .= ',' . $str_col_set;
		}

		//拼成sql
		$sql = 'UPDATE ' . $table . ' SET ' . $list_str_op;
		if ($where)
		{
			$sql .= ' WHERE ' . $where;
		}

		//返回查询结果
		return $this->query($sql);
    }

	/*-------------------------------------------------------------------------*/
	// void error(string msg)
	// ------------------
	// Record an error message and crash.
	/*-------------------------------------------------------------------------*/
	public function error($msg)
	{
		//global $IP;

		if($this->connection)
		{
    		$this->error_info    = mysqli_error($this->connection);
    		$this->error_no = mysqli_errno($this->connection);
		}
		else
		{
    		$this->error_info    = mysqli_connect_error();
    		$this->error_no = mysqli_connect_errno();
		}

		$content = 'Error: ' .date('Y-m-d H:i:s') . "\n";
		if (!empty($_SERVER['HTTP_HOST']))
		{
			//$content .= 'IP address: ' . $IP . "\n";
		}
		if (!empty($_SERVER['QUERY_STRING']))
		{
			$content .= 'Query string: ' . $_SERVER['QUERY_STRING'] . "\n";
		}
		$content .= 'System message: ' . $msg . "\n";
		$content .= 'MySQL error number: ' . $this->error_no . "\n";
		$content .= 'MySQL error message: ' . $this->error_info . "\n\n";

		$log_prefix = !empty($_SERVER['HTTP_HOST']) ? 'http' : 'local';

		$log_file = ROOT_PATH.'log/mysql/'.$log_prefix.'_errorlog_' . date('Y-m-d') . '.log';

		$ret = file_put_contents($log_file, $content, FILE_APPEND | LOCK_EX );
		if (!$ret)
		{
			umask(0);
			mkdir(dirname($log_file), 0777, true);
			$ret = file_put_contents($log_file, $content, FILE_APPEND | LOCK_EX );
		}

		if (!empty($_SERVER['HTTP_HOST']))
		{
			//readfile(ROOT_PATH . 'web/html/dbcrash.html');
			//exit();
		}
	}

	/*-------------------------------------------------------------------------*/
	// string format_string(string str)
	// ------------------
	// Adds slashes into a string for an SQL query.
	// Does nothing if magic_quotes_gpc is set on unless forced.
	/*-------------------------------------------------------------------------*/
	public function format_string($str)
	{
		if (get_magic_quotes_gpc())
		{
			$str = stripslashes($str);
		}
		if (!is_numeric($str))
		{
			$str = mysqli_real_escape_string($this->connection, $str);
		}
		return $str;
	}
}
//end of script
