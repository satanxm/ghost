<?php
/**
 * Interface.php		
 *
 * @package		
 * @Copyright	(c) 1998-2007 Tencent Inc. All Rights Reserved
 * @Author		benxi <benxi@tencent.com>
 * @Version		$Id$
 */

interface Logger_Appender_Interface
{
	public function doAppend($token);
	public function getInstance($params);
}

//end of script
