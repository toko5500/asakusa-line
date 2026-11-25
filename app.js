 (function(){
  "use strict";
  const API="https://api-public.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:Toei&odpt:railway=odpt.Railway:Toei.Asakusa";
  const TT_BASE="https://api-public.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Toei&odpt:railway=odpt.Railway:Toei.Asakusa&odpt:calendar=odpt.Calendar:";
  const ST_TT_BASE="https://api-public.odpt.org/api/v4/odpt:StationTimetable?odpt:operator=odpt.Operator:Toei&odpt:station=odpt.Station:Toei.Asakusa.";
  const SEC=45,P="odpt.Station:Toei.Asakusa.",NISHI_ID=P+"NishiMagome",SENGA_ID=P+"Sengakuji",ASAKUSABASHI_ID=P+"Asakusabashi",OSHI_ID=P+"Oshiage";
  const SIDING_KEY="asakusa_siding_v1",TT_CACHE_KEY="asakusa_tt_cache_v2",UNIT_KEY="asakusa_unit_map_v1";
  const SIDING_ALIAS={"1637N":["1686K","1786K"]};

  const SENGA_MANUAL={
    Weekday:["05:49 514T 快特 羽田空港","05:58 576H 特急 三崎口","06:16 650SH 快特 羽田空港","06:34 682H 特急 三崎口","06:47 618C 特急 浦賀","07:11 728H 特急 三崎口","07:26 710T 急行 羽田空港","10:35 1004A 快特 三崎口","10:57 1002A 快特 京急久里浜","11:17 1114A 快特 京急久里浜","11:37 1106A 快特 京急久里浜","11:57 1108A 快特 京急久里浜","12:17 1210A 快特 京急久里浜","12:37 1212A 快特 京急久里浜","12:57 1200A 快特 京急久里浜","13:17 1302A 快特 京急久里浜","13:37 1304A 快特 三崎口","13:57 1306A 快特 京急久里浜","14:17 1408A 快特 京急久里浜","14:37 1410A 快特 京急久里浜","14:57 1412A 快特 京急久里浜","15:17 1500A 快特 京急久里浜","15:37 1502A 快特 京急久里浜","15:56 1514A 快特 京急久里浜","16:06 1626T 特急 羽田空港","16:46 1686H 急行 羽田空港","17:26 1700K 特急 京急久里浜","17:31 1754T 急行 羽田空港","19:32 1966K 急行 羽田空港","19:41 1970K 急行 羽田空港","21:00 2162H 急行 羽田空港","21:40 2186K 急行 羽田空港","22:12 2280H 急行 羽田空港","22:34 2234N 急行 羽田空港","22:59 2228H 特急 京急久里浜","23:22 2368H 特急 京急久里浜","23:41 2350H 特急 逗子・葉山","23:59 2374H 特急 金沢文庫"],
    SaturdayHoliday:["05:58 514H 急行 羽田空港","06:19 652H 急行 羽田空港","06:37 628H 急行 羽田空港","06:54 658H 特急 京急久里浜","08:20 820N 急行 羽田空港","08:45 806A 快特 三崎口","09:06 908A 快特 三崎口","09:25 910A 快特 三崎口","09:56 914A 快特 三崎口","10:17 1000A 快特 三崎口","10:37 1002A 快特 三崎口","10:57 1004A 快特 京急久里浜","11:17 1130A 快特 三崎口","11:37 1106A 快特 三崎口","11:57 1108A 快特 京急久里浜","12:17 1210A 快特 三崎口","12:37 1212A 快特 三崎口","12:57 1214A 快特 三崎口","13:17 1300A 快特 三崎口","13:37 1302A 快特 三崎口","13:57 1304A 快特 三崎口","14:17 1430A 快特 三崎口","14:37 1406A 快特 三崎口","14:57 1408A 快特 三崎口","15:17 1510A 快特 三崎口","15:37 1512A 快特 三崎口","15:57 1514A 快特 三崎口","16:17 1600A 快特 三崎口","16:37 1602A 快特 京急久里浜","16:57 1604A 快特 三崎口","17:17 1730A 快特 三崎口","17:37 1706A 快特 京急久里浜","17:57 1708A 快特 京急久里浜","18:17 1810A 快特 京急久里浜","18:37 1812A 快特 京急久里浜","18:57 1814A 快特 三崎口","19:16 1900C 特急 京急久里浜","19:37 1926H 特急 三崎口","19:56 1904C 特急 京急久里浜","20:16 2050H 特急 京急久里浜","20:36 2066H 特急 三崎口","20:56 2054H 特急 京急久里浜","21:16 2174H 特急 京急久里浜","22:07 2240T 特急 逗子・葉山","22:40 2286K 急行 羽田空港","00:08 2412T 普通 品川"]
  };
  const JP_TYPE={"普通":"odpt.TrainType:Toei.Local","急行":"odpt.TrainType:Toei.Express","特急":"odpt.TrainType:Toei.LimitedExpress","快特":"odpt.TrainType:Toei.Rapid","エアポート快特":"odpt.TrainType:Toei.AirportLimitedExpress","アクセス特急":"odpt.TrainType:Toei.AccessExpress"};

  const OPS_WD=[],OPS_HD=[];
  for(let n=1;n<=33;n+=2)OPS_WD.push(String(n).padStart(2,"0")+"T");
  for(let n=41;n<=63;n+=2)OPS_WD.push(String(n).padStart(2,"0")+"T");
  for(let n=1;n<=41;n+=2)OPS_HD.push(String(n).padStart(2,"0")+"T");

  const ST=[
    ["西馬込","NishiMagome","1・2番線 始終",1,["1番線","2番線"],["1番線","2番線"],"1・2番線","1・2番線"],
    ["馬込","Magome","",0],["中延","Nakanobu","",0],["戸越","Togoshi","",0],["五反田","Gotanda","",0],["高輪台","Takanawadai","",0],
    ["泉岳寺","Sengakuji","1-4番線+引上",1,["1番線","2番線"],["3番線","4番線"],"1・2番線・引上","3・4番線"],
    ["三田","Mita","",0],["大門","Daimon","",0],["新橋","Shimbashi","",0],["東銀座","HigashiGinza","",0],["宝町","Takaracho","",0],["日本橋","Nihombashi","",0],
    ["人形町","Ningyocho","",0],["東日本橋","HigashiNihombashi","",0],
    ["浅草橋","Asakusabashi","引上線あり",0,["1番線枠"],[],"1番線・引上",""],
    ["蔵前","Kuramae","",0],["浅草","Asakusa","",0],["本所吾妻橋","HonjoAzumabashi","",0],
    ["押上","Oshiage","1-4番線 京成直通",1,["1番線枠","2番線枠"],["3番線枠","4番線枠"],"1・2番線側","3・4番線側"]
  ].map(([name,s,note,dbl,lb,rb,lg,rg])=>({name,id:P+s,note,isDouble:!!dbl,lb,rb,lg,rg}));
  const COLS=[{start:0,end:6,top:"▲ 始点",bot:"▼ 三田方面へ",tail:1},{start:7,end:12,top:"▲ 泉岳寺から",bot:"▼ 人形町方面へ",tail:1},{start:13,end:19,top:"▲ 日本橋から",bot:"▼ 京成・北総直通",tail:0}];
  const IDX=new Map(ST.map((s,i)=>[s.id,i])),OBJ=new Map(ST.map(s=>[s.id,s]));
  const TYPES={Local:["普通","type-local"],Express:["急行","type-express"],LimitedExpress:["特急","type-limited"],Rapid:["快速","type-kaisoku"],RapidLimitedExpress:["快特","type-rapid"],AirportLimitedExpress:["エアポート快特","type-airport"],AirportRapidLimitedExpress:["エアポート快特","type-airport"],AirportRapid:["エアポート快特","type-airport"],AccessExpress:["アクセス特急","type-access"],CommuterLimitedExpress:["通勤特急","type-commuter"],EveningLiner:["イブニングライナー","type-liner"],MorningLiner:["モーニングライナー","type-liner"],Skyliner:["スカイライナー","type-liner"]};
  const NAMES={NishiMagome:"西馬込",Magome:"馬込",Nakanobu:"中延",Togoshi:"戸越",Gotanda:"五反田",Takanawadai:"高輪台",Sengakuji:"泉岳寺",Mita:"三田",Daimon:"大門",Shimbashi:"新橋",HigashiGinza:"東銀座",Takaracho:"宝町",Nihombashi:"日本橋",Ningyocho:"人形町",HigashiNihombashi:"東日本橋",Asakusabashi:"浅草橋",Kuramae:"蔵前",Asakusa:"浅草",HonjoAzumabashi:"本所吾妻橋",Oshiage:"押上",HanedaAirportTerminal1and2:"羽田空港",HanedaAirportDomesticTerminal:"羽田空港",HanedaAirportTerminal3:"羽田空港第3T",HanedaAirportInternationalTerminal:"羽田空港国際",Shinagawa:"品川",KeikyuKamata:"京急蒲田",KeikyuKawasaki:"京急川崎",KanagawaShimmachi:"神奈川新町",Yokohama:"横浜",Kamiooka:"上大岡",KanazawaBunko:"金沢文庫",KanazawaHakkei:"金沢八景",ZushiHayama:"逗子・葉山",ShinZushi:"逗子・葉山",Horinouchi:"堀ノ内",Uraga:"浦賀",KeikyuKurihama:"京急久里浜",Miurakaigan:"三浦海岸",Misakiguchi:"三崎口",KeiseiHikifune:"京成曳舟",Yotsugi:"四ツ木",KeiseiTateishi:"京成立石",Aoto:"青砥",Takasago:"京成高砂",KeiseiTakasago:"京成高砂",KeiseiYawata:"京成八幡",HigashiNakayama:"東中山",KeiseiFunabashi:"京成船橋",KeiseiTsudanuma:"京成津田沼",Yachiyodai:"八千代台",Katsutadai:"勝田台",KeiseiSakura:"京成佐倉",Sogosando:"宗吾参道",KeiseiNarita:"京成成田",NaritaAirportTerminal1:"成田空港",SANaritaAirportTerminal1:"成田空港",AirportTerminal2:"空港第2ビル",NaritaAirportTerminal2and3:"空港第2ビル",HigashiNarita:"東成田",ShibayamaChiyoda:"芝山千代田",KeiseiUeno:"京成上野",KeiseiKanamachi:"京成金町",HigashiMatsudo:"東松戸",ShinKamagaya:"新鎌ヶ谷",ChibaNewTownChuo:"千葉ニュータウン中央",InzaiMakinohara:"印西牧の原",InbaNihonIdai:"印旛日本医大",ImbaNihonIdai:"印旛日本医大"};
  const OWNERS={Toei:"東京都交通局（都営車）",Keikyu:"京浜急行電鉄（京急車）",Keisei:"京成電鉄（京成車）",Hokuso:"北総鉄道（北総車）",Shibayama:"芝山鉄道"};
  const SFX={T:"東京都交通局（都営車・末尾T）",H:"京浜急行電鉄（京急車・末尾H）",A:"京浜急行電鉄（京急車・末尾A）",C:"京浜急行電鉄（京急車・末尾C）",SH:"京浜急行電鉄（京急車・末尾SH）",K:"京成電鉄（京成車・末尾K）",N:"北総鉄道（北総車・末尾N）"};

  const $=id=>document.getElementById(id);
  const mapEl=$("routeMap"),empEl=$("emptyStateContainer"),cntEl=$("trainCountPill"),updEl=$("lastUpdated"),refBtn=$("manualRefreshBtn"),layBtn=$("layoutToggleBtn"),autoTg=$("autoRefreshToggle"),cdEl=$("countdownText"),banEl=$("statusBanner"),banMsg=$("statusBannerMsg"),retBtn=$("retryBtn"),modEl=$("trainModal"),modTit=$("modalTitle"),modList=$("modalDetailList"),modUnitEd=$("modalUnitEditor"),modAct=$("modalExtraAction"),modCls=$("modalCloseBtn");
  const unitOpenBtn=$("unitOpenBtn"),unitModalEl=$("unitModal"),unitCloseBtn=$("unitCloseBtn"),unitAutoResetChk=$("unitAutoResetChk"),unitTabWd=$("unitTabWd"),unitTabHd=$("unitTabHd"),unitFixedList=$("unitFixedList"),unitAddOp=$("unitAddOp"),unitAddCar=$("unitAddCar"),unitAddPairChk=$("unitAddPairChk"),unitAddBtn=$("unitAddBtn"),unitOtherList=$("unitOtherList"),unitOtherCount=$("unitOtherCount"),unitClearAllBtn=$("unitClearAllBtn");
  const searchOpenBtn=$("searchOpenBtn"),searchModalEl=$("searchModal"),searchCloseBtn=$("searchCloseBtn"),searchTabWd=$("searchTabWd"),searchTabHd=$("searchTabHd"),searchInp=$("searchInp"),searchClearBtn=$("searchClearBtn"),searchAllChk=$("searchAllChk"),searchInfoText=$("searchInfoText"),searchResults=$("searchResults");

  let fetching=false,autoOn=true,leftSec=SEC,lastOk=null,manLay=null,ttReady=false,ttLoading=false,lastTrains=[],hasPrevSnap=false;
  const ttByNum=new Map(),ttByCore=new Map(),nishiByOp=new Map(),nishiDepByOp=new Map(),oshiDepByOp=new Map();
  let sengaOrigins=[];const prevTrainMap=new Map();
  let sidings={sengakuji:[],asakusabashi:[]};

  function svcDateObj(){const d=new Date();if(d.getHours()<4)d.setDate(d.getDate()-1);return d}
  function svcDayStr(){const d=svcDateObj();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}
  function svcDateKey(cal){return`${svcDayStr()}_${cal}`}

  let unitData={svcDate:svcDayStr(),autoReset:true,items:{}};
  try{const u=JSON.parse(localStorage.getItem(UNIT_KEY)||"null");if(u&&typeof u==="object"&&u.items)unitData={svcDate:u.svcDate||svcDayStr(),autoReset:u.autoReset!==false,items:u.items}}catch(e){}
  function checkUnitReset(){const today=svcDayStr();if(unitData.autoReset&&unitData.svcDate!==today){unitData.items={};unitData.svcDate=today;saveUnits()}else if(unitData.svcDate!==today){unitData.svcDate=today;saveUnits()}}
  function saveUnits(){try{localStorage.setItem(UNIT_KEY,JSON.stringify(unitData))}catch(e){}}
  checkUnitReset();

  try{const sv=JSON.parse(localStorage.getItem(SIDING_KEY)||"null");if(sv&&Array.isArray(sv.sengakuji)&&Array.isArray(sv.asakusabashi))sidings=sv}catch(e){}
  const saveSidings=()=>{try{localStorage.setItem(SIDING_KEY,JSON.stringify(sidings))}catch(e){}};

  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const tail=id=>typeof id==="string"?(id.split(/[.:]/).pop()||id):"";
  const camel=t=>t?t.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g,"$1 $2"):"不明";
  const trType=id=>{const t=tail(id);return TYPES[t]?{l:TYPES[t][0],c:TYPES[t][1]}:{l:t?camel(t):"種別不明",c:"type-unknown"}};
  const trSt=id=>{if(!id)return"不明";if(/[^\x00-\x7F]/.test(id))return id;const t=tail(id);return NAMES[t]||(t?camel(t):"不明")};
  const fmtDest=f=>{if(!f)return"行先不明";const n=(Array.isArray(f)?f:[f]).map(trSt).filter(Boolean);return n.length?n.join("・"):"行先不明"};
  const matchOwnerKey=num=>String(num||"").match(/(SH|[THKNAC])[a-z]?$/i);
  const isToei=t=>{const o=t["odpt:trainOwner"]||"";if(o)return tail(o)==="Toei";const m=matchOwnerKey(t["odpt:trainNumber"]);return!!(m&&m[1].toUpperCase()==="T")};
  const ownerLbl=t=>{const o=t["odpt:trainOwner"];if(o&&OWNERS[tail(o)])return OWNERS[tail(o)];const m=matchOwnerKey(t["odpt:trainNumber"]);return m&&SFX[m[1].toUpperCase()]?SFX[m[1].toUpperCase()]:"不明（直通車両等）"};
  const dlyMin=s=>(typeof s==="number"&&s>=60)?Math.floor(s/60):0;
  const fmtTime=d=>[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":");
  const opCode=num=>{const m=String(num||"").match(/(\d{2})(SH|[THKNAC])[a-z]?$/i);return m?(m[1]+m[2].toUpperCase()):""};
  const coreNum=num=>{const m=String(num||"").match(/^(\d+)(SH|[THKNAC])/i);return m?(m[1]+m[2].toUpperCase()):String(num||"").toUpperCase()};
  const toSvcMin=hm=>{if(!hm)return null;const[h,m]=hm.split(":").map(Number);return isNaN(h)||isNaN(m)?null:(h<4?h+24:h)*60+m};
  const tsToSvcMin=ts=>{const d=new Date(ts),h=d.getHours();return(h<4?h+24:h)*60+d.getMinutes()};
  const nowSvcMin=()=>{const h=new Date().getHours();return(h<4?h+24:h)*60+new Date().getMinutes()};
  const hasSt=(f,slug)=>Array.isArray(f)?f.some(x=>tail(x)===slug):tail(f)===slug;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const fmtHmStr=hm=>{if(!/^\d{3,4}$/.test(hm))return"";const s=hm.padStart(4,"0");return s.slice(0,2)+":"+s.slice(2,4)};

  function normOpInput(raw){
    const s=String(raw||"").trim().toUpperCase().replace(/[Ａ-Ｚ０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0));
    if(!s)return"";if(/^\d{1,2}$/.test(s))return s.padStart(2,"0")+"T";
    const op=opCode(s);if(op)return op;
    const m=s.match(/^(\d{1})(SH|[THKNAC])$/);if(m)return"0"+m[1]+m[2];
    return s;
  }
  function pairOpKey(op){const m=String(op||"").match(/^(\d{2})(SH|[THKNAC])$/i);if(!m)return"";const n=parseInt(m[1],10);return String((n%2===1)?n-1:n+1).padStart(2,"0")+m[2].toUpperCase()}
  function minusOneOpKey(op){const m=String(op||"").match(/^(\d{2})(SH|[THKNAC])$/i);if(!m)return"";const n=parseInt(m[1],10);return n>0?String(n-1).padStart(2,"0")+m[2].toUpperCase():""}
  function oddOpKey(op){const m=String(op||"").match(/^(\d{2})T$/i);if(!m)return op;const n=parseInt(m[1],10);return(n%2===0?String(n+1).padStart(2,"0"):m[1])+"T"}
  function findUnitEntry(trainNum){
    checkUnitReset();const op=opCode(trainNum);if(!op)return null;
    if(unitData.items[op])return{key:op,car:unitData.items[op].car,pair:unitData.items[op].pair};
    const pOp=pairOpKey(op);if(pOp&&unitData.items[pOp]&&unitData.items[pOp].pair)return{key:pOp,car:unitData.items[pOp].car,pair:true};
    return null;
  }
  function setUnitEntry(rawOp,carText,pair){
    checkUnitReset();const op=normOpInput(rawOp),car=String(carText||"").trim();if(!op)return;
    if(!car)delete unitData.items[op];else unitData.items[op]={car,pair:!!pair};saveUnits();
  }

  function parseTrainParts(num){const m=coreNum(num).match(/^(\d{1,2})(\d{2})(SH|[THKNAC])$/i);return m?{h:parseInt(m[1],10),op:parseInt(m[2],10),sfx:m[3].toUpperCase()}:null}
  function returnCands(origNum){
    const cands=[],cn=coreNum(origNum);
    if(SIDING_ALIAS[cn])SIDING_ALIAS[cn].forEach(a=>cands.push(a.toUpperCase()));
    const pt=parseTrainParts(origNum);
    if(pt&&pt.op>0){
      const op2=String(pt.op-1).padStart(2,"0");
      cands.push(`${pt.h}${op2}${pt.sfx}`);if(pt.h<10)cands.push(`0${pt.h}${op2}${pt.sfx}`);
      const nh=pt.h+1;cands.push(`${nh}${op2}${pt.sfx}`);if(nh<10)cands.push(`0${nh}${op2}${pt.sfx}`);
      if(nh===24)cands.push(`00${op2}${pt.sfx}`);
    }
    return Array.from(new Set(cands));
  }
  function pickExpectedNum(origNum){const c=returnCands(origNum);if(!c.length)return"---";if(SIDING_ALIAS[coreNum(origNum)])return c[0];if(ttReady){const h=c.find(x=>ttByCore.has(x));if(h)return h}return c[0]}
  function sidingMatchesSouth(origNum,southCoreSet){return returnCands(origNum).some(c=>southCoreSet.has(c))}
  function sidingMatchesPre(sidingOrigNum,preNum){
    const cands=returnCands(sidingOrigNum),sOp=opCode(sidingOrigNum),pCore=coreNum(preNum),pOp=opCode(preNum);
    return cands.includes(pCore)||(sOp&&pOp&&(sOp===pOp||pairOpKey(sOp)===pOp||minusOneOpKey(sOp)===pOp));
  }

  function guessCal(){
    const d=svcDateObj(),w=d.getDay(),m=d.getMonth()+1,dt=d.getDate(),y=d.getFullYear();
    if(w===0||w===6)return"SaturdayHoliday";
    if([[1,1],[2,11],[2,23],[4,29],[5,3],[5,4],[5,5],[8,11],[11,3],[11,23]].some(([a,b])=>a===m&&b===dt))return"SaturdayHoliday";
    if([1,7,9,10].some((mo,i)=>m===mo&&w===1&&Math.ceil(dt/7)===[2,3,3,2][i]))return"SaturdayHoliday";
    const ve=Math.floor(20.8431+.242194*(y-1980)-Math.floor((y-1980)/4)),au=Math.floor(23.2488+.242194*(y-1980)-Math.floor((y-1980)/4));
    return((m===3&&dt===ve)||(m===9&&dt===au))?"SaturdayHoliday":"Weekday";
  }

  let unitCal=guessCal(),searchCal=guessCal();

  function addDepOp(map,op,num,time){if(!op||!time)return;if(!map.has(op))map.set(op,[]);const l=map.get(op);if(!l.some(x=>x.time===time&&coreNum(x.num)===coreNum(num)))l.push({num,time,min:toSvcMin(time)})}
  function buildManualSenga(cal,sengaMap){
    (SENGA_MANUAL[cal]||[]).forEach(line=>{
      const parts=line.trim().split(/[\s\u3000]+/);if(parts.length<4)return;
      const[dep,num,tpName,dest]=parts;
      sengaMap.set(coreNum(num)+"_"+dep,{num,depTime:dep,depMin:toSvcMin(dep),trainType:JP_TYPE[tpName]||"odpt.TrainType:Toei.Local",dest:[dest],origin:[SENGA_ID],targetTrack:1,isManual:true});
    });
  }
  function ingestTrainTimetableArray(arr,sengaMap){
    arr.forEach(tt=>{
      const num=tt["odpt:trainNumber"];if(!num)return;
      const objs=Array.isArray(tt["odpt:trainTimetableObject"])?tt["odpt:trainTimetableObject"]:[];
      const orig=tt["odpt:originStation"]||(objs[0]&&objs[0]["odpt:departureStation"]?[objs[0]["odpt:departureStation"]]:null);
      let na=null,nd=null,od=null,sd=null;
      for(const o of objs){
        if(!na&&o["odpt:arrivalStation"]===NISHI_ID&&(o["odpt:arrivalTime"]||o["odpt:departureTime"]))na=o["odpt:arrivalTime"]||o["odpt:departureTime"];
        if(!nd&&o["odpt:departureStation"]===NISHI_ID&&(o["odpt:departureTime"]||o["odpt:arrivalTime"]))nd=o["odpt:departureTime"]||o["odpt:arrivalTime"];
        if(!od&&o["odpt:departureStation"]===OSHI_ID&&(o["odpt:departureTime"]||o["odpt:arrivalTime"]))od=o["odpt:departureTime"]||o["odpt:arrivalTime"];
        if(!sd&&o["odpt:departureStation"]===SENGA_ID&&(o["odpt:departureTime"]||o["odpt:arrivalTime"]))sd=o["odpt:departureTime"]||o["odpt:arrivalTime"];
      }
      const rec={num,origin:orig,na,nm:toSvcMin(na),nd,ndm:toSvcMin(nd),od,odm:toSvcMin(od)};
      ttByNum.set(num,rec);const cn=coreNum(num);
      if(cn){if(!ttByCore.has(cn))ttByCore.set(cn,[]);const cl=ttByCore.get(cn);if(!cl.some(x=>x.num===num&&x.na===na&&x.nd===nd))cl.push(rec)}
      const op=opCode(num);
      if(op){
        if(na){if(!nishiByOp.has(op))nishiByOp.set(op,[]);const nl=nishiByOp.get(op);if(!nl.some(x=>x.time===na&&coreNum(x.num)===cn))nl.push({num,time:na,min:toSvcMin(na)})}
        if(nd)addDepOp(nishiDepByOp,op,num,nd);if(od)addDepOp(oshiDepByOp,op,num,od);
      }
      const dirStr=tt["odpt:railDirection"]||"";
      if(sd&&dirStr.includes("Southbound")&&hasSt(orig,"Sengakuji")){
        const dst=tt["odpt:destinationStation"],k=cn+"_"+sd;
        if(!sengaMap.has(k))sengaMap.set(k,{num,depTime:sd,depMin:toSvcMin(sd),trainType:tt["odpt:trainType"],dest:dst,origin:orig,targetTrack:hasSt(dst,"NishiMagome")?2:1});
      }
    });
  }
  function ingestStationTimetableArray(arr,cal,mode,sengaMap){
    arr.forEach(stObj=>{
      const calId=stObj["odpt:calendar"]||"",dirStr=stObj["odpt:railDirection"]||"";if(!calId.includes(cal))return;
      const list=Array.isArray(stObj["odpt:stationTimetableObject"])?stObj["odpt:stationTimetableObject"]:[];
      list.forEach(o=>{
        const dep=o["odpt:departureTime"],num=o["odpt:trainNumber"]||"";if(!dep||!num)return;
        const cn=coreNum(num),op=opCode(num);
        if(mode==="senga"&&dirStr.includes("Southbound")&&o["odpt:isOrigin"]){
          const k=cn+"_"+dep;if(!sengaMap.has(k)){const dst=o["odpt:destinationStation"];sengaMap.set(k,{num,depTime:dep,depMin:toSvcMin(dep),trainType:o["odpt:trainType"],dest:dst,origin:[SENGA_ID],targetTrack:hasSt(dst,"NishiMagome")?2:1})}
        }else if(mode==="nishi"&&dirStr.includes("Northbound")){
          addDepOp(nishiDepByOp,op,num,dep);const dm=toSvcMin(dep);
          if(!ttByNum.has(num))ttByNum.set(num,{num,origin:[NISHI_ID],na:null,nm:null,nd:dep,ndm:dm,od:null,odm:null});else if(!ttByNum.get(num).nd){ttByNum.get(num).nd=dep;ttByNum.get(num).ndm=dm}
          if(cn&&!ttByCore.has(cn))ttByCore.set(cn,[{num,origin:[NISHI_ID],na:null,nm:null,nd:dep,ndm:dm,od:null,odm:null}]);
        }else if(mode==="oshi"&&dirStr.includes("Southbound")){
          addDepOp(oshiDepByOp,op,num,dep);const dm=toSvcMin(dep);
          if(!ttByNum.has(num))ttByNum.set(num,{num,origin:null,na:null,nm:null,nd:null,ndm:null,od:dep,odm:dm});else if(!ttByNum.get(num).od){ttByNum.get(num).od=dep;ttByNum.get(num).odm=dm}
          if(cn&&!ttByCore.has(cn))ttByCore.set(cn,[{num,origin:null,na:null,nm:null,nd:null,ndm:null,od:dep,odm:dm}]);
        }
      });
    });
  }
  function finalizeTT(sengaMap){
    nishiByOp.forEach(l=>l.sort((a,b)=>a.min-b.min));nishiDepByOp.forEach(l=>l.sort((a,b)=>a.min-b.min));oshiDepByOp.forEach(l=>l.sort((a,b)=>a.min-b.min));
    sengaOrigins=Array.from(sengaMap.values()).sort((a,b)=>a.depMin-b.depMin);
  }
  async function safeFetchJson(url){try{const r=await fetch(url,{headers:{Accept:"application/json"}});if(!r.ok)return null;const d=await r.json();return Array.isArray(d)?d:null}catch(e){return null}}

  async function loadTT(cal){
    if(ttLoading)return false;ttLoading=true;
    const sengaMap=new Map();buildManualSenga(cal,sengaMap);sengaOrigins=Array.from(sengaMap.values()).sort((a,b)=>a.depMin-b.depMin);
    const cKey=svcDateKey(cal);
    try{
      const cached=JSON.parse(localStorage.getItem(TT_CACHE_KEY)||"null");
      if(cached&&cached.key===cKey&&(Date.now()-(cached.savedAt||0)<14400000)&&Array.isArray(cached.recs)&&cached.recs.length>50){
        ttByNum.clear();ttByCore.clear();nishiByOp.clear();nishiDepByOp.clear();oshiDepByOp.clear();
        cached.recs.forEach(rec=>{
          ttByNum.set(rec.num,rec);const cn=coreNum(rec.num);if(cn){if(!ttByCore.has(cn))ttByCore.set(cn,[]);ttByCore.get(cn).push(rec)}
          const op=opCode(rec.num);if(op){if(rec.na){if(!nishiByOp.has(op))nishiByOp.set(op,[]);nishiByOp.get(op).push({num:rec.num,time:rec.na,min:rec.nm})}if(rec.nd)addDepOp(nishiDepByOp,op,rec.num,rec.nd);if(rec.od)addDepOp(oshiDepByOp,op,rec.num,rec.od)}
        });
        if(Array.isArray(cached.senga))cached.senga.forEach(x=>{const k=coreNum(x.num)+"_"+x.depTime;if(!sengaMap.has(k))sengaMap.set(k,x)});
        finalizeTT(sengaMap);ttReady=true;ttLoading=false;return true;
      }
    }catch(e){}
    try{
      const mainArr=await safeFetchJson(TT_BASE+cal);if(!mainArr||mainArr.length===0){ttLoading=false;return false}
      ttByNum.clear();ttByCore.clear();nishiByOp.clear();nishiDepByOp.clear();oshiDepByOp.clear();
      ingestTrainTimetableArray(mainArr,sengaMap);
      if(mainArr.length>=999){
        await sleep(250);const sb=await safeFetchJson(TT_BASE+cal+"&odpt:railDirection=odpt.RailDirection:Southbound");if(sb)ingestTrainTimetableArray(sb,sengaMap);
        await sleep(250);const nb=await safeFetchJson(TT_BASE+cal+"&odpt:railDirection=odpt.RailDirection:Northbound");if(nb)ingestTrainTimetableArray(nb,sengaMap);
      }
      await sleep(200);const stS=await safeFetchJson(ST_TT_BASE+"Sengakuji");if(stS)ingestStationTimetableArray(stS,cal,"senga",sengaMap);
      await sleep(200);const stN=await safeFetchJson(ST_TT_BASE+"NishiMagome");if(stN)ingestStationTimetableArray(stN,cal,"nishi",sengaMap);
      await sleep(200);const stO=await safeFetchJson(ST_TT_BASE+"Oshiage");if(stO)ingestStationTimetableArray(stO,cal,"oshi",sengaMap);
      finalizeTT(sengaMap);ttReady=true;
      try{const recs=Array.from(ttByNum.values());if(recs.length>50)localStorage.setItem(TT_CACHE_KEY,JSON.stringify({key:cKey,savedAt:Date.now(),recs,senga:Array.from(sengaMap.values()).filter(x=>!x.isManual)}))}catch(e){}
      return true;
    }catch(e){return false}finally{ttLoading=false}
  }

  function findTT(num){if(!num)return null;if(ttByNum.has(num))return ttByNum.get(num);const l=ttByCore.get(coreNum(num));return(l&&l.length)?l[0]:null}
  function nextNishi(t){
    if(!ttReady)return{text:"...",train:null,none:true};
    const num=t["odpt:trainNumber"]||"",nowM=nowSvcMin(),cn=coreNum(num),destIsNishi=hasSt(t["odpt:destinationStation"],"NishiMagome"),dir=dirOf(t);
    if(destIsNishi){const cur=findTT(num);if(cur&&cur.na&&cur.nm>=nowM-45)return{text:cur.na,train:cur.num||num,none:false}}
    const op=opCode(num);
    if(op&&nishiByOp.has(op)){
      const minGap=(dir==="south"&&!destIsNishi)?25:(destIsNishi?-3:15);
      const hit=nishiByOp.get(op).find(x=>x.min>=nowM+minGap&&(destIsNishi||coreNum(x.num)!==cn));
      if(hit)return{text:hit.time,train:hit.num,none:false};
    }
    return{text:"-",train:null,none:true};
  }
  function stDeparture(t,which,dir){
    if(!ttReady)return null;
    const num=t["odpt:trainNumber"]||"",nowM=nowSvcMin(),isDep=(which==="nishi"&&dir==="north")||(which==="oshi"&&dir==="south");
    if(isDep){
      const cur=ttByNum.get(num);
      if(which==="nishi"&&cur&&cur.nd)return{time:cur.nd,train:num};
      if(which==="oshi"&&cur&&cur.od)return{time:cur.od,train:num};
      const coreList=ttByCore.get(coreNum(num));
      if(coreList){const m=coreList.find(x=>which==="nishi"?x.nd:x.od);if(m)return{time:which==="nishi"?m.nd:m.od,train:m.num}}
    }
    const op=opCode(num),map=which==="nishi"?nishiDepByOp:oshiDepByOp;
    const opCands=isDep?[op]:Array.from(new Set([pairOpKey(op),op,minusOneOpKey(op)].filter(Boolean)));
    for(const cop of opCands){
      if(!map.has(cop))continue;
      const list=map.get(cop);
      const future=list.find(x=>x.min>=nowM-5&&x.min<=nowM+50);if(future)return{time:future.time,train:future.num};
      if(isDep){const delayed=[...list].reverse().find(x=>x.min>=nowM-25&&x.min<nowM-5);if(delayed)return{time:delayed.time,train:delayed.num}}
    }
    if(which==="nishi"&&!isDep&&window.NISHI_T2){
      const cal=guessCal(),t2List=window.NISHI_T2[cal]||[];
      for(const cop of opCands){
        const hit=t2List.find(x=>opCode(x.num)===cop&&x.min>=nowM-3&&x.min<=nowM+40);
        if(hit)return{time:hit.time,train:hit.num};
      }
    }
    return null;
  }
  function originOf(t){if(t["odpt:originStation"]&&t["odpt:originStation"].length)return t["odpt:originStation"];if(t["odpt:startingStation"]&&t["odpt:startingStation"].length)return t["odpt:startingStation"];const c=findTT(t["odpt:trainNumber"]||"");return c?c.origin:null}
  function sengaTrack(t,dir){if(dir==="south")return hasSt(t["odpt:destinationStation"],"NishiMagome")?2:1;return hasSt(originOf(t),"NishiMagome")?3:4}

  function matchNishiT2(targetNum,depTimeStr){
    const cal=guessCal(),t2List=(window.NISHI_T2&&window.NISHI_T2[cal])?window.NISHI_T2[cal]:[];
    if(!t2List.length)return null;
    const up=String(targetNum||"").toUpperCase(),cn=coreNum(up);
    if(up&&t2List.some(x=>x.num===up))return 2;
    const matches=cn?t2List.filter(x=>x.core===cn):[];
    if(matches.length){
      const dMin=depTimeStr?toSvcMin(depTimeStr):null;
      if(dMin===null&&matches.length===1)return 2;
      if(dMin!==null&&matches.some(x=>Math.abs(x.min-dMin)<=15))return 2;
    }
    if(depTimeStr&&t2List.some(x=>x.time===depTimeStr))return 2;
    return 1;
  }

  function nishiTrack(t,dir){
    let targetNum="",dep=stDeparture(t,"nishi",dir);
    if(dir==="north"){targetNum=t["odpt:trainNumber"]||""}
    else{if(dep&&dep.train)targetNum=dep.train;else return null}
    return matchNishiT2(targetNum,dep?dep.time:null);
  }

  function nishiArrivalPlan(t){
    const num=t["odpt:trainNumber"]||"",cn=coreNum(num),cal=guessCal(),toei=isToei(t);
    if(toei&&window.UNYO_DATA&&window.UNYO_DATA[cal]){
      const oddOp=oddOpKey(opCode(num)),legs=window.UNYO_DATA[cal][oddOp]||[];
      if(legs.length){
        const nowM=nowSvcMin();
        let idx=legs.findIndex(x=>coreNum(x.num)===cn&&x.to==="西馬込");
        if(idx<0)idx=legs.findIndex(x=>x.to==="西馬込"&&x.aMin!==null&&Math.abs(x.aMin-(nowM+6))<=35);
        if(idx>=0){
          const curLg=legs[idx],nextLg=legs[idx+1];
          if(!nextLg||nextLg.isRep||nextLg.from!=="西馬込")return{isDepot:true,track:null,nextTrain:null,nextTime:null};
          if(curLg.aMin!==null&&nextLg.dMin!==null&&(nextLg.dMin-curLg.aMin)>50)return{isDepot:true,track:null,nextTrain:null,nextTime:null};
          const nTime=fmtHmStr(nextLg.dep),trk=matchNishiT2(nextLg.num,nTime)||1;
          return{isDepot:false,track:trk,nextTrain:nextLg.num,nextTime:nTime};
        }
      }
    }
    const dep=stDeparture(t,"nishi","south");
    if(dep&&dep.train){
      const trk=matchNishiT2(dep.train,dep.time)||1;
      return{isDepot:false,track:trk,nextTrain:dep.train,nextTime:dep.time};
    }
    if(toei&&ttReady)return{isDepot:true,track:null,nextTrain:null,nextTime:null};
    return null;
  }

  function isAfterNakanobuSouth(t,dir){
    if(dir!=="south")return false;
    const fi=IDX.get(t["odpt:fromStation"]),ti=t["odpt:toStation"]?IDX.get(t["odpt:toStation"]):undefined;
    return(fi!==undefined&&fi<=2)&&(ti===undefined||ti<=2);
  }

  function dirOf(t){const d=t["odpt:railDirection"]||"";if(d.includes("Northbound"))return"north";if(d.includes("Southbound"))return"south";const fi=IDX.get(t["odpt:fromStation"]),ti=IDX.get(t["odpt:toStation"]);return(fi!==undefined&&ti!==undefined)?(ti>fi?"north":"south"):"north"}

  function updateSidings(currTrains){
    const now=Date.now(),nowM=nowSvcMin();
    sidings.sengakuji=sidings.sengakuji.filter(s=>now-s.enteredAt<3600000);
    sidings.asakusabashi=sidings.asakusabashi.filter(s=>now-s.enteredAt<3600000);
    const currCores=new Set(),southCores=new Set(),southOps=new Set(),newSengaOrigs=[],newAsakusaOrigs=[];
    currTrains.forEach(t=>{
      const num=t["odpt:trainNumber"]||"",cn=num?coreNum(num):"";
      if(cn)currCores.add(cn);
      if(dirOf(t)==="south"&&num){
        southCores.add(cn);const op=opCode(num);if(op)southOps.add(op);
        if(hasPrevSnap&&cn&&!prevTrainMap.has(cn)){
          const orig=originOf(t);
          if(hasSt(orig,"Sengakuji"))newSengaOrigs.push(cn);else if(hasSt(orig,"Asakusabashi"))newAsakusaOrigs.push(cn);
        }
      }
    });

    // 1番線始発(京急方面行き)の発車時刻を過ぎていたら自動消去（取り残し防止）
    const depPre1=sengaOrigins.filter(x=>x.targetTrack===1);
    const keepSenga=s=>{
      if(sidingMatchesSouth(s.origNum,southCores))return false;
      const op=opCode(s.origNum);if(op&&southOps.has(op))return false;
      const entM=tsToSvcMin(s.enteredAt);
      const departed1=depPre1.some(p=>sidingMatchesPre(s.origNum,p.num)&&p.depMin>=entM-15&&nowM>p.depMin+1);
      if(departed1)return false;
      return true;
    };
    const keepAsakusa=s=>{
      if(sidingMatchesSouth(s.origNum,southCores))return false;
      const op=opCode(s.origNum);if(op&&southOps.has(op))return false;
      return true;
    };
    sidings.sengakuji=sidings.sengakuji.filter(keepSenga);
    sidings.asakusabashi=sidings.asakusabashi.filter(keepAsakusa);

    if(newSengaOrigs.length&&sidings.sengakuji.length)newSengaOrigs.forEach(()=>{if(sidings.sengakuji.length)sidings.sengakuji.shift()});
    if(newAsakusaOrigs.length&&sidings.asakusabashi.length)newAsakusaOrigs.forEach(()=>{if(sidings.asakusabashi.length)sidings.asakusabashi.shift()});

    if(hasPrevSnap){
      prevTrainMap.forEach((prev,cNum)=>{
        if(currCores.has(cNum))return;const op=opCode(prev.num);if(sidingMatchesSouth(prev.num,southCores)||(op&&southOps.has(op)))return;
        const dst=prev.train["odpt:destinationStation"],fromId=prev.train["odpt:fromStation"],toId=prev.train["odpt:toStation"];
        const nearSenga=fromId===SENGA_ID||toId===SENGA_ID||fromId===P+"Mita",nearAsakusa=fromId===ASAKUSABASHI_ID||toId===ASAKUSABASHI_ID||fromId===P+"HigashiNihombashi";
        if(hasSt(dst,"Sengakuji")&&nearSenga){if(!sidings.sengakuji.some(x=>coreNum(x.origNum)===cNum))sidings.sengakuji.push({id:"s_"+now+"_"+cNum,origNum:prev.num,expNum:pickExpectedNum(prev.num),train:prev.train,enteredAt:now})}
        else if(hasSt(dst,"Asakusabashi")&&nearAsakusa){if(!sidings.asakusabashi.some(x=>coreNum(x.origNum)===cNum))sidings.asakusabashi.push({id:"a_"+now+"_"+cNum,origNum:prev.num,expNum:pickExpectedNum(prev.num),train:prev.train,enteredAt:now})}
      });
    }
    prevTrainMap.clear();currTrains.forEach(t=>{const num=t["odpt:trainNumber"]||"";if(num)prevTrainMap.set(coreNum(num),{num,train:t})});
    hasPrevSnap=true;saveSidings();
  }

  function activeSengaPreTrains(currTrains){
    if(!sengaOrigins.length)return[];
    const nowM=nowSvcMin(),activeNums=new Set(),activeSengaOps=new Set();
    currTrains.forEach(t=>{const num=t["odpt:trainNumber"]||"";if(num)activeNums.add(coreNum(num));if(dirOf(t)==="south"&&(t["odpt:fromStation"]===SENGA_ID||t["odpt:fromStation"]===P+"Takanawadai"||t["odpt:fromStation"]===P+"NishiMagome")){const op=opCode(num);if(op)activeSengaOps.add(op)}});
    return sengaOrigins.filter(x=>{if(nowM<x.depMin-5||nowM>x.depMin+1)return false;if(activeNums.has(coreNum(x.num)))return false;const op=opCode(x.num);if(op&&activeSengaOps.has(op))return false;return true});
  }

  function applyLay(){const u=manLay!==null?manLay:(window.innerWidth>=740);document.body.classList.toggle("is-3col",u);layBtn.textContent=u?"1列":"3列"}
  layBtn.addEventListener("click",()=>{manLay=!document.body.classList.contains("is-3col");applyLay()});
  window.addEventListener("resize",()=>{if(manLay===null)applyLay()});

  function unitPillHtml(trainNum){const u=findUnitEntry(trainNum);return u?`<span class="unit-badge">${esc(u.car)}</span>`:""}

  function badge(t,dir,run,trk,stId){
    const tp=trType(t["odpt:trainType"]),dst=fmtDest(t["odpt:destinationStation"]),num=t["odpt:trainNumber"]||"---",dm=dlyMin(t["odpt:delay"]),toei=isToei(t);
    let etaHtml="";
    if(!run&&stId===NISHI_ID){const dep=stDeparture(t,"nishi",dir);if(dep)etaHtml=`<span class="dep-eta">西${esc(dep.time)}発</span>`}
    else if(!run&&stId===OSHI_ID){const ni=nextNishi(t),dep=stDeparture(t,"oshi",dir);etaHtml=`<span class="eta-group">${dep?`<span class="dep-eta">押${esc(dep.time)}発</span>`:""}<span class="nishi-eta${ni.none?" none":""}">西 ${esc(ni.text)}</span></span>`}
    else{const ni=nextNishi(t);etaHtml=`<span class="nishi-eta${ni.none?" none":""}">西 ${esc(ni.text)}</span>`}

    let planChip="";
    if(isAfterNakanobuSouth(t,dir)){
      const plan=nishiArrivalPlan(t);
      if(plan){
        if(plan.isDepot)planChip=`<span class="track-num-chip" style="color:#FBBF24;background:rgba(245,158,11,.18);border-color:rgba(245,158,11,.45)">入庫予定</span>`;
        else if(stId!==NISHI_ID&&plan.track)planChip=`<span class="track-num-chip">${plan.track}番線予定</span>`;
      }
    }

    const b=document.createElement("button");b.type="button";
    b.className=`train-badge ${run?"is-running":"is-stopped"} ${toei?"is-toei":"is-other"}`;
    b.innerHTML=`<div class="badge-row-top"><span class="train-type-chip ${esc(tp.c)}">${esc(tp.l)}</span><span class="train-num-badge">${esc(num)}</span>${unitPillHtml(num)}</div>`+
      `<div class="badge-row-mid"><span class="dest-wrap"><span class="dir-arrow ${dir}">${dir==="north"?"↓":"↑"}</span><span class="dest-name">${esc(dst)}行</span></span>${etaHtml}</div>`+
      `<div class="badge-row-bottom"><div class="status-chips"><span class="state-label ${run?"running":""}">${run?"走行中":"停車中"}</span>${trk?`<span class="track-num-chip">${trk}番線</span>`:""}${planChip}${toei?'<span class="toei-owner-chip">都営車</span>':""}</div>${dm>0?`<span class="delay-tag">+${dm}分</span>`:""}</div>`;
    b.addEventListener("click",()=>openMod(t,dir,run,trk,null,null,stId));
    return b;
  }

  function sidingBadge(s,stName,stKey,preMatch,waitTrack){
    const t=s.train,toei=isToei(t),tp=preMatch?trType(preMatch.trainType):trType(t["odpt:trainType"]);
    const dispExp=pickExpectedNum(s.origNum),numDisp=preMatch?preMatch.num:s.origNum;
    const dstHtml=preMatch?`<span class="dest-name">${esc(fmtDest(preMatch.dest))}行</span>`:`<span class="dest-name">折返待(${esc(dispExp)})</span>`;
    const etaHtml=preMatch?`<span class="dep-eta">始${esc(preMatch.depTime)}発</span>`:"";
    const stateLabel=waitTrack?`引き上げ線（${waitTrack}番線待）`:"引き上げ線";
    const b=document.createElement("button");b.type="button";
    b.className=`train-badge is-siding ${toei?"is-toei":"is-other"}`;
    b.innerHTML=`<div class="badge-row-top"><span class="train-type-chip ${esc(tp.c)}">${preMatch?esc(tp.l):"引上"}</span><span class="train-num-badge">${esc(numDisp)}</span>${unitPillHtml(numDisp)||unitPillHtml(s.origNum)}</div>`+
      `<div class="badge-row-mid"><span class="dest-wrap"><span class="dir-arrow south">${preMatch?"↑":"⇄"}</span>${dstHtml}</span>${etaHtml}</div>`+
      `<div class="badge-row-bottom"><div class="status-chips"><span class="state-label siding">${stateLabel}</span>${toei?'<span class="toei-owner-chip">都営車</span>':""}</div></div>`;
    b.addEventListener("click",()=>openMod(preMatch?{"odpt:trainType":preMatch.trainType,"odpt:destinationStation":preMatch.dest,"odpt:trainNumber":preMatch.num,"odpt:originStation":preMatch.origin,"odpt:fromStation":SENGA_ID}:t,"south",false,null,{stName,stKey,siding:s},preMatch||null,SENGA_ID));
    return b;
  }

  function preBadge(p,inSiding){
    const tp=trType(p.trainType),dst=fmtDest(p.dest),toei=isToei({"odpt:trainNumber":p.num});
    const b=document.createElement("button");b.type="button";
    b.className=`train-badge ${inSiding?"is-siding":"is-pre"} ${toei?"is-toei":"is-other"}`;
    const stateCls=inSiding?"siding":"pre",stateTxt=inSiding?`引き上げ線（${p.targetTrack}番線待）`:"始発予定",trkChip=inSiding?"":`<span class="track-num-chip">${p.targetTrack}番線</span>`;
    b.innerHTML=`<div class="badge-row-top"><span class="train-type-chip ${esc(tp.c)}">${esc(tp.l)}</span><span class="train-num-badge">${esc(p.num)}</span>${unitPillHtml(p.num)}</div>`+
      `<div class="badge-row-mid"><span class="dest-wrap"><span class="dir-arrow south">↑</span><span class="dest-name">${esc(dst)}行</span></span><span class="dep-eta">始${esc(p.depTime)}発</span></div>`+
      `<div class="badge-row-bottom"><div class="status-chips"><span class="state-label ${stateCls}">${stateTxt}</span>${trkChip}${toei?'<span class="toei-owner-chip">都営車</span>':""}</div></div>`;
    b.addEventListener("click",()=>openMod({"odpt:trainType":p.trainType,"odpt:destinationStation":p.dest,"odpt:trainNumber":p.num,"odpt:originStation":p.origin,"odpt:fromStation":SENGA_ID},"south",false,inSiding?null:p.targetTrack,null,p,SENGA_ID));
    return b;
  }

  function addSlots(el,items,dir,bays,guide,stId){
    const g=document.createElement("div");g.className="bay-guide";g.textContent=guide;el.appendChild(g);
    items.forEach(x=>el.appendChild(badge(x.t,dir,false,null,stId)));
    for(let i=items.length;i<2;i++){const d=document.createElement("div");d.className="empty-bay-slot";d.textContent=`${bays[i]}（空き）`;el.appendChild(d)}
  }

  function addNishiSide(el,items,dir,guide){
    const g=document.createElement("div");g.className="bay-guide";g.textContent=guide;el.appendChild(g);
    const l1=[],l2=[],unk=[];
    items.forEach(x=>{const tr=nishiTrack(x.t,dir);if(tr===1)l1.push(x);else if(tr===2)l2.push(x);else unk.push(x)});
    unk.forEach(x=>{if(!l1.length)l1.push(x);else l2.push(x)});
    if(l1.length)l1.forEach(x=>el.appendChild(badge(x.t,dir,false,1,NISHI_ID)));else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="1番線（空き）";el.appendChild(d)}
    if(l2.length)l2.forEach(x=>el.appendChild(badge(x.t,dir,false,2,NISHI_ID)));else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="2番線（空き）";el.appendChild(d)}
  }

  function addSengaSouth(el,items,preList,guide,allTrains){
    const g=document.createElement("div");g.className="bay-guide";g.textContent=guide;el.appendChild(g);
    const l1=[],l2=[];items.forEach(x=>{if(sengaTrack(x.t,"south")===1)l1.push(x);else l2.push(x)});
    const pre1=preList.filter(p=>p.targetTrack===1),pre2=preList.filter(p=>p.targetTrack===2);

    // 三田〜泉岳寺間に西馬込行きの先発列車が走行中なら2番線へのフライング遷移を防ぐ
    const approachingTrack2=allTrains.some(t=>dirOf(t)==="south"&&hasSt(t["odpt:destinationStation"],"NishiMagome")&&t["odpt:fromStation"]===P+"Mita"&&t["odpt:toStation"]===SENGA_ID);
    const track1Busy=l1.length>0,track2Busy=l2.length>0||approachingTrack2;

    const usedPre1=new Set(),usedPre2=new Set(),sidingNodes=[];
    sidings.sengakuji.forEach(s=>{
      const m1=pre1.find(p=>sidingMatchesPre(s.origNum,p.num));
      const m2=m1?null:pre2.find(p=>sidingMatchesPre(s.origNum,p.num));
      if(m1){
        usedPre1.add(m1);
        if(track1Busy)sidingNodes.push(sidingBadge(s,"泉岳寺","sengakuji",m1,1));
      }else if(m2){
        usedPre2.add(m2);
        if(track2Busy)sidingNodes.push(sidingBadge(s,"泉岳寺","sengakuji",m2,2));
      }else{
        sidingNodes.push(sidingBadge(s,"泉岳寺","sengakuji",null,null));
      }
    });

    const remainPre1=pre1.filter(p=>!usedPre1.has(p));
    if(track1Busy){l1.forEach(x=>el.appendChild(badge(x.t,"south",false,1,SENGA_ID)));remainPre1.forEach(p=>sidingNodes.push(preBadge(p,true)))}
    else if(pre1.length)pre1.forEach(p=>el.appendChild(preBadge(p,false)));
    else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="1番線（空き）";el.appendChild(d)}

    const remainPre2=pre2.filter(p=>!usedPre2.has(p));
    if(l2.length){l2.forEach(x=>el.appendChild(badge(x.t,"south",false,2,SENGA_ID)));remainPre2.forEach(p=>sidingNodes.push(preBadge(p,true)))}
    else if(approachingTrack2){const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="2番線（間もなく到着）";el.appendChild(d);remainPre2.forEach(p=>sidingNodes.push(preBadge(p,true)))}
    else if(pre2.length)pre2.forEach(p=>el.appendChild(preBadge(p,false)));
    else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="2番線（空き）";el.appendChild(d)}

    if(sidingNodes.length)sidingNodes.forEach(n=>el.appendChild(n));
    else{const d=document.createElement("div");d.className="empty-bay-slot siding";d.textContent="引き上げ線（空き）";el.appendChild(d)}
  }

  function addSengaNorth(el,items,guide){
    const g=document.createElement("div");g.className="bay-guide";g.textContent=guide;el.appendChild(g);
    const l3=[],l4=[];items.forEach(x=>{if(sengaTrack(x.t,"north")===3)l3.push(x);else l4.push(x)});
    if(l3.length)l3.forEach(x=>el.appendChild(badge(x.t,"north",false,3,SENGA_ID)));else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="3番線（空き）";el.appendChild(d)}
    if(l4.length)l4.forEach(x=>el.appendChild(badge(x.t,"north",false,4,SENGA_ID)));else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="4番線（空き）";el.appendChild(d)}
  }

  function addAsakusaSouth(el,items,guide){
    const g=document.createElement("div");g.className="bay-guide";g.textContent=guide;el.appendChild(g);
    if(items.length)items.forEach(x=>el.appendChild(badge(x.t,"south",false,1,ASAKUSABASHI_ID)));else{const d=document.createElement("div");d.className="empty-bay-slot";d.textContent="1番線（空き）";el.appendChild(d)}
    if(sidings.asakusabashi.length)sidings.asakusabashi.forEach(s=>el.appendChild(sidingBadge(s,"浅草橋","asakusabashi",null,null)));else{const d=document.createElement("div");d.className="empty-bay-slot siding";d.textContent="引き上げ線（空き）";el.appendChild(d)}
  }

  function render(trains){
    const stSl=ST.map(()=>({north:[],south:[]})),sgSl=Array.from({length:ST.length-1},()=>({north:[],south:[]}));
    let cnt=0;
    trains.forEach(t=>{
      const fi=IDX.get(t["odpt:fromStation"]),tid=t["odpt:toStation"],ti=tid?IDX.get(tid):undefined,dir=dirOf(t);
      if(!tid){if(fi!==undefined){stSl[fi][dir].push({t});cnt++}}
      else if(fi!==undefined&&ti!==undefined){const u=Math.min(fi,ti),l=Math.max(fi,ti);sgSl[l-u===1?u:Math.min(fi,sgSl.length-1)][dir].push({t});cnt++}
      else if(fi!==undefined){sgSl[dir==="north"?Math.min(fi,sgSl.length-1):Math.max(0,fi-1)][dir].push({t});cnt++}
      else if(ti!==undefined){sgSl[dir==="south"?Math.min(ti,sgSl.length-1):Math.max(0,ti-1)][dir].push({t});cnt++}
    });
    cntEl.textContent=`${cnt}本`;
    empEl.innerHTML=trains.length===0?'<div class="empty-state-card"><div class="empty-state-title">現在運行中の列車はありません</div><p class="empty-state-desc">深夜帯・営業時間外、または現在都営浅草線内の在線データがありません。</p></div>':"";
    const sengaPre=activeSengaPreTrains(trains);

    const frag=document.createDocumentFragment();
    COLS.forEach(c=>{
      const col=document.createElement("div");col.className="route-column";
      const ch=document.createElement("div");ch.className="col-header";
      ch.innerHTML=`<span class="dir-south">↑ 西馬込方面</span><span class="col-header-center">${esc(c.top)}</span><span class="dir-north">↓ 押上方面</span>`;
      col.appendChild(ch);
      for(let i=c.start;i<=c.end;i++){
        const s=ST[i],sr=document.createElement("div");
        sr.className=`station-row${i===0?" first-station":""}${i===ST.length-1?" last-station":""}${s.isDouble||s.id===ASAKUSABASHI_ID?" is-double-track":""}`;
        const lc=document.createElement("div");lc.className="track-col left";
        if(s.id===NISHI_ID)addNishiSide(lc,stSl[i].south,"south",s.lg);
        else if(s.id===SENGA_ID)addSengaSouth(lc,stSl[i].south,sengaPre,s.lg,trains);
        else if(s.id===ASAKUSABASHI_ID)addAsakusaSouth(lc,stSl[i].south,s.lg);
        else if(s.isDouble)addSlots(lc,stSl[i].south,"south",s.lb,s.lg,s.id);
        else stSl[i].south.forEach(x=>lc.appendChild(badge(x.t,"south",false,null,s.id)));

        const cc=document.createElement("div");cc.className="center-col";
        cc.innerHTML=`<div class="station-node"><span class="st-name${s.name.length>=5?" is-long":""}">${esc(s.name)}</span>${s.note?`<div class="st-note">${esc(s.note)}</div>`:""}</div>`;

        const rc=document.createElement("div");rc.className="track-col right";
        if(s.id===NISHI_ID)addNishiSide(rc,stSl[i].north,"north",s.rg);
        else if(s.id===SENGA_ID)addSengaNorth(rc,stSl[i].north,s.rg);
        else if(s.isDouble)addSlots(rc,stSl[i].north,"north",s.rb,s.rg,s.id);
        else stSl[i].north.forEach(x=>rc.appendChild(badge(x.t,"north",false,null,s.id)));

        sr.append(lc,cc,rc);col.appendChild(sr);
        if(i<ST.length-1){
          const sg=sgSl[i],has=sg.south.length>0||sg.north.length>0;
          const sgr=document.createElement("div");sgr.className=`segment-row${has?" has-trains":""}${i===c.end&&c.tail?" col-tail-segment":""}`;
          const sl=document.createElement("div");sl.className="track-col left";sg.south.forEach(x=>sl.appendChild(badge(x.t,"south",true,null,null)));
          const sc=document.createElement("div");sc.className="center-col";sc.innerHTML='<span class="segment-dot"></span>';
          const sr2=document.createElement("div");sr2.className="track-col right";sg.north.forEach(x=>sr2.appendChild(badge(x.t,"north",true,null,null)));
          sgr.append(sl,sc,sr2);col.appendChild(sgr);
        }
      }
      const cf=document.createElement("div");cf.className="col-continue-badge";cf.textContent=c.bot;col.appendChild(cf);
      frag.appendChild(col);
    });
    mapEl.innerHTML="";mapEl.appendChild(frag);
  }

  function openMod(t,dir,run,trk,sidingInfo,preInfo,stId){
    const tp=trType(t["odpt:trainType"]),dst=fmtDest(t["odpt:destinationStation"]),num=t["odpt:trainNumber"]||"不明",own=ownerLbl(t),toei=isToei(t),
          ds=typeof t["odpt:delay"]==="number"?t["odpt:delay"]:0,dm=dlyMin(ds),
          fn=OBJ.get(t["odpt:fromStation"])?.name||trSt(t["odpt:fromStation"]),
          tn=t["odpt:toStation"]?(OBJ.get(t["odpt:toStation"])?.name||trSt(t["odpt:toStation"])):null;
    let loc=run&&tn?`${fn} → ${tn} 走行中`:`${fn}駅 停車中${trk?`（${trk}番線）`:""}`;
    if(sidingInfo)loc=`${sidingInfo.stName}駅 引き上げ線（${preInfo?`${preInfo.targetTrack}番線空次第入線 ${preInfo.depTime}発`:"折返待"}）`;
    else if(preInfo)loc=`泉岳寺駅 ${trk?trk+"番線":`引き上げ線（${preInfo.targetTrack}番線待）`}（始発予定 ${preInfo.depTime}発）`;

    const dtxt=dir==="north"?"押上方面（北行 ↓）":"西馬込・泉岳寺方面（南行 ↑）",
          dltxt=dm>0?`+${dm}分（約${ds}秒遅れ）`:"定時（遅れなし）",
          orig=originOf(t),origTxt=orig?fmtDest(orig):"不明",ni=nextNishi(t),
          niTxt=ni.none?"本日の直近到着なし（-）":(coreNum(ni.train)===coreNum(num)?`${ni.text}（この列車）`:`${ni.text}（${ni.train}として）`);
    let dt="---";if(t["dc:date"]){const d=new Date(t["dc:date"]);if(!isNaN(d.getTime()))dt=fmtTime(d)}
    const uEnt=findUnitEntry(num);

    modTit.innerHTML=`<span class="train-type-chip ${esc(tp.c)}" style="font-size:12px;padding:2px 8px">${esc(tp.l)}</span><span>${esc(dst)}行</span>`;
    const rows=[
      ["列車番号",`<span class="train-num-badge" style="font-size:12px">${esc(num)}</span>${uEnt?` <span class="unit-badge" style="font-size:12px">${esc(uEnt.car)}</span>`:""}`,""],
      ["始発駅",esc(origTxt),""],["直近 西馬込着",esc(niTxt),""]
    ];
    if(isAfterNakanobuSouth(t,dir)){
      const plan=nishiArrivalPlan(t);
      if(plan)rows.push(["西馬込 着予定",esc(plan.isDepot?"入庫予定（折返し運用なし）":`${plan.track}番線予定（次発 ${plan.nextTime} ${plan.nextTrain}）`),""]);
    }
    if(!run&&stId===NISHI_ID){const dep=stDeparture(t,"nishi",dir);if(dep)rows.push(["西馬込 発車予定",esc(`${dep.time}（${dep.train}）`),""])}
    else if(!run&&stId===OSHI_ID){const dep=stDeparture(t,"oshi",dir);if(dep)rows.push(["押上 発車予定",esc(`${dep.time}（${dep.train}）`),""])}
    rows.push(["車両所属",`<span class="owner-pill${toei?" toei":""}">${esc(own)}</span>`,""]);
    rows.push(["現在位置",esc(loc),""],["進行方向",esc(dtxt),""]);
    if(sidingInfo){
      rows.push(["入線時刻",esc(fmtTime(new Date(sidingInfo.siding.enteredAt))),""]);
      rows.push(["予定折返番号",esc(returnCands(sidingInfo.siding.origNum).join(" / ")||sidingInfo.siding.expNum),""]);
    }else if(!preInfo){
      rows.push(["遅延状況",esc(dltxt),dm>0?"delay-highlight":""]);
      rows.push(["データ時刻",esc(dt),""]);
    }
    modList.innerHTML=rows.map(([k,v,c])=>`<li class="detail-item"><span class="detail-label">${esc(k)}</span><span class="detail-value ${c}">${v}</span></li>`).join("");

    modUnitEd.innerHTML="";
    const curOp=opCode(num);
    if(curOp){
      const saveKey=uEnt?uEnt.key:(curOp.endsWith("T")?oddOpKey(curOp):curOp);
      const box=document.createElement("div");box.className="unit-edit-box";
      box.innerHTML=`<div class="unit-edit-title">編成番号メモ（運用: ${esc(saveKey)}）</div>`+
        `<div class="unit-form-row"><input type="text" id="modUnitInp" class="unit-input" placeholder="例: 501" value="${esc(uEnt?uEnt.car:"")}" autocomplete="off"><button type="button" id="modUnitSave" class="unit-save-btn">保存</button>${uEnt?'<button type="button" id="modUnitDel" class="unit-del-btn">解除</button>':""}</div>`;
      modUnitEd.appendChild(box);
      const inp=document.getElementById("modUnitInp");
      document.getElementById("modUnitSave").addEventListener("click",()=>{setUnitEntry(saveKey,inp.value,true);modEl.classList.remove("open");render(lastTrains)});
      const delBtn=document.getElementById("modUnitDel");
      if(delBtn)delBtn.addEventListener("click",()=>{if(uEnt){delete unitData.items[uEnt.key];saveUnits()}modEl.classList.remove("open");render(lastTrains)});
    }

    modAct.innerHTML="";
    if(sidingInfo){
      const cb=document.createElement("button");cb.type="button";cb.className="siding-clear-btn";
      cb.textContent="この列車を引き上げ線表示から削除";
      cb.addEventListener("click",()=>{sidings[sidingInfo.stKey]=sidings[sidingInfo.stKey].filter(x=>x.id!==sidingInfo.siding.id);saveSidings();modEl.classList.remove("open");render(lastTrains)});
      modAct.appendChild(cb);
    }
    modEl.classList.add("open");
  }

  function renderUnitModal(){
    checkUnitReset();
    unitAutoResetChk.checked=unitData.autoReset;
    unitTabWd.classList.toggle("active",unitCal==="Weekday");
    unitTabHd.classList.toggle("active",unitCal==="SaturdayHoliday");

    const fixedOps=unitCal==="Weekday"?OPS_WD:OPS_HD,fixedSet=new Set(fixedOps),activeByOdd=new Map();
    lastTrains.forEach(t=>{if(!isToei(t))return;const op=oddOpKey(opCode(t["odpt:trainNumber"]||""));if(op&&!activeByOdd.has(op))activeByOdd.set(op,fmtDest(t["odpt:destinationStation"]))});

    unitFixedList.innerHTML="";
    fixedOps.forEach(op=>{
      const ent=unitData.items[op],actDst=activeByOdd.get(op);
      const row=document.createElement("div");row.className="unit-row-item";
      row.innerHTML=`<span class="unit-op-tag">${esc(op)}</span>`+
        `<span class="unit-row-sub">${actDst?esc(actDst+"行"):"在線外"}</span>`+
        `<input type="text" class="unit-input" style="padding:5px 8px;font-size:13px" placeholder="例: 501" value="${esc(ent?ent.car:"")}" autocomplete="off">`+
        `<span class="unit-saved-mark">${ent&&ent.car?"✓":""}</span>`;
      const inp=row.querySelector("input"),mk=row.querySelector(".unit-saved-mark");
      inp.addEventListener("input",()=>{setUnitEntry(op,inp.value,true);mk.textContent=inp.value.trim()?"✓":"";render(lastTrains)});
      unitFixedList.appendChild(row);
    });
    renderUnitOthers(fixedSet);
  }

  function renderUnitOthers(fixedSet){
    const others=Object.entries(unitData.items).filter(([k])=>!fixedSet.has(k)).sort((a,b)=>a[0].localeCompare(b[0]));
    unitOtherCount.textContent=`${others.length}件`;
    unitOtherList.innerHTML="";
    if(!others.length){unitOtherList.innerHTML='<div style="font-size:12px;color:var(--txs);padding:2px 0">その他の登録はありません</div>';return}
    others.forEach(([op,info])=>{
      const row=document.createElement("div");row.className="unit-row-item";const pOp=info.pair?pairOpKey(op):"";
      row.innerHTML=`<span class="unit-op-tag${op.endsWith("T")?"":" other"}">${esc(op)}</span><span class="unit-row-sub">${pOp?`⇄${esc(pOp)}`:"単独"}</span><input type="text" class="unit-input" style="padding:5px 8px;font-size:13px" value="${esc(info.car)}" autocomplete="off"><button type="button" class="unit-del-btn" style="padding:5px 8px;font-size:12px">削除</button>`;
      const inp=row.querySelector("input"),db=row.querySelector(".unit-del-btn");
      inp.addEventListener("input",()=>{setUnitEntry(op,inp.value,info.pair);render(lastTrains)});
      db.addEventListener("click",()=>{delete unitData.items[op];saveUnits();renderUnitOthers(fixedSet);render(lastTrains)});
      unitOtherList.appendChild(row);
    });
  }

  unitOpenBtn.addEventListener("click",()=>{unitCal=guessCal();renderUnitModal();unitModalEl.classList.add("open")});
  unitCloseBtn.addEventListener("click",()=>unitModalEl.classList.remove("open"));
  unitModalEl.addEventListener("click",e=>{if(e.target===unitModalEl)unitModalEl.classList.remove("open")});
  unitTabWd.addEventListener("click",()=>{unitCal="Weekday";renderUnitModal()});
  unitTabHd.addEventListener("click",()=>{unitCal="SaturdayHoliday";renderUnitModal()});
  unitAutoResetChk.addEventListener("change",e=>{unitData.autoReset=e.target.checked;saveUnits()});
  unitAddBtn.addEventListener("click",()=>{const op=normOpInput(unitAddOp.value),car=unitAddCar.value.trim();if(!op||!car)return;setUnitEntry(op,car,unitAddPairChk.checked);unitAddOp.value="";unitAddCar.value="";renderUnitModal();render(lastTrains)});
  unitClearAllBtn.addEventListener("click",()=>{if(!Object.keys(unitData.items).length)return;unitData.items={};saveUnits();renderUnitModal();render(lastTrains)});

  function pickKindAt(lg,stName){
    if(!lg)return"";
    const lt=window.getStationLineType?window.getStationLineType(stName):2;
    if(lt===1)return lg.k1||lg.kind;
    if(lt===3)return lg.k3||lg.kind;
    return lg.k2||lg.kind;
  }

  function estimateOpStatus(op,cal){
    const rt=lastTrains.find(t=>isToei(t)&&oddOpKey(opCode(t["odpt:trainNumber"]))===op);
    if(rt){
      const fn=OBJ.get(rt["odpt:fromStation"])?.name||trSt(rt["odpt:fromStation"]),tn=rt["odpt:toStation"]?(OBJ.get(rt["odpt:toStation"])?.name||trSt(rt["odpt:toStation"])):null;
      const dm=dlyMin(rt["odpt:delay"]),dst=fmtDest(rt["odpt:destinationStation"]);
      return{mode:"rt",station:tn?`${fn}〜${tn}間`:fn,badge:"リアルタイム（浅草線内）",badgeCls:"rt",detail:`${rt["odpt:trainNumber"]} ${trType(rt["odpt:trainType"]).l} ${dst}行${dm>0?` (+${dm}分)`:""}`};
    }
    const unyo=window.UNYO_DATA&&window.UNYO_DATA[cal]?window.UNYO_DATA[cal]:{};
    const legs=unyo[op]||[],nowM=nowSvcMin();
    if(!legs.length)return{mode:"wait",station:"データなし",badge:"運用なし",badgeCls:"wait",detail:"このダイヤに運用がありません"};

    for(let i=0;i<legs.length;i++){
      const lg=legs[i];
      if(lg.dMin!==null&&lg.aMin!==null&&nowM>=lg.dMin&&nowM<=lg.aMin){
        let stName=lg.from.replace("(SKY)","");
        const path=window.findStationPath?window.findStationPath(lg.from,lg.to):null;
        if(path&&path.length>1){
          const total=path[path.length-1].cum||1,ratio=Math.max(0,Math.min(1,(nowM-lg.dMin)/Math.max(1,lg.aMin-lg.dMin))),target=ratio*total;
          let best=path[0],bestDiff=1e9;
          path.forEach(p=>{const df=Math.abs(p.cum-target);if(df<bestDiff){bestDiff=df;best=p}});
          stName=best.name;
        }
        return{mode:"est",station:stName,badge:"推定位置（運用表）",badgeCls:"est",detail:`${lg.num} ${pickKindAt(lg,stName)} ${lg.to.replace("(SKY)","")}行 (${fmtHmStr(lg.dep)}→${fmtHmStr(lg.arr)})`};
      }
    }

    let prevLeg=null,nextLeg=null;
    for(const lg of legs){if(lg.aMin!==null&&lg.aMin<nowM)prevLeg=lg;if(!nextLeg&&lg.dMin!==null&&lg.dMin>nowM)nextLeg=lg}

    if(prevLeg&&nextLeg){
      const midRep=legs.slice(legs.indexOf(prevLeg)+1,legs.indexOf(nextLeg)).find(x=>x.isRep);
      if(midRep)return{mode:"wait",station:`${midRep.from.replace("(SKY)","")}〜${midRep.to.replace("(SKY)","")}`,badge:"回送中（推定）",badgeCls:"wait",detail:`${midRep.num} 回送（次:${fmtHmStr(nextLeg.dep)} ${nextLeg.from.replace("(SKY)","")}発）`};
      return{mode:"wait",station:prevLeg.to.replace("(SKY)",""),badge:"折返・留置中",badgeCls:"wait",detail:`次発 ${nextLeg.num} ${pickKindAt(nextLeg,nextLeg.from)} ${nextLeg.to.replace("(SKY)","")}行 (${fmtHmStr(nextLeg.dep)}発)`};
    }

    if(!prevLeg&&nextLeg){
      const firstLeg=legs[0],startsNishi=nextLeg.from==="西馬込"||(firstLeg&&firstLeg.isRep&&firstLeg.from==="西馬込");
      if(startsNishi){
        if(firstLeg&&firstLeg.isRep&&firstLeg.from==="西馬込"&&nextLeg.from!=="西馬込"){
          if(nowM<nextLeg.dMin-25)return{mode:"depot",station:"馬込車庫出庫前",badge:"車庫在線",badgeCls:"depot",detail:`出庫回送後 ${nextLeg.num} ${nextLeg.from} (${fmtHmStr(nextLeg.dep)}発)`};
          return{mode:"wait",station:`${firstLeg.from}〜${firstLeg.to}`,badge:"出庫回送中（推定）",badgeCls:"wait",detail:`${firstLeg.num} 回送（次:${fmtHmStr(nextLeg.dep)} ${nextLeg.from}発）`};
        }
        if(nowM<nextLeg.dMin-10)return{mode:"depot",station:"馬込車庫出庫前",badge:"車庫在線",badgeCls:"depot",detail:`初発 ${nextLeg.num} ${pickKindAt(nextLeg,nextLeg.from)} ${nextLeg.to.replace("(SKY)","")}行 (${fmtHmStr(nextLeg.dep)}発)`};
        return{mode:"wait",station:"西馬込",badge:"出庫・発車前",badgeCls:"wait",detail:`初発 ${nextLeg.num} ${pickKindAt(nextLeg,nextLeg.from)} ${nextLeg.to.replace("(SKY)","")}行 (${fmtHmStr(nextLeg.dep)}発)`};
      }
      return{mode:"wait",station:nextLeg.from.replace("(SKY)",""),badge:"出庫前",badgeCls:"wait",detail:`初発 ${nextLeg.num} ${pickKindAt(nextLeg,nextLeg.from)} ${nextLeg.to.replace("(SKY)","")}行 (${fmtHmStr(nextLeg.dep)}発)`};
    }

    if(prevLeg&&!nextLeg){
      const afterRep=legs.slice(legs.indexOf(prevLeg)+1).find(x=>x.isRep);
      const endSt=(afterRep?afterRep.to:prevLeg.to).replace("(SKY)","");
      if(!afterRep&&prevLeg.to==="西馬込"){
        if(nowM>=prevLeg.aMin+10)return{mode:"depot",station:"馬込車庫入庫済",badge:"車庫在線",badgeCls:"depot",detail:`最終 ${prevLeg.num} 西馬込 (${fmtHmStr(prevLeg.arr)}着)`};
        return{mode:"wait",station:"西馬込",badge:"到着・入庫前",badgeCls:"wait",detail:`最終 ${prevLeg.num} 西馬込 (${fmtHmStr(prevLeg.arr)}着)`};
      }
      return{mode:"wait",station:endSt,badge:afterRep?"入庫回送・終了":"本日運用終了",badgeCls:"wait",detail:`最終 ${prevLeg.num} ${prevLeg.to.replace("(SKY)","")} (${fmtHmStr(prevLeg.arr)}着)`};
    }
    return{mode:"wait",station:"不明",badge:"時刻外",badgeCls:"wait",detail:"運用時刻データ外"};
  }

  function renderSearchModal(){
    checkUnitReset();
    searchTabWd.classList.toggle("active",searchCal==="Weekday");
    searchTabHd.classList.toggle("active",searchCal==="SaturdayHoliday");
    const q=searchInp.value.trim().toUpperCase().replace(/[Ａ-Ｚ０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0));
    const fixedOps=searchCal==="Weekday"?OPS_WD:OPS_HD,showAll=searchAllChk.checked;
    const hasAnyReg=fixedOps.some(op=>unitData.items[op]&&unitData.items[op].car);
    const targets=[];

    fixedOps.forEach(op=>{
      const u=unitData.items[op],car=u?u.car:"";
      if(q){if((car&&car.toUpperCase().includes(q))||op.includes(q)||op.replace("T","")===q)targets.push({op,car})}
      else if(showAll||!hasAnyReg||car){targets.push({op,car})}
    });
    targets.sort((a,b)=>(b.car?1:0)-(a.car?1:0));

    if(!window.UNYO_DATA)searchInfoText.textContent="※運用表ファイル(unyo.js)が読み込まれていません";
    else if(q)searchInfoText.textContent=`「${q}」の検索結果：${targets.length}件`;
    else if(!hasAnyReg)searchInfoText.textContent=`編成未登録のため全${targets.length}運用の現在位置を表示中（「編成」で紐づけ可）`;
    else searchInfoText.textContent=showAll?`全${targets.length}運用を表示中`:`登録済みの${targets.length}編成を表示中`;

    searchResults.innerHTML="";
    if(!targets.length){searchResults.innerHTML='<div style="font-size:12.5px;color:var(--txs);padding:8px 0;text-align:center">該当する編成・運用が見つかりません</div>';return}
    targets.forEach(tg=>{
      const st=estimateOpStatus(tg.op,searchCal);
      const card=document.createElement("div");
      card.className=`search-card${st.mode==="rt"?" is-rt":(st.mode==="depot"?" is-depot":"")}`;
      card.innerHTML=`<div class="search-card-top"><div class="search-card-ids">${tg.car?`<span class="unit-badge" style="font-size:12px">${esc(tg.car)}</span>`:""}<span class="unit-op-tag">${esc(tg.op)}</span></div><span class="search-badge ${st.badgeCls}">${esc(st.badge)}</span></div>`+
        `<div class="search-station">${esc(st.station)}</div><div class="search-sub">${esc(st.detail)}</div>`;
      searchResults.appendChild(card);
    });
  }

  searchOpenBtn.addEventListener("click",()=>{searchCal=guessCal();renderSearchModal();searchModalEl.classList.add("open")});
  searchCloseBtn.addEventListener("click",()=>searchModalEl.classList.remove("open"));
  searchModalEl.addEventListener("click",e=>{if(e.target===searchModalEl)searchModalEl.classList.remove("open")});
  searchTabWd.addEventListener("click",()=>{searchCal="Weekday";renderSearchModal()});
  searchTabHd.addEventListener("click",()=>{searchCal="SaturdayHoliday";renderSearchModal()});
  searchInp.addEventListener("input",renderSearchModal);
  searchAllChk.addEventListener("change",renderSearchModal);
  searchClearBtn.addEventListener("click",()=>{searchInp.value="";renderSearchModal()});

  async function ensureTT(){if(ttReady||ttLoading)return;const ok=await loadTT(guessCal());if(ok&&lastTrains.length){updateSidings(lastTrains);render(lastTrains)}}
  async function load(){
    if(fetching)return;fetching=true;refBtn.disabled=true;refBtn.classList.add("is-loading");
    try{
      const r=await fetch(API,{headers:{Accept:"application/json"},cache:"no-store"});
      if(!r.ok)throw new Error("HTTP "+r.status);
      const d=await r.json();if(!Array.isArray(d))throw new Error("Bad JSON");
      banEl.className="status-banner";banMsg.textContent="";
      update
