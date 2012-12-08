<?php
/**
 * Abstract.php		
 *
 * @package		
 * @Copyright	(c) All rights reserved
 * @Author		skyCrack <skyCrack@126.com>
 * @Version		$Id$
 */

abstract class Logger_Appender_Abstract
{
	/**
	 * must override
	 *
	 */
	public function doAppend($token)
	{
	}
}

//end of script
