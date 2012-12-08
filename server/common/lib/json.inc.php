<?php
/**
 * JSON函数库
 *
 * @author    Nick Yan <nickyan@tencent.com>
 *            Spencer Liang <spencerliang@tencent.com>
 * @copyright 2010 Tencent Inc. All Rights Reserved.
 */

// JSON输出控制参数的参数名字
define('JSON_NAME_CALLBACK',	'callback');
define('JSON_NAME_SCRIPT',		'script');
define('JSON_NAME_DOMAIN',		'domain');
define('JSON_NAME_UNICODE',		'unicode');

/**
 * 输出（HTML特殊字符经过转义的）JSON
 * 所有的 <, >, ', ", & 会被替换为&lt;, &gt;, &#039;, &quot;, &amp;
 *
 * 根据URL参数指定的方式输出JSON（参数名的定义见文件开头的JSON_NAME_XXX的常量定义）
 * $_GET[JSON_NAME_CALLBACK]	回调函数名，指定该参数但取值为空时，使用默认值JsonCallback
 * $_GET[JSON_NAME_DOMAIN]		指定脚本运行的域名，添加document.domain = value，限白名单内的域名，如没有指定该参数或参数值为空，使用默认值
 *                      		只有$_GET[JSON_NAME_CALLBACK]参数有效时，本参数才有意义
 * $_GET[JSON_NAME_SCRIPT]		是否添加<script>标签
 *                              只有$_GET[JSON_NAME_CALLBACK]参数有效时，本参数才有意义
 *
 * @param mixed $obj 需要转换成JSON的数据，可为任意类型
 * @param bool $return 当为true时返回不输出，false时输出不返回
 * @return null|string
 */
function print_json($obj, $return = false) {
	$str = _json_output($obj, true);
	if ($return) {
		return $str;
	} else {
		if (isset($_GET[JSON_NAME_SCRIPT])) {
			@header('Content-Type: text/html; charset=gb2312');
		} elseif (!isset($_GET[JSON_NAME_SCRIPT]) && isset($_GET[JSON_NAME_CALLBACK])) {
			@header('Content-Type: text/javascript; charset=gb2312');
		}
		echo $str;
	}
}

/**
 * 输出（没有转义HTML特殊字符的）JSON
 *
 * 接受跟print_json()一样的URL参数控制
 *
 * @param mixed $obj 需要转换成JSON的数据，可为任意类型
 * @param bool $return 当为true时返回不输出，false时输出不返回
 * @return null|string
 */
function print_raw_json($obj, $return = false) {
	$str = _json_output($obj, false);
	if ($return) {
		return $str;
	} else {
		if (isset($_GET[JSON_NAME_SCRIPT])) {
			@header('Content-Type: text/html; charset=gb2312');
		} elseif (!isset($_GET[JSON_NAME_SCRIPT]) && isset($_GET[JSON_NAME_CALLBACK])) {
			@header('Content-Type: text/javascript; charset=gb2312');
		}
		echo $str;
	}
}

/**
 * 把当前的错误信息打印出来
 *
 * @param int $code 错误代码
 * @param string $msg 错误信息
 * @param string $type 错误类型
 * @param array $data 额外的数据
 * @param string $url 跳转用的URL
 * @param bool $return 当为true时返回不输出，false时输出不返回
 * @return null|string
 */
function print_err_json($code, $msg = '', $type = '', $data = array(), $url = '', $return = false) {
	$obj = array('ret' => $code);
	if ($type) {
		$obj['type'] = $type;
	}
	if ($msg) {
		$obj['msg'] = $msg;
	}
	if ($data) {
		$obj['data'] = $data;
	}
	if ($url) {
		$obj['url'] = $url;
	}
	return print_json($obj, $return);
}

/**
 * JSON编码
 * 跟PHP本身的json_encode()不一样的是，不会把非ASCII的字符串转换成\uABCD的形式
 *
 * @param mixed $a
 * @return string
 */
function json_encodem($a = false) {
	if (is_null($a)) {
		return 'null';
	}
	if ($a === false) {
		return 'false';
	}
	if ($a === true) {
		return 'true';
	}
	if (is_scalar($a)) {
		if (is_float($a)) {
			// Always use "." for floats.
			return floatval(str_replace(',', '.', strval($a)));
		}
		if (is_string($a)) {
			static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
			return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
		} else {
			return $a;
		}
	}
	$isList = true;
	for ($i = 0, reset($a); $i < count($a); $i++, next($a)) {
		if (key($a) !== $i) {
			$isList = false;
			break;
		}
	}
	$result = array();
	if ($isList) {
		foreach ($a as $v) {
			$result[] = json_encodem($v);
		}
		return '[' . join(',', $result) . ']';
	} else {
		foreach ($a as $k => $v) {
			$key = is_string($k) ? json_encodem($k) : "\"{$k}\"";
			$result[] = $key . ':' . json_encodem($v);
		}
		return '{' . join(',', $result) . '}';
	}
}

/**
 * 把非标准的JSON编码转换成PHP的数组
 * 这里的非标准JSON编码指JSON里面含有GBK字符，例如通过json_encodem()进行编码过的数据
 *
 * @param string $json
 * @return mixed
 */
function json_decodem($json = '') {
	require_once COMM_PATH . 'lib/charset.inc.php';
	if (!is_gbkascii($json)) {
		return json_decode($json, true);
	} else {
		// 把GBK转换成UTF8
		$json = iconv('GBK', 'UTF-8', $json);
		$obj = json_decode($json, true);
		if (is_array($obj) && !empty($obj)) {
			$out = array();
			foreach ($obj as $key => $val) {
				if (is_string($val)) {
					$out[$key] = _utf82gbk($val);
				} elseif (is_array($val)) {
					$out[$key] = _utf82gbk_r($val);
				} else {
					$out[$key] = $val;
				}
			}
			return $out;
		} else {
			return $obj;
		}
	}
}

function _utf82gbk($str) {
	return iconv('UTF-8', 'GBK', $str);
}

function _utf82gbk_r($a) {
	if (is_array($a)) {
		$o = array();
		foreach ($a as $k => $v) {
			$o[$k] = _utf82gbk_r($v);
		}
		return $o;
	} elseif (is_string($a)) {
		return _utf82gbk($a);
	} else {
		return $a;
	}
}

/**
 * JSON编码
 *
 * @access private 私有函数，只允许在本文件内调用
 *
 * @param mixed $a 需要转换成JSON的变量，可为任意类型
 * @param bool $h 是否转义HTML特殊字符，包括（<, >, ', ", &）
 * @param bool $u 是否使用UNICODE，即转换成\uABCD的形式，原生的JSON
 * @return string
 */
function _json_encode($a = false, $h = false, $u = false) {
	if (is_null($a)) {
		return 'null';
	}
	if ($a === false) {
		return 'false';
	}
	if ($a === true) {
		return 'true';
	}
	if (is_scalar($a)) {
		if (is_float($a)) {
			// Always use "." for floats.
			return floatval(str_replace(',', '.', strval($a)));
		}
		if (is_string($a)) {
			if ($h) {
				static $hr = array(array('&', '<', '>', '"', "'"), array('&amp;', '&lt;', '&gt;', '&quot;', '&#039;'));
				$a = str_replace($hr[0], $hr[1], $a);
			}
			if ($u) {
				$a = iconv('GBK', 'UTF-8', $a);
				$s = json_encode($a);
			} else {
				static $jr = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
				$s = '"' . str_replace($jr[0], $jr[1], $a) . '"';
			}
			return $s;
		} else {
			return $a;
		}
	}
	$isList = true;
	for ($i = 0, reset($a); $i < count($a); $i++, next($a)) {
		if (key($a) !== $i) {
			$isList = false;
			break;
		}
	}
	$result = array();
	if ($isList) {
		foreach ($a as $v) {
			$result[] = _json_encode($v, $h, $u);
		}
		return '[' . join(',', $result) . ']';
	} else {
		foreach ($a as $k => $v) {
			$key = is_string($k) ? _json_encode($k, $h, $u) : "\"{$k}\"";
			$result[] = $key . ':' . _json_encode($v, $h, $u);
		}
		return '{' . join(',', $result) . '}';
	}
}

/**
 * 根据不同参数输出JSON的一些附加数据
 * 如callback，domain，script，html等
 *
 * @access private 私有函数，只允许在本文件内调用
 *
 * @param mixed $obj 需要转换成JSON的变量，可为任意类型
 * @param bool $htmlencode 是否转义HTML特殊字符，包括（<, >, ', ", &）
 * @return string
 */
function _json_output($obj, $htmlencode = true) {
	if (isset($_GET[JSON_NAME_UNICODE])) {
		// UNICODE，所有非ASCII字符都用\uxxxx表示，原生的JSON
		$str = _json_encode($obj, $htmlencode, true);
	} else {
		// UTF-8，所有非ASCII的字符保留原来的编码
		$str = _json_encode($obj, $htmlencode, false);
	}

	// 加上回调函数
	if (isset($_GET[JSON_NAME_CALLBACK])) {
		// 校验回调格式
		$callback = 'JsonCallback';
		if (preg_match('/^([a-z_]\w*\.)?[a-z_]\w*$/i', $_GET[JSON_NAME_CALLBACK])) {
			$callback = $_GET[JSON_NAME_CALLBACK];
		}
		$str = "{$callback}({$str});";

		// 加上域名限制，阻止JSON Hijacking
		global $_trust_domain; // 域名白名单，在 /common/etc/const.inc.php 中设置
		if (!empty($_trust_domain)) {
			$domain_array = $_trust_domain;
		} else {
			$domain_array = array(DEFAULT_DOMAIN);
		}
		if (!empty($_GET[JSON_NAME_DOMAIN]) && in_array($_GET[JSON_NAME_DOMAIN], $domain_array)) {
			// 在白名单内的域名允许通过参数指定
			$domain = $_GET[JSON_NAME_DOMAIN];
		} else {
			// 如果当前访问的域名在白名单内，优先使用该域名
			$http_host = strtolower(trim($_SERVER['HTTP_HOST']));
			if (!empty($http_host)) {
				foreach ($domain_array as $val) {
					if ($http_host === $val || ((strlen($http_host) > strlen($val)) && substr($http_host, -1 - strlen($val)) === '.' . $val)) {
						$domain = $val;
						break;
					}
				}
			}
			if (empty($domain)) {
				// 取白名单中的第一个域名
				$domain = reset($domain_array);
			}
		}
		$str = "document.domain='{$domain}';{$str}";

		// 增加标签
		if (isset($_GET[JSON_NAME_SCRIPT])) {
			$str = '<html><head><meta http-equiv="Content-Type" content="text/html" /></head><body>'
			     . "<script type=\"text/javascript\">{$str}</script>"
				 . '</body></html>';
		}
	}
	return $str;
}
//end of script

