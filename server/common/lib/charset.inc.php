<?php
/**
 * 字符编码相关的函数库
 *
 * @author    Spencer Liang <spencerliang@tencent.com>
 * @copyright 2009 Tencent Inc. All Rights Reserved.
 */

/**
 * 判断一个字符串是否全由ASCII组成，不包括控制字符
 *
 * @param string $string
 * @return bool
 */
function is_ascii($string) {
	if (strlen($string) == 0) {
		return false;
	}
	return preg_match('/^(
	  [\x09\x0A\x0D\x20-\x7E]            # ASCII
	)+$/x', $string);
}

/**
 * 判断一个字符串是否全为UTF-8编码
 *
 * @param string $string
 * @return bool
 */
function is_utf8($string) {
	if (strlen($string) == 0) {
		return false;
	}
	return preg_match('/^(
	  [\x09\x0A\x0D\x20-\x7E]            # ASCII
	| [\xC2-\xDF][\x80-\xBF]             # non-overlong 2-byte
	| \xE0[\xA0-\xBF][\x80-\xBF]         # excluding overlongs
	| [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}  # straight 3-byte
	| \xED[\x80-\x9F][\x80-\xBF]         # excluding surrogates
	| \xF0[\x90-\xBF][\x80-\xBF]{2}      # planes 1-3
	| [\xF1-\xF3][\x80-\xBF]{3}          # planes 4-15
	| \xF4[\x80-\x8F][\x80-\xBF]{2}      # plane 16
	)+$/x', $string);
}

/**
 * 判断一个字符串是否全为GBK编码
 *
 * @param string $string
 * @return bool
 */
function is_gbk($string) {
	if (strlen($string) == 0) {
		return false;
	}
	return preg_match('/^(
	  [\xA1-\xA9][\xA1-\xFE]             # GBK1
	| [\xB0-\xF7][\xA1-\xFE]             # GBK2
	| [\x81-\xA0][\x40-\x7E\x80-\xFE]    # GBK3
	| [\xAA-\xFE][\x40-\x7E\x80-\xA0]    # GBK4
	| [\xA8-\xA9][\x40-\x7E\x80-\xA0]    # GBK5
	)+$/x', $string);
}

/**
 * 判断一个字符串是否全为GBK编码或ASCII编码，即GBK+所有可打印的半角字符
 *
 * @param string $string
 * @return bool
 */
function is_gbkascii($string) {
	if (strlen($string) == 0) {
		return false;
	}
	return preg_match('/^(
	  [\x09\x0A\x0D\x20-\x7E]            # ASCII
	| [\xA1-\xA9][\xA1-\xFE]             # GBK1
	| [\xB0-\xF7][\xA1-\xFE]             # GBK2
	| [\x81-\xA0][\x40-\x7E\x80-\xFE]    # GBK3
	| [\xAA-\xFE][\x40-\x7E\x80-\xA0]    # GBK4
	| [\xA8-\xA9][\x40-\x7E\x80-\xA0]    # GBK5
	)+$/x', $string);
}


/**
 * 把字符按全角截短
 * 
 *
 * 不过滤html特殊符号,"\r"将被丢弃
 *
 * @param str $src
 * @param int $len 全角字符数量,英文数字算半个
 * @return str
 */
function gb_truncate($src, $len) {
	$src = strval($src);
	$dest = '';
	$dest_len = 0;
	$src_len = strlen($src);
	for ($i=0;$i<$src_len && $dest_len < $len ; $i++) {
		$ascii = ord($src[$i]);

		//单字节部分
		if($ascii < 0x7F)		{
			//控制字符特殊处理
			if(ctype_cntrl($src[$i]) )	{
				//保留制表符跟回车符
				if($ascii==0x09 || $ascii==0x0A) {
					$dest .= $src[$i];
					$dest_len += 0.5;
				}
				//丢掉其它控制字符
			}
			//其它的补充上
			else			{
				$dest .= $src[$i];
				$dest_len += 0.5;
			}
		}
		//多字节部分,合法的第一个
		elseif ($ascii >= 0x81 && $ascii<=0xFE)		{
			//丢掉最后半个汉字
			if (1 == ($src_len-$i))			{
				break;
			}
			//检查第二个字节
			//0x40 - 0xFE
			$b2 = ord($src[++$i]);
			if($b2 >= 0x40 && $b2 <= 0xFE)			{
				//最后半个
				if ($dest_len+.5==$len) {
					break;
				}
				$dest .= $src[$i-1] . $src[$i];
				$dest_len += 1 ;
			}
			//不是gbk范围去掉
		}
		//不是gbk范围去掉
	}
	return $dest;
}


//end of script

