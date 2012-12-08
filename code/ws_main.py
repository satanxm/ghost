#!/usr/bin/env python
# -*- coding: utf8 -*-

import sys
reload( sys )
sys.setdefaultencoding('utf-8')

from twisted.internet import reactor
import ws_model


taskPeriod=5			#常规任务周期
taskCleanPeriod=30		#整理性任务周期


def taskScan():
	ws_model.taskSacn()
	reactor.callLater(taskPeriod, taskScan)

def taskCleanScan():
	ws_model.taskCleanScan()
	reactor.callLater(taskCleanPeriod, taskCleanScan)


#main开始
reactor.callLater(taskPeriod, taskScan)	#常规任务扫描
reactor.callLater(taskCleanPeriod, taskCleanScan)	#整理性任务扫描
ws_model.configInit()	#读取配置文件
ws_model.wsServerInit()	#ws服务器初始化
reactor.run()	
ws_model.configSave()	#保存配置文件
