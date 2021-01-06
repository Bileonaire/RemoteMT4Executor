//+------------------------------------------------------------------+
//|                                               Moving Average.mq4 |
//|                   Copyright 2005-2014, MetaQuotes Software Corp. |
//|                                              http://www.mql4.com |
//+------------------------------------------------------------------+
#property copyright "Copyright � 2020, Bileonaire."

#property description "Execute Trade from API"

#include <stderror.mqh>
#include <stdlib.mqh>
#include <json.mqh>

extern string acc_number;

datetime LastActiontime;
extern string httpLink = "http://dad5f30964d4.ngrok.io/api/trades/";

string resData;
//+------------------------------------------------------------------+
//| OnTick function                                                  |
//+------------------------------------------------------------------+
void OnTick()
  {
   //Comparing LastActionTime with the current starting time for the candle
   if(LastActiontime!=Time[0]){
      //Code to execute once in the bar
      remoteExecutor();
      LastActiontime=Time[0];
   }
  }
//+------------------------------------------------------------------+

string apiCall(string type, string link) {
   string cookie=NULL,headers;
   char post[],result[];

   int timeout=8000; //--- Timeout below 1000 (1 sec.) is not enough for slow Internet connection
   string res=WebRequest(type, link ,cookie,NULL,timeout,post,0,result,headers);
   resData = CharArrayToString(result);
return res;
}

int remoteExecutor() {
    string link = httpLink + acc_number;
    string str = apiCall("GET", link);

    if (str == "200") {
      JSONParser *parser = new JSONParser();

      JSONValue *jv = parser.parse(resData);

      if (jv == NULL) {
          MessageBox("error:"+(string)parser.getErrorCode()+parser.getErrorMessage());
      } else {
          if (jv.isObject()) {
              JSONObject *jo = jv;
              string symbol = jo.getString("symbol");
              string ordertype = jo.getString("ordertype");
              double account = jo.getDouble("account");
              double percentage_risk = jo.getDouble("percentage_risk");
              double pendingorderprice = jo.getDouble("pendingorderprice");
              string sl_tp_type = jo.getString("sl_tp_type");
              double sl = jo.getDouble("sl");
              double tp = jo.getDouble("tp");
              

              // Executed_Successfully
              string link2 = link + "/" + DoubleToStr(jo.getDouble("id"), 0);
              string success = apiCall("GET", link2);
              if (success == "200") {
                resData = "";
              }
          }
        delete jv;
      }
      delete parser;
    }
return(0);
}
