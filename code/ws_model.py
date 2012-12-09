#!/usr/bin/env python
# -*- coding: utf8 -*-

from twisted.internet import reactor
from ws_server import BroadcastFactory
import cPickle
import json
import time
import random
import copy
import MySQLdb

#维护socket列表
#包含信息：socketid,uid,nick,avatarId,deskId,seatPos,identity
socketDict={}
userLimit=1


#转换接收到的数据，必须是json，否则忽略
def decodeData(self,data):
    #print data
    try:
        decodeData=json.loads(data)
    except:
        print 'receive error data:',data
        return
    #print '---decodeData',decodeData
    parseData(self,decodeData)


#原型
deskListDefault={'info':{},'extend':{},'stage':{'step':[],'type':-1}}

#userList[uid]['socketId']
#userList[uid]['info']
sendDataDefault={'callback':'','content':{'ret':-1,'data':''}}
userList={} #socketId deskId uid nick昵称 avatarId用户头像 seatPos座位 seatPos座位偏移 online 是否在线(0不在线 1在线) identity身份 (0普通用户 1人 2鬼 3痴 4旁观 11法官) alive(0死 1活) voteUid投票玩家  
deskList={} #deskId bindList屏蔽列表 createTime userLimit玩家上限 cleanFlag清理标记 status步骤(0未开始 1开始) wordHuman wordGuest ghostNum


#处理接收的数据
def parseData(self,decodeData):
    if decodeData['action'] == 'queryStatus':
        queryStatus(self,decodeData)
    elif decodeData['action'] == 'create':
        userInit(self,decodeData)
        exitGameSoft(self,decodeData)
        createGame(self,decodeData)
    elif decodeData['action'] == 'join':
        userInit(self,decodeData)
        exitGameSoft(self,decodeData)
        joinGame(self,decodeData)
    elif decodeData['action'] == 'reconnectionGame':
        userInit(self,decodeData)
        reconnectionGame(self,decodeData)
    elif decodeData['action'] == 'startGame':
        startGame(self,decodeData)
    elif decodeData['action'] == 'gameStageNext':
        gameStageNext(self,decodeData)    
    elif decodeData['action'] == 'voteUser':
        voteUser(self,decodeData)
    elif decodeData['action'] == 'changePos':
        changePos(self,decodeData)
    elif decodeData['action'] == 'changeUserInfo':
        changeUserInfo(self,decodeData)
    elif decodeData['action'] == 'setJudge':
        setJudge(self,decodeData)
    elif decodeData['action'] == 'getWords':
        getWords(self,decodeData)
    elif decodeData['action'] == 'guessWord':
        guessWord(self,decodeData)  
    elif decodeData['action'] == 'guessWordCorrect':
        guessWordCorrect(self,decodeData)            
    elif decodeData['action'] == 'exit':
        exitGame(self,decodeData)
    else:
        pass

#初始化用户
#创建游戏、加入游戏、重连游戏 时必须设置好uid(有则携带，没有则创建)，而querystatus 等动作就无所谓了
def userInit(self,decodeData):
    if 'uid' not in decodeData:
        uid=userAdd()
    else:
        uid=int(decodeData['uid'])
    
    #判断用户是否在用户列表中
    socketId=getSocketByUid(uid)
    if socketId != None and socketId != self:
        userList[self]=copy.deepcopy(userList[socketId])
        userList[self]['nick']=decodeData['nick']
        userList[self]['avatarId']=decodeData['avatarId']
        userList[self]['online']=1
        del userList[socketId]
    else:
        userList[self]={'uid':uid,'deskId':0,'nick':decodeData['nick'],'avatarId':decodeData['avatarId'],'seatPos':0,'online':1,'identity':11,'alive':1,'voteUid':0}
    #print userList

#根据uid找出socketId
def getSocketByUid(uid):
    for socketId in userList:
        if userList[socketId]['uid'] == uid:
            return socketId
    return None




#检查玩家状态，一般用于掉线重连
def queryStatus(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    sendData['callback']=decodeData['callback']
    try:
        uid=int(decodeData['uid'])
    except:
        uid=0
    deskId=0
    sendData['content']['ret']=0
    for userIndex in  userList:
        #如果玩家存在，并且桌子也还存在
        if userList[userIndex]['uid'] == uid and deskList.has_key( userList[userIndex]['deskId'] ):
            sendData['content']['ret']=1
            sendData['content']['deskId']=userList[userIndex]['deskId']

    self.send_data( json.dumps( sendData ) )


#创建游戏
#参数无
def createGame(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId = createDesk()
    deskList[deskId]=copy.deepcopy(deskListDefault)
    deskList[deskId]['info']={'deskId':deskId,'createTime':int(time.time()),'status':0,'ghostNum':0,'userLimit':14}
    deskList[deskId]['extend']={'cleanFlag':0,'wordHuman':'','wordGhost':'','bindList':'','voteStatus':{},'voteMsg':'','tempUserList':[]}
    userList[self]['deskId']=deskId
    userList[self]['online']=1
    userList[self]['identity']=11
    userList[self]['alive']=1
                        
    sendData['callback']=decodeData['callback']
    sendData['content']['ret']=0
    sendData['content']['uid']=userList[self]['uid']
    sendData['content']['userlist']=getUserByDesk(deskId)
    sendData['content']['deskInfo']=deskList[deskId]['info']
    self.send_data( json.dumps( sendData ) )
    
#加入游戏
#参数
#deskId 桌子ID   
def joinGame(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId = 0
    try:
        deskId=int(decodeData['deskId'])
    except:
        pass
    if deskId in deskList.keys():#存在此桌子
        #先判断游戏是否开始
        if deskList[deskId]['info']['status']==0:
            #随机找一个座位，先去除已占座的
            seatList=range(1,deskList[deskId]['info']['userLimit'])
            for userIndex in userList:
                if userList[userIndex]['deskId']==deskId:
                    seatList = [ i for i in seatList if i !=userList[userIndex]['seatPos']]
                    
            if len(seatList)>0:
                userList[self]['deskId']=deskId
                userList[self]['online']=1
                userList[self]['identity']=0
                userList[self]['alive']=1

                userList[self]['seatPos']= seatList[int(random.random()*len(seatList))]

                #通知桌子上的其它玩家
                message="玩家\""+userList[self]['nick']+"\"加入游戏！"
                userUpdate(deskId,message)

                sendData['callback']=decodeData['callback']
                sendData['content']['ret']=0
                sendData['content']['uid']=userList[self]['uid']
                #if userList[self]['identity']==11:
                sendData['content']['userlist']=getUserByDesk(deskId)
                #else:
                    #sendData['content']['userlist']=getUserByDeskNoIdent(deskId)
                sendData['content']['deskInfo']=deskList[deskId]['info']

            else:#桌子已满员！'
                sendData['callback']=decodeData['callback']
                sendData['content']['ret']=1
                sendData['content']['msg']='该桌坐满啦,请换其它桌！'
        else:#游戏已开始，不能加入
            sendData['callback']=decodeData['callback']
            sendData['content']['ret']=1
            sendData['content']['msg']='游戏已开始，加入失败！'

    else:#桌子不存在
        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=2
        sendData['content']['msg']='找不到该桌！'
    
    self.send_data( json.dumps( sendData ) )

#游戏重新开始
def gameRestart(deskId):
    sendData=copy.deepcopy(sendDataDefault)
    #还原桌子信息
    deskList[deskId]['info']['status']=0
    deskList[deskId]['extend']['wordHuman']=''
    deskList[deskId]['extend']['wordGhost']=''
    deskList[deskId]['stage']['step']=[]
    deskList[deskId]['stage']['type']=-1
    deskList[deskId]['extend']['tempUserList']=[]
    #还原用户信息
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']!=11:
            userList[userIndex]['identity']=0
            userList[userIndex]['alive']=1
            userList[userIndex]['voteUid']=0

    sendData['content']['deskInfo']=deskList[deskId]['info']        
    sendData['content']['userlist']=getUserByDesk(deskId)        
    sendData['callback']='gameRestart'
    sendData['content']['ret']=0
    sendData['content']['msg']='重新开始游戏'
    sendDataByDesk(deskId,0,sendData)

#重连游戏
#参数无
def reconnectionGame(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    try:
        deskId = int(userList[self]['deskId'])
    except:
        deskId = 0 
    if userList.has_key(self) and deskList.has_key(deskId):
        userList[self]['online']=1

        #通知桌子上的其它玩家
        message="玩家\""+userList[self]['nick']+"\"又回来了！"
        userUpdate(deskId,message)

        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=0
        sendData['content']['deskInfo']=deskList[deskId]['info']
        sendData['content']['uid']=userList[self]['uid']

        if userList[self]['identity']==11:
            sendData['content']['userlist']=getUserByDesk(deskId)
        else:
            sendData['content']['userlist']=getUserByDeskNoIdent(deskId)

        #游戏状态
        if deskList[deskId]['info']['status']==1:
            sendData['content']['deskStage']=deskList[deskId]['stage']      #桌子信息
            sendData['content']['voteUserStatus']=voteStatus(deskId)         #投票信息，用于法官查看
            sendData['content']['voteUserList']=getAliveUserByDesk(deskId)  #活着的玩家列表，用于设置可投票

            #获取词条
            # if userList[self]['deskId']==deskId and userList[self]['identity']==1 and userList[self]['online']==1:
            #     sendData['content']['words']={'human':deskList[deskId]['extend']['wordHuman'],'ghost':deskList[deskId]['extend']['wordHuman']}
            # elif userList[self]['deskId']==deskId and userList[self]['identity']==2 and userList[self]['online']==1:
            #     sendData['content']['words']={'human':deskList[deskId]['extend']['wordGhost'],'ghost':deskList[deskId]['extend']['wordGhost']}
            # elif userList[self]['deskId']==deskId and userList[self]['identity']==11 and userList[self]['online']==1:
            #     sendData['content']['words']={'human':deskList[deskId]['extend']['wordHuman'],'ghost':deskList[deskId]['extend']['wordGhost']}

        self.send_data( json.dumps( sendData ) )
        
    else:
        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=1
        sendData['content']['msg']='重连失败，游戏已结束！'
        self.send_data( json.dumps( sendData ) )

#硬退出(用户触发主动离开游戏)
#参数无
def exitGame(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    if userList.has_key(self):
        deskId = int(userList[self]['deskId'])

        #如果游戏还没开始，法官离开了，则玩家中的第一人为法官
        deskStatus=0
        for deskIndex in deskList:
            if deskList[deskIndex]['info']['deskId']==deskId:
                deskStatus=deskList[deskIndex]['info']['status']

        if deskStatus==0 and userList[self]['identity'] == 11:
            for userIndex in userList:
                if userList[userIndex]['deskId']==deskId and userIndex!=self:
                    userList[userIndex]['identity'] = 11
                    break

        message="玩家\""+userList[self]['nick']+"\"离开游戏！"            
        del userList[self]

        
        userUpdate(deskId,message)

        

        #通知本人成功退出
        sendData['content']['ret']=0
        sendData['callback']=decodeData['callback']
        self.send_data( json.dumps( sendData ) )
        
#软退出(玩家在加入或创建游戏时触发，如果玩家已线在某桌了，但掉线却加入其它桌，则通知原来桌的其它玩家)

def exitGameSoft(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)

    deskId=0
    try:
        deskId = int(decodeData['deskId'])
    except:
        pass
    if userList.has_key(self) and userList[self]['deskId']!=0:#如果用户已经在游戏中
        deskId2=int(userList[self]['deskId'])
        if deskId == deskId2 :#如果正好在原来的桌子，则重连，如果是创建游戏，是不可能的！
            reconnectionGame(self,decodeData)
            return
        else:
            #如果不在原来的桌子中，则原来的桌子先退出游戏，再加入新的游戏
            #通知游戏其它玩家
            userList[self]['deskId']=0
            userList[self]['online']=1

            message="玩家\""+userList[self]['nick']+"\"离开游戏！"
            userUpdate(deskId2,message)

#开始游戏
def startGame(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']
    userCount=0
    userListByRole=[]
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId:
            userCount+=1
            if userList[userIndex]['identity']!=11:
                userListByRole.append(userIndex)

    if userCount<userLimit:
        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=1
        sendData['content']['msg']='创建游戏失败，玩家数量不足'
        self.send_data( json.dumps( sendData ) )
    else:
        #保存桌子信息
        deskList[deskId]['extend']['wordHuman']=decodeData['wordHuman']
        deskList[deskId]['extend']['wordGhost']=decodeData['wordGhost']
        deskList[deskId]['info']['ghostNum']=decodeData['ghostNum']
        deskList[deskId]['info']['status']=1
        #重置玩家信息
        for userIndex in userList:
            if userList[userIndex]['deskId']==deskId:
                userList[userIndex]['alive']=1
                userList[userIndex]['voteUid']=0


        #分配游戏角色
        #先得到随机数量的鬼
        randomList=[]
        while len(randomList)<deskList[deskId]['info']['ghostNum']:
            randomList.append( int(random.random()*len(userListByRole)) )
            randomList=list(set(randomList))
            #print randomList
        roleIndex=0
        for roleItem in userListByRole:
            if roleIndex in randomList:#这是鬼
                userList[roleItem]['identity']=2
            else:
                userList[roleItem]['identity']=1
            roleIndex+=1

        #print  userList
        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=0
        sendData['content']['msg']='开始游戏！'
        for userIndex in userList:
            if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']==1 and userList[userIndex]['online']==1:
                sendData['content']['words']={'human':deskList[deskId]['extend']['wordHuman'],'ghost':deskList[deskId]['extend']['wordHuman']}
            elif userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']==2 and userList[userIndex]['online']==1:
                sendData['content']['words']={'human':deskList[deskId]['extend']['wordGhost'],'ghost':deskList[deskId]['extend']['wordGhost']}
            elif userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']==11 and userList[userIndex]['online']==1:
                sendData['content']['words']={'human':deskList[deskId]['extend']['wordHuman'],'ghost':deskList[deskId]['extend']['wordGhost']}
            
            userIndex.send_data( json.dumps( sendData ) )

        userUpdate(deskId,'')
        gameStageNext(self,decodeData)


#游戏进入下一步
#stage.type -1未开始游戏 0陈述 1投票 2猜词 3结束 4结果 5重新开始
def gameStageNext(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']
    
    if len(deskList[deskId]['extend']['tempUserList'])>0:
        activeUserList=deskList[deskId]['extend']['tempUserList']
    else:
        activeUserList=getAliveUserByDesk(deskId)
    

    if deskList[deskId]['stage']['type']==-1:
        stepType=0
        message='陈述阶段:请从法官左手开始，顺时针陈述。'
        sendData['content']['activeUserList']=activeUserList
    elif deskList[deskId]['stage']['type']==0:
        voteReset(deskId)
        stepType=1
        message='投票阶段:请选择一位玩家。'
        #获取还未死的玩家列表
        sendData['content']['activeUserList']=activeUserList

    elif deskList[deskId]['stage']['type']==1:
        stepType=2
        sendData['content']['activeUserList']=activeUserList
        message=dealVoteData(deskId)


    elif deskList[deskId]['stage']['type']==2:
        stepType=0
        message='陈述阶段:请从法官左手开始，顺时针陈述。'
        sendData['content']['activeUserList']=activeUserList
    elif deskList[deskId]['stage']['type']==3:
        stepType=4
        message='公布身份和选词。'
    elif deskList[deskId]['stage']['type']==4:
        gameRestart(deskId)
        return

    finishFlag=False
    if deskList[deskId]['stage']['type']<3:
        #判断是否胜
        if len(getAliveGhostByDesk(deskId))==0:
            userIdentityUpdate(deskId)
            stepType=3
            message='鬼死完了，人胜利了'
            sendData['content']['winner']=1
            gameFinish(deskId,1,message)
            finishFlag=True
        elif len(getAliveUserByDesk(deskId))<=2:
            userIdentityUpdate(deskId)
            stepType=3
            message='只剩下2个玩家，鬼胜利了'
            sendData['content']['winner']=2
            gameFinish(deskId,2,message)
            finishFlag=True

    deskList[deskId]['stage']['type']=stepType
    deskList[deskId]['stage']['step'].append(stepType)

    if finishFlag:
        return

    sendData['callback']='handleGameStage'
    sendData['content']['ret']=0
    sendData['content']['msg']=message
    sendData['content']['deskStage']=deskList[deskId]['stage']

    sendDataByDesk(deskId,0,sendData)

#清空投票数据，准备重新投票
def voteReset(deskId):
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId:
            userList[userIndex]['voteUid']=0


#处理投票数据，返回值为Flase时，由本函数触发下一步
def dealVoteData(deskId):
    sendData=copy.deepcopy(sendDataDefault)
    #取出得票最多的玩家
    voteNumMaxList=[]
    voteNumMax=0
    voteUserStatus=voteStatus(deskId)
    message=''
    for voteUserItem in voteUserStatus:
        if voteUserItem['voteNum']>voteNumMax and voteUserItem['voteNum']>0:
            voteNumMaxList=[voteUserItem['uid']]
            voteNumMax=voteUserItem['voteNum']
        elif voteUserItem['voteNum']==voteNumMax and voteUserItem['voteNum']>0:
            voteNumMaxList.append(voteUserItem['uid'])


    #票最多的玩家只有一个时，用户可以死了
    if len(voteNumMaxList)==1:
        userDeadIndex=getUserByUid(voteNumMaxList[0])
        userList[userDeadIndex]['alive']=0
        #如果是内鬼，可是猜词反击
        if userList[userDeadIndex]['identity']==2:
            message=userList[userDeadIndex]['nick']+' 被投死'
            sendData['content']['deadIdentity']=2
            sendData['content']['ret']=0
        else:
            message=userList[userDeadIndex]['nick']+' 被投死'
            sendData['content']['deadIdentity']=1
            sendData['content']['ret']=0

        deskList[deskId]['extend']['tempUserList']=[]
        deskList[deskId]['extend']['voteMsg']=message
        sendData['callback']='userDead'

    elif len(voteNumMaxList)>1:
        deskList[deskId]['extend']['tempUserList']=voteNumMaxList

        sendData['content']['deadIdentity']=0
        sendData['content']['ret']=0
        message='未产生最高票'




    
    sendData['content']['msg']=message
    judgeSocketId=getJudgeSocketByDesk(deskId)
    if judgeSocketId!=0 and userList[judgeSocketId]['online']==1:
        judgeSocketId.send_data( json.dumps( sendData ) )

    sendData['callback']='handleVoteResult'
    sendData['content']['msg']=message  
    sendData['content']['voteUserStatus']=deskList[deskId]['extend']['voteStatus']  
    sendDataByDesk(deskId,judgeSocketId,sendData)

    userUpdate(deskId,'')
    return message

#投票动作
def voteUser(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']

    voteUid=int(decodeData['voteUid'])
    voteUserInfo=userList[getUserByUid(voteUid)]
    if voteUserInfo!=0:
        #游戏已开始 and 游戏在投票阶段 and 投的玩家不是法官 and 投的玩家没死 and 投的不是自己
        if deskList[deskId]['info']['status']==1 and deskList[deskId]['stage']['type']==1 and voteUserInfo['identity']!=11 and voteUserInfo['alive']==1 and voteUid!=userList[self]['uid']:
            #如果是投的原来的用户，不做任何处理
            if userList[self]['voteUid']!=voteUid:
                userList[self]['voteUid']=voteUid
                message=userList[self]['nick']+' 投票给 '+ voteUserInfo['nick']
                
                sendData['callback']='voteStatus'
                sendData['content']['ret']=0
                sendData['content']['msg']=message
                sendData['content']['voteUserStatus']=voteStatus(deskId)
                

                sendDataByDesk(deskId,0,sendData)


#统计投票情况
def voteStatus(deskId):
    voteUserStatus=[]
    for userIndex in userList:
        #需要统计的用户：在本桌 and 不是法官 and 还没有死
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']!=11 and userList[userIndex]['alive']==1:
            voteUserStatus.append({'uid':userList[userIndex]['uid'],'voteUid':userList[userIndex]['voteUid'],'voteNum':0})
    for voteItem in voteUserStatus:
        for voteItem2 in voteUserStatus:
            if voteItem2['voteUid']==voteItem['uid']:
                voteItem['voteNum']+=1

    deskList[deskId]['extend']['voteStatus']=voteUserStatus
    return voteUserStatus
    



def guessWordCorrect(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']
    #法官 and 游戏已开始
    if userList[self]['identity']==11 and deskList[deskId]['info']['status']==1 :
        deskList[deskId]['stage']['type']=3
        deskList[deskId]['stage']['step'].append(3)

        userIdentityUpdate(deskId)
        gameFinish(deskId,2,'鬼猜词正确，游戏结束!')


def gameFinish(deskId,t,message):
    sendData=copy.deepcopy(sendDataDefault)
    sendData['callback']='handleGameFinish'
    sendData['content']['ret']=0
    sendData['content']['msg']=message
    sendData['content']['winner']=t


    sendDataByDesk(deskId,0,sendData)


# succ = 1 人胜利  succ = 2 鬼胜利
#total_times 总次数 total_score 总积分 ghost_times 鬼次数 ghost_succ 鬼胜利次数 human_times 人次数 human_succ 人胜利次数
def finishAndStat(deskId, succ):
    DEF_SUCC_SCORE_ONCE=1
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']!=11:
            if not userList[userIndex].has_key('userStat'): #init userStat
                userStat={}
                userStat['total_times'] = 0
                userStat['total_score'] = 0
                userStat['ghost_times'] = 0
                userStat['ghost_succ'] = 0
                userStat['human_times'] = 0
                userStat['human_succ'] = 0
                userList[userIndex]['userStat'] = userStat

            userList[userIndex]['userStat']['total_times']+=1
            if succ == 1: # human succ
                if userList[userIndex]['identity'] == 1: # human
                    userList[userIndex]['userStat']['total_score']+=DEF_SUCC_SCORE_ONCE
                    userList[userIndex]['userStat']['human_times']+=1
                    userList[userIndex]['userStat']['human_succ']+=1
                else:
                    userList[userIndex]['userStat']['ghost_times']+=1
            else: # ghost succ
                if userList[userIndex]['identity'] == 2: # ghost
                    userList[userIndex]['userStat']['total_score']+=DEF_SUCC_SCORE_ONCE
                    userList[userIndex]['userStat']['ghost_times']+=1
                    userList[userIndex]['userStat']['ghost_succ']+=1
                else:
                    userList[userIndex]['userStat']['human_times']+=1

            # 更新用户积分
            #print userList[userIndex]
            UpdateUserStat(deskId, uid, userList[userIndex]['userStat'])

# 将用户的积分信息写入数据库
def UpdateUserStat(deskId, uid, userStat):
    sql='INSERT INTO ghost.user_score(deskId,uid, total_times, total_score, ghost_times, ghost_succ, human_times, human_succ ) '\
        'VALUES( %d, %d, %d, %d, %d, %d, %d, %d ) ON DUPLICATE KEY UPDATE total_times=%d, total_score=%d,'\
        'ghost_times=%d, ghost_succ=%d, human_times=%d, human_succ=%d '\
        %(deskId, uid, userStat['total_times'], userStat['total_score'], userStat['ghost_times'], userStat['ghost_succ'], userStat['human_times'], userStat['human_succ'],\
          userStat['total_times'], userStat['total_score'], userStat['ghost_times'], userStat['ghost_succ'], userStat['human_times'], userStat['human_succ'])

    #print sql
    exec_db(sql)

# 将用户的积分信息写入数据库
def ClearUserStat(deskId):
    sql='DELETE FROM ghost.user_score WHERE deskId=%d' %(deskId)
    print sql
    exec_db(sql)

# 执行DB操作
def exec_db(sql):
    return
    try:
        conn = MySQLdb.connect(host='127.0.0.1', user='root', passwd='',db='ghost')
        cursor = conn.cursor()
        count = cursor.execute(sql)
        results = cursor.fetchall()
        conn.close()
        return results
    except MySQLdb.Error as e:
        print("Mysql Error:%s\nSQL:%s" %(e,sql))
        return None


##用户换位置
def changePos(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']

    # 获得位置的用户
    seatpos1=int(decodeData['seatpos1'])
    seatpos2=int(decodeData['seatpos2'])
    UinAInfo =  getUserInfoByPos(deskId, seatpos1)
    UinBInfo =  getUserInfoByPos(deskId, seatpos2)
    if seatpos1 == seatpos2:
        print 'ERROR:seatpos1 == seatpos2, do nothing'
        return
    if UinAInfo is None and UinBInfo is None:
        print 'ERROR:both pos not has uin'
        return

    # 用户是普通用户,且用户指定座位不为空
    if userList[self]['identity'] != 11 and ( userList[self]['seatPos'] != seatpos1 or UinBInfo is not None):
        sendData['callback']=decodeData['callback']
        sendData['content']['ret']=1
        sendData['content']['msg']='目标座位不为空'
        self.send_data( json.dumps( sendData ) )
        return

    # 开始换位置
    if UinAInfo is not None:
        print 'Move Pos[%s] to [%s]' %(UinAInfo['seatPos'],seatpos2)
        UinAInfo['seatPos'] = seatpos2
    if UinBInfo is not None:
        print 'Move Pos[%s] to [%s]' %(UinBInfo['seatPos'],seatpos1)
        UinBInfo['seatPos'] = seatpos1

    # 获取提示信息
    msg=''
    if UinAInfo is not None:
        if UinBInfo is not None:
            msg='用户【%s】和用户【%s】换位置' %(UinAInfo['nick'],UinBInfo['nick'])
        else:
            msg='用户【%s】换到位置%s' %(UinAInfo['nick'], seatpos2)
    else:
        if UinBInfo is not None:
            msg='用户【%s】换到位置%s' %(UinBInfo['nick'], seatpos1)

    # 更新所有用户信息
    userUpdate(deskId,msg)


##用户更新个人信息
def changeUserInfo(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']

    # 更新用户信息
    userList[self]['nick']=decodeData['nick']
    userList[self]['avatarId']=decodeData['avatarId']

    # 更新所有用户信息
    msg='用户【%s】修改信息成功' %(userList[self]['nick'])
    userUpdate(deskId,msg)

## 重新指定裁判
def setJudge(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']

    judge_uid = int(decodeData['judge_uid'])
    if userList[self]['identity'] != 11: # not judge
        print 'ERROR: not judge to set judge!!!'
        return

    judge_socket=getUserByUid(judge_uid)
    if judge_socket == 0 or userList[judge_socket]['deskId'] != deskId:
        print 'ERROR: uid is has not find or not same desk!!!'
        return
    if judge_socket == self:
        return

    # 必须是在没有开始的情况下才可以更新
    if deskList[deskId]['info']['status'] == 1:
        return

    # 更新裁判信息
    userList[self]['identity'] = 0
    userList[judge_socket]['identity'] = 11

    # 更新所有用户信息
    msg='用户【%s】被指定为裁判' %(userList[judge_socket]['nick'])
    userUpdate(deskId,msg)


## 获取字库
def getWords(self,decodeData):
    sendData=copy.deepcopy(sendDataDefault)
    deskId=userList[self]['deskId']

    reqWordsNum = int(decodeData['reqNum'])
    sql='SELECT id,WordA,WordB FROM ghost.words ORDER BY rand() LIMIT %s' %(reqWordsNum)
    res = exec_db(sql)
    print res
    # return pack
    sendData=copy.deepcopy(sendDataDefault)
    sendData['callback']=decodeData['callback']
    sendData['content']['ret']=0
    sendData['content']['msg']='拉取字库成功'

    WordList=[]
    for r in res:
        Words = {}
        Words['wordA'] = r[1]
        Words['wordB'] = r[2]
        WordList.append(Words)

    sendData['content']['num'] = len(WordList)
    sendData['content']['list'] = WordList
    self.send_data( json.dumps( sendData ) )

def InsertWords(self,wordA,wordB):
    sql='SELECT id,WordA,WordB FROM ghost.words ORDER BY rand() LIMIT %s' %(reqWordsNum)
    res = exec_db(sql)
    print res

#桌子信息更新，一般用于玩家更新
def userUpdate(deskId,message):
    sendData=copy.deepcopy(sendDataDefault)
    sendData['callback']='handleUserUpdate'
    sendData['content']['ret']=0
    sendData['content']['msg']=message

    judgeSocketId=getJudgeSocketByDesk(deskId)
    if judgeSocketId!=0 and userList[judgeSocketId]['online']==1:
        sendData['content']['userlist']=getUserByDesk(deskId)
        judgeSocketId.send_data( json.dumps( sendData ) )

    sendData['content']['userlist']=getUserByDeskNoIdent(deskId)

    #print 'userUpdate',sendData

    sendDataByDesk(deskId,judgeSocketId,sendData)#发送该桌其它的玩家，自己的带上uid另外发送 

#桌子信息更新，包含身份
def userIdentityUpdate(deskId):
    sendData=copy.deepcopy(sendDataDefault)
    sendData['callback']='userIdentityUpdate'
    sendData['content']['ret']=0

    sendData['content']['userlist']=getUserByDesk(deskId)
    sendData['content']['words']=deskList[deskId]['extend']
    sendDataByDesk(deskId,0,sendData)#发送该桌其它的玩家，自己的带上uid另外发送 


#根据用户uid获取用户信息
def getUserByUid(uid):
    for userIndex in userList:
        if userList[userIndex]['uid']==uid:
            return userIndex
    return 0

#根据桌号获取 还活着的玩家uid列表，不包括法官
def getAliveUserByDesk(deskId):
    userListByDesk=[]
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']!=11 and userList[userIndex]['alive']==1:
            userListByDesk.append(  userList[userIndex]['uid']  )

    return userListByDesk

def getAliveGhostByDesk(deskId):
    userListByDesk=[]
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']==2 and userList[userIndex]['alive']==1:
            userListByDesk.append(  userList[userIndex]['uid']  )

    return userListByDesk


#根据桌号获取所有玩家列表，不包括ident
def getUserByDeskNoIdent(deskId):
    userListByDesk=[]
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId:
            userListByDesk.append(  copy.deepcopy(userList[userIndex])  )

    #过滤掉ident
    for userItem in userListByDesk:
        if  userItem['identity']!=11:
            userItem['identity']=0

    return userListByDesk

#根据桌号获取所有玩家列表，包括ident
def getUserByDesk(deskId):
    userListByDesk=[]
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId:
            userListByDesk.append(userList[userIndex])
    return userListByDesk

#根据桌号获取法官socketId
def getJudgeSocketByDesk(deskId):
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['identity']==11:
            return userIndex
    return 0

def getUserInfoByPos(deskId, seatPos):
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userList[userIndex]['seatPos']==seatPos:
            return userList[userIndex]
    return None

#给桌号所有在线玩家发消息，第二个参数为排除列表
def sendDataByDesk(deskId,exceptSocketId,content):
    for userIndex in userList:
        if userList[userIndex]['deskId']==deskId and userIndex!=exceptSocketId and userList[userIndex]['online']==1:
            userIndex.send_data( json.dumps( content ) )
    
#添加用户 临时用户
def userAdd():
    configData['uid'] +=1
    return configData['uid']

#创建游戏桌子
def createDesk():
    ret=-1
    deskRange=range(configData['deskId'],configData['deskCount'])
    for deskIndex in deskList:
        if(deskIndex in deskRange):
            deskRange = [ i for i in deskRange if i !=deskIndex]
            #del deskRange[deskIndex]
    if len(deskRange)>0:
        ret= deskRange[int(random.random()*len(deskRange))]
    return ret

#socket断开
def userLost(self):
    #print 'userLost user start'
    if userList.has_key(self):
        userList[self]['online']=0
        deskId=userList[self]['deskId']

        #游戏中的玩家掉线，给桌子其它玩家发送掉线消息
        # sendData=copy.deepcopy(sendDataDefault)
        # sendData['callback']='handleUserUpdate'
        # sendData['content']['ret']=0

        # judgeSocketId=getJudgeSocketByDesk(deskId)
        # if judgeSocketId!=0:
        #     try:
        #         sendData['content']['userlist']=getUserByDesk(deskId)
        #         judgeSocketId.send_data( json.dumps( sendData ) )
        #     except:
        #         pass
        # sendData['content']['userlist']=getUserByDeskNoIdent(deskId)
        # sendDataByDesk(deskId,judgeSocketId,sendData)#发送该桌其它的玩家，自己的带上uid另外发送

        message="玩家\""+userList[self]['nick']+"\"掉线了！"
        userUpdate(deskId,message)


#常规任务
def taskSacn():
    userOfflineCount=0
    for userIndex in userList:
        if userList[userIndex]['online'] == 0:
            userOfflineCount+=1
    print 'desk:[',len(deskList) ,'] user:[',len(userList) ,'] offline:[',userOfflineCount,']'
    #print userList

#清理性任务
def taskCleanScan():
    #如果桌子无玩家，则释放桌子,5分钟清理一次
    #如果连续3次检测桌子都是已掉线玩家，则释放桌子
    deskDelList=[]
    for deskIndex in deskList:
        deskDelFlag=True
        deskOfflineCount=0  #桌子不在线的玩家
        for userIndex in userList:
            if userList[userIndex]['deskId'] == deskList[deskIndex]['info']['deskId'] and userList[userIndex]['online'] == 1:
                deskList[deskIndex]['extend']['cleanFlag']=0
                deskDelFlag=False
            elif userList[userIndex]['deskId'] == deskList[deskIndex]['info']['deskId'] and userList[userIndex]['online'] == 0:
                deskOfflineCount+=1

        if deskDelFlag == True and deskOfflineCount==0:
            deskDelList.append(deskIndex)
        elif deskDelFlag == True and deskOfflineCount>0:
            deskList[deskIndex]['extend']['cleanFlag']+=1
            if deskList[deskIndex]['extend']['cleanFlag']>1:
                deskDelList.append(deskIndex)

    for deskId in deskDelList:
        print 'clear desk',deskList[deskId]['info']['deskId']
        del deskList[deskId]
        ClearUserStat(deskId)


#服务器初始化
def wsServerInit():
    global bc
    bc = BroadcastFactory()
    reactor.listenTCP(8001,bc )


#读取与保存配置文件
configFile = 'config.dat'

def configInit():
    global configData
    try:
        f=file(configFile)
        configData=cPickle.load(f)
        #print configData
        configData['deskId'] = 100 #每次启动游戏，房间号都从100开始
        f.close()
    except:
        print 'config load error'


#保存配置文件
def configSave():
    global configData
    try:
        f=file(configFile,'w')
        #print configData
        cPickle.dump(configData,f)
        f.close()
    except:
        #pass
        print 'config save error'


