#!/usr/bin/env python
# -*- coding: utf8 -*-

import MySQLdb
import json
import time
import random
import copy

userStat={}
userStat['total_times'] = 1
userStat['total_score'] = 2
userStat['ghost_times'] = 3
userStat['ghost_succ'] = 4
userStat['human_times'] = 5
userStat['human_succ'] = 7

def UpdateUserStat(deskId, uid, userStat):
    sql='INSERT INTO ghost.user_score(deskId,uid, total_times, total_score, ghost_times, ghost_succ, human_times, human_succ ) '\
        'VALUES( %d, %d, %d, %d, %d, %d, %d, %d ) ON DUPLICATE KEY UPDATE total_times=%d, total_score=%d,'\
        'ghost_times=%d, ghost_succ=%d, human_times=%d, human_succ=%d '\
        %(deskId, uid, userStat['total_times'], userStat['total_score'], userStat['ghost_times'], userStat['ghost_succ'], userStat['human_times'], userStat['human_succ'],\
          userStat['total_times'], userStat['total_score'], userStat['ghost_times'], userStat['ghost_succ'], userStat['human_times'], userStat['human_succ'])

    print sql
    exec_db(sql)

def exec_db(sql):
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

#UpdateUserStat(101,10002, userStat)

#reqWordsNum=2
#sql='SELECT id,WordA,WordB FROM ghost.words ORDER BY rand() LIMIT %s' %(reqWordsNum)
#res = exec_db(sql)
#print res
#sendDataDefault={'callback':'','content':{'ret':-1,'data':''}}
#sendData=copy.deepcopy(sendDataDefault)
#sendData['callback']='handleChangePos'
#sendData['content']['ret']=1
#sendData['content']['msg']='asda'
#
#WordList=[]
#for r in res:
#    Words = {}
#    Words['wordA'] = r[1]
#    Words['wordB'] = r[2]
#    WordList.append(Words)
#
#sendData['content']['num'] = len(WordList)
#sendData['content']['list'] = WordList
#print json.dumps( sendData )

def InsertWordsToDBDict(wordA,wordB):
    bIsHasWord = False
    # 查看是否存在相同的词语
    sql="SELECT COUNT(id) FROM ghost.words WHERE (WordA='%s'and WordB='%s') or (WordA='%s'and WordB='%s')" \
        %(wordA, wordB, wordB, wordB)
    res = exec_db(sql)
    for r in res:
        if  int(r[0]) > 0:
            bIsHasWord = True
            print "Already has",wordA,wordB

    # 没有相同词语则插入
    if False == bIsHasWord:
        sql="INSERT INTO ghost.words(WordA, WordB) VALUES ('%s','%s') " %(wordA, wordB)
        exec_db(sql)
        print "Insert Into",wordA,wordB
    return


#InsertWords("a1","a2")

def InsertWordsFromFile():
    fd=open("dict.txt")
    #fd=open('a.txt')
    for line in fd:
        #print line,"aaa"
        list = line.split('#')
        #print list[0],list[1]
        InsertWordsToDBDict(list[0],list[1])



#InsertWordsFromFile()

str = '中国人'
print len(str)
str = 'abcdefghigk'
print str.decode('utf-8')[0:4].encode('utf-8')
print len(str)
message=""
message="%s 【%s】" %(message, 'abc')
message="%s 【%s】" %(message, 'abc')
message="%s 相同票数，请继续陈述" %(message)

print message