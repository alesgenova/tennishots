#!/bin/bash
NOWIPADDR="/home/tennistat/webapps/tennistat/deploy/nowipaddr"
GETIPADDR=`curl ipinfo.io/ip`
LOG="/home/tennistat/webapps/tennistat/deploy/ip.log"
timestamp=$( date +%T )
curDate=$( date +"%m-%d-%y" )

if [ -f $NOWIPADDR ]; then
  if [[ $GETIPADDR = $(< $NOWIPADDR) ]]; then
    echo
  else
    echo $curDate $timestamp " IP address change: " $GETIPADDR >> $LOG
    echo $GETIPADDR > $NOWIPADDR
    sendEmail -o tls=yes -f tennistat.xyz@gmail.com -t ales.genova@gmail.com -s smtp.gmail.com:587 -xu tennistat.xyz@gmail.com -xp vitellOtonnatO87 -u "TENNISTAT IP CHANGE" -m "$GETIPADDR"
fi
else
  echo $curDate $timestamp " IP address change: " $GETIPADDR >> $LOG
  echo $GETIPADDR > $NOWIPADDR
  sendEmail -o tls=yes -f tennistat.xyz@gmail.com -t ales.genova@gmail.com -s smtp.gmail.com:587 -xu tennistat.xyz@gmail.com -xp vitellOtonnatO87 -u "TENNISTAT IP CHANGE" -m "$GETIPADDR"
fi

