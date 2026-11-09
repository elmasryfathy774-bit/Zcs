/* الآلة الحاسبة العلمية — Zewail Smart */
(function(){
"use strict";
var $=function(i){return document.getElementById(i)};
var S={ex:"",cu:0,shift:false,mode:"DEG",mem:0,ans:0,frac:false,done:false,res:0,err:"",tab:"c",tool:"q",n:2,showH:false,hist:[]};
try{S.mode=localStorage.getItem("calcMode")||"DEG";var h=JSON.parse(localStorage.getItem("calcHist")||"[]");if(Array.isArray(h))S.hist=h}catch(e){}
function save(){try{localStorage.setItem("calcMode",S.mode);localStorage.setItem("calcHist",JSON.stringify(S.hist))}catch(e){}}

/* ---------- الرياضيات ---------- */
function toR(x){return S.mode==="DEG"?x*Math.PI/180:S.mode==="GRAD"?x*Math.PI/200:x}
function fromR(x){return S.mode==="DEG"?x*180/Math.PI:S.mode==="GRAD"?x*200/Math.PI:x}
function z(r){return Math.abs(r)<1e-14?0:r}
function cl(x){return parseFloat(x.toPrecision(12))}
function fact(n){if(n<0||n!==Math.floor(n)||n>170)return NaN;var r=1;for(var k=2;k<=n;k++)r*=k;return r}
function nPr(n,r){if(n<0||r<0||r>n||n!==Math.floor(n)||r!==Math.floor(r))return NaN;var p=1;for(var k=0;k<r;k++)p*=n-k;return p}
function nCr(n,r){if(isNaN(nPr(n,r)))return NaN;r=Math.min(r,n-r);var c=1;for(var k=1;k<=r;k++)c=c*(n-r+k)/k;return Math.round(c)}
function fn(n,x){switch(n){
case"sin":return z(Math.sin(toR(x)));case"cos":return z(Math.cos(toR(x)));
case"tan":var c=z(Math.cos(toR(x)));return c===0?NaN:z(Math.sin(toR(x)))/c;
case"asin":return fromR(Math.asin(x));case"acos":return fromR(Math.acos(x));case"atan":return fromR(Math.atan(x));
case"sinh":return Math.sinh(x);case"cosh":return Math.cosh(x);case"tanh":return Math.tanh(x);
case"log":return Math.log10(x);case"ln":return Math.log(x);case"abs":return Math.abs(x);
case"sqrt":return Math.sqrt(x);case"cbrt":return Math.cbrt(x);case"exp":return Math.exp(x)}}

function compile(src){
 var s=src.replace(/\s+/g,"").replace(/pi/g,"π"),i=0,o=(s.match(/\(/g)||[]).length-(s.match(/\)/g)||[]).length;
 while(o-->0)s+=")";
 function pk(){return s.charAt(i)}
 function bin(a,b,k){return function(v){var x=a(v),y=b(v);return k===1?x+y:k===2?x-y:k===3?x*y:x/y}}
 function map(a,f){return function(v){return f(a(v))}}
 function expr(){var a=term(),c;while((c=pk())==="+"||c==="−"||c==="-"){i++;a=bin(a,term(),c==="+"?1:2)}return a}
 function term(){var a=unary(),c;for(;;){c=pk();
  if(c==="×"||c==="*"){i++;a=bin(a,unary(),3)}
  else if(c==="÷"||c==="/"){i++;a=bin(a,unary(),4)}
  else if(c&&/[\d.(√∛πa-zARM]/.test(c))a=bin(a,unary(),3);
  else break}return a}
 function unary(){var c=pk();if(c==="−"||c==="-"){i++;return map(unary(),function(x){return -x})}if(c==="+"){i++;return unary()}return pw()}
 function pw(){var a=cmb();if(pk()==="^"){i++;var b=unary();return function(v){return Math.pow(a(v),b(v))}}return a}
 function cmb(){var a=post(),c;while((c=pk())==="P"||c==="C"){i++;var b=post();a=(function(a,b,c){return function(v){return c==="P"?nPr(a(v),b(v)):nCr(a(v),b(v))}})(a,b,c)}return a}
 function post(){var a=prim(),c;for(;;){c=pk();if(c==="!"){i++;a=map(a,fact)}else if(c==="%"){i++;a=map(a,function(x){return x/100})}else break}return a}
 function prim(){var c=pk(),m=/^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
  if(m){i+=m[0].length;var nv=parseFloat(m[0]);return function(){return nv}}
  if(c==="("){i++;var e=expr();if(pk()!==")")throw 0;i++;return e}
  if(c==="π"){i++;return function(){return Math.PI}}
  if(c==="√"||c==="∛"){i++;return map(prim(),c==="√"?Math.sqrt:Math.cbrt)}
  m=/^(asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|log|ln|abs|sqrt|cbrt|exp|Ans|Ran#|M|e|x)/.exec(s.slice(i));
  if(!m)throw 0;i+=m[0].length;var n=m[0];
  if(n==="Ans")return function(){return S.ans};
  if(n==="Ran#")return function(){return Math.random()};
  if(n==="M")return function(){return S.mem};
  if(n==="e")return function(){return Math.E};
  if(n==="x")return function(v){return v.x};
  if(pk()!=="(")throw 0;i++;var a=expr();if(pk()!==")")throw 0;i++;
  return map(a,function(x){return fn(n,x)})}
 var f=expr();if(i<s.length)throw 0;return f}

function ev(src){var r;try{r=compile(src)({})}catch(e){throw"syn"}if(typeof r!=="number"||!isFinite(r))throw"math";return cl(r)}

function fmt(x){if(x===0)return"0";var a=Math.abs(x);if(Number.isInteger(x)&&a<1e15)return String(x);
 if(a>=1e10||a<1e-9)return x.toExponential(9).replace(/\.?0+e/,"e").replace(/e\+?/,"×10^");
 return String(parseFloat(x.toPrecision(10))).replace(/e\+?/,"×10^")}
function toFrac(x){if(Number.isInteger(x))return null;var s=x<0?"−":"",v=Math.abs(x),h1=1,h0=0,k1=0,k0=1,b=v;
 for(var n=0;n<20;n++){var a=Math.floor(b),h=a*h1+h0,k=a*k1+k0;h0=h1;h1=h;k0=k1;k1=k;if(k>100000)return null;
  if(Math.abs(v-h/k)<1e-9*Math.max(1,v))return s+h+"/"+k;b=1/(b-a);if(!isFinite(b))break}return null}
function toSurd(x){var q=x*x,r=Math.round(q);if(Math.abs(q-r)>1e-8||r<2||r>1e6)return null;var a=1,b=r;
 for(var f=2;f*f<=b;f++)while(b%(f*f)===0){b/=f*f;a*=f}
 return b===1?null:(x<0?"−":"")+(a>1?a:"")+"√"+b}
function show(r){var f=S.frac&&(toFrac(r)||toSurd(r));return f||fmt(r)}
function esc(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function F(x){return fmt(cl(x))}

/* ---------- الحاسبة ---------- */
var SCI=[
["@shift","SHIFT"],["sin(","sin","asin(","sin⁻¹"],["cos(","cos","acos(","cos⁻¹"],["tan(","tan","atan(","tan⁻¹"],["log(","log","10^(","10ˣ"],["ln(","ln","e^(","eˣ"],
["(","("],[")",")"],["^2","x²","^3","x³"],["^(","xʸ"],["√(","√","∛(","∛"],["!","n!"],
["π","π","e","e"],["P","nPr","C","nCr"],["%","%","abs(","|x|"],["^(-1)","x⁻¹","Ran#","Ran#"],["@m+","M+","@m-","M−"],["@mr","MR","@mc","MC"],
["@l","◀"],["@r","▶"],["×10^(","×10ˣ"],["@frac","S⇔D"],["@mode","@MODE"],["@hist","سجل"]];
var NUM=[
["7","7",0,0,"d"],["8","8",0,0,"d"],["9","9",0,0,"d"],["@del","DEL",0,0,"ac"],["@ac","AC",0,0,"ac"],
["4","4",0,0,"d"],["5","5",0,0,"d"],["6","6",0,0,"d"],["×","×",0,0,"o"],["÷","÷",0,0,"o"],
["1","1",0,0,"d"],["2","2",0,0,"d"],["3","3",0,0,"d"],["+","+",0,0,"o"],["−","−",0,0,"o"],
["0","0",0,0,"d"],[".",".",0,0,"d"],["Ans","Ans",0,0,"o"],["@eq","=",0,0,"eq"]];
function padHtml(K){return K.map(function(k,i){var a=S.shift&&k[3]?k[3]:k[1];if(a==="@MODE")a=S.mode;
 var c="k "+(k[4]||"")+(k[0]==="@shift"&&S.shift?" on":"")+(S.shift&&k[3]?" hi":"");
 return'<button type="button" class="'+c+'" data-i="'+i+'">'+(!S.shift&&k[3]?"<i>"+k[3]+"</i>":"")+a+"</button>"}).join("")}

function ins(t){var cont=/^[+−×÷^!%PC]/.test(t);
 if(S.done){S.ex=cont?"Ans":"";S.cu=S.ex.length;S.done=false}
 S.ex=S.ex.slice(0,S.cu)+t+S.ex.slice(S.cu);S.cu+=t.length}
function del(){if(S.done){S.ex="";S.cu=0;S.done=false;return}
 var b=S.ex.slice(0,S.cu),m=/(asin\(|acos\(|atan\(|sinh\(|cosh\(|tanh\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|exp\(|[√∛]\(|Ans|Ran#|.)$/.exec(b);
 if(!m)return;S.ex=b.slice(0,b.length-m[0].length)+S.ex.slice(S.cu);S.cu-=m[0].length}
function cur(){try{return S.done?S.res:ev(S.ex||"0")}catch(e){S.err=e;return null}}
function eq(){if(!S.ex)return;
 try{var r=ev(S.ex);S.res=r;S.ans=r;S.hist.unshift({e:S.ex,r:r});S.hist=S.hist.slice(0,30);save();S.done=true}
 catch(e){S.err=e}}
function run(t){S.err="";
 if(t.charAt(0)!=="@")return ins(t);
 switch(t){
 case"@shift":S.shift=!S.shift;break;
 case"@mode":S.mode=S.mode==="DEG"?"RAD":S.mode==="RAD"?"GRAD":"DEG";save();break;
 case"@frac":S.frac=!S.frac;break;
 case"@l":S.done=false;S.cu=Math.max(0,S.cu-1);break;
 case"@r":S.done=false;S.cu=Math.min(S.ex.length,S.cu+1);break;
 case"@del":del();break;
 case"@ac":S.ex="";S.cu=0;S.done=false;break;
 case"@eq":eq();break;
 case"@m+":case"@m-":var v=cur();if(v!==null)S.mem=cl(S.mem+(t==="@m+"?v:-v));break;
 case"@mr":ins("M");break;
 case"@mc":S.mem=0;break;
 case"@hist":S.showH=!S.showH;break}}

function paint(){if(!$("cex"))return;
 $("cex").innerHTML=S.done?esc(S.ex):esc(S.ex.slice(0,S.cu))+'<span class="cr"></span>'+esc(S.ex.slice(S.cu));
 var t="",c="crs";
 if(S.err){t=S.err==="math"?"خطأ رياضي":"خطأ في الصيغة";c+=" er"}
 else if(S.done)t=show(S.res);
 else if(S.ex){try{t=show(ev(S.ex));c+=" pv"}catch(e){t=""}}
 $("crs").className=c;$("crs").textContent=t;
 $("cmo").textContent=S.mode;$("csh").className=S.shift?"":"off";$("cmm").className=S.mem?"":"off";
 $("ps").innerHTML=padHtml(SCI);
 var H=$("chs");H.hidden=!S.showH;
 if(S.showH)H.innerHTML=S.hist.length?S.hist.map(function(x,i){return'<button type="button" data-h="'+i+'"><small>'+esc(x.e)+"</small>= "+fmt(x.r)+"</button>"}).join("")+'<button type="button" data-h="x" style="text-align:center;color:var(--bad);font-family:Cairo,sans-serif">مسح السجل</button>':'<p class="note">لسه مفيش عمليات.</p>'}
function key(e,K){var b=e.target.closest("button");if(!b)return;var k=K[+b.dataset.i],t=k[0];
 if(S.shift&&k[2])t=k[2];if(t!=="@shift")S.shift=false;run(t);paint();try{navigator.vibrate&&navigator.vibrate(6)}catch(x){}}
function calcHtml(){return'<div class="cd" dir="ltr"><div class="cst"><b id="cmo"></b><b id="csh">SHIFT</b><b id="cmm">M</b><span class="sp"></span><button class="cc" id="ccp" type="button">نسخ</button></div><div class="cex" id="cex"></div><div class="crs" id="crs"></div></div><div dir="ltr"><div class="cpad s" id="ps"></div><div class="cpad n" id="pn"></div></div><div class="chs" id="chs" dir="ltr" hidden></div>'}
function bindCalc(){
 $("pn").innerHTML=padHtml(NUM.map(function(k){return k}));
 $("ps").onclick=function(e){key(e,SCI)};$("pn").onclick=function(e){key(e,NUM)};
 $("ccp").onclick=function(){var t=$("crs").textContent,b=$("ccp");if(!t)return;try{navigator.clipboard.writeText(t);b.textContent="تم ✓";setTimeout(function(){b.textContent="نسخ"},1200)}catch(e){}};
 $("chs").onclick=function(e){var b=e.target.closest("button");if(!b)return;
  if(b.dataset.h==="x"){S.hist=[];save()}else{var x=S.hist[+b.dataset.h];S.ex=x.e;S.cu=x.e.length;S.done=false;S.err=""}paint()}}

if(!window.__calcKb){window.__calcKb=1;
 document.addEventListener("keydown",function(e){if(!$("cx")||S.tab!=="c"||e.ctrlKey||e.metaKey)return;
  var t=e.target.tagName;if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT")return;
  var k=e.key,M={"*":"×","/":"÷","-":"−","+":"+","^":"^","(":"(",")":")","!":"!","%":"%",".":".","=":"@eq",Enter:"@eq",Backspace:"@del",Escape:"@ac",ArrowLeft:"@l",ArrowRight:"@r"},a=/^\d$/.test(k)?k:M[k];
  if(!a)return;e.preventDefault();run(a);paint()});
 window.addEventListener("resize",function(){if($("gc"))gdraw()})}

/* ---------- الرسم البياني ---------- */
var G={cx:0,cy:0,s:36,f:["sin(x)","x^2/4-2",""]};
function nice(r){var p=Math.pow(10,Math.floor(Math.log10(r))),m=r/p;return(m<=1?1:m<=2?2:m<=5?5:10)*p}
function gdraw(){var c=$("gc");if(!c)return;
 var d=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
 if(c.width!==Math.round(w*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}
 var x=c.getContext("2d"),cs=getComputedStyle(c),V=function(n){return cs.getPropertyValue(n).trim()};
 x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
 var X=function(u){return w/2+(u-G.cx)*G.s},Y=function(v){return h/2-(v-G.cy)*G.s},step=nice(50/G.s),n,u;
 x.font="11px Inter,sans-serif";x.fillStyle=V("--muted");
 var ax=Math.min(Math.max(Y(0)+13,13),h-4),ay=Math.min(Math.max(X(0)+4,2),w-34);
 for(n=Math.floor((G.cx-w/2/G.s)/step);n<=Math.ceil((G.cx+w/2/G.s)/step);n++){u=n*step;x.strokeStyle=n?V("--line"):V("--ink");x.lineWidth=n?1:1.8;
  x.beginPath();x.moveTo(X(u),0);x.lineTo(X(u),h);x.stroke();if(n)x.fillText(String(+u.toPrecision(6)),X(u)+3,ax)}
 for(n=Math.floor((G.cy-h/2/G.s)/step);n<=Math.ceil((G.cy+h/2/G.s)/step);n++){u=n*step;x.strokeStyle=n?V("--line"):V("--ink");x.lineWidth=n?1:1.8;
  x.beginPath();x.moveTo(0,Y(u));x.lineTo(w,Y(u));x.stroke();if(n)x.fillText(String(+u.toPrecision(6)),ay,Y(u)-3)}
 var cols=[V("--p"),V("--p2"),V("--mint")],mode=S.mode;S.mode="RAD";
 G.f.forEach(function(src,k){if(!src.trim())return;var f;try{f=compile(src)}catch(e){return}
  x.strokeStyle=cols[k];x.lineWidth=2.4;x.beginPath();var pen=false,py=0;
  for(var p=0;p<=w;p++){var yv;try{yv=f({x:G.cx+(p-w/2)/G.s})}catch(e){yv=NaN}
   var yy=Y(yv);if(!isFinite(yy)||Math.abs(yy)>1e4){pen=false;continue}
   if(pen&&Math.abs(yy-py)<h*1.5)x.lineTo(p,yy);else x.moveTo(p,yy);pen=true;py=yy}
  x.stroke()});
 S.mode=mode}
function graphHtml(){var c=["--p","--p2","--mint"];
 return'<div class="card col gw"><canvas id="gc"></canvas><p class="gro" id="gro" dir="ltr">اسحبي بإصبعك عشان تحركي الرسم</p><div class="gz"><button class="btn alt" id="gp" type="button" aria-label="تكبير">＋</button><button class="btn alt" id="gm" type="button" aria-label="تصغير">－</button><button class="btn alt" id="gh" type="button">إعادة ضبط</button></div>'+
 G.f.map(function(f,i){return'<label class="gf"><i style="background:var('+c[i]+')"></i><input id="g'+i+'" dir="ltr" autocomplete="off" placeholder="'+(i?"دالة إضافية":"f(x) =")+'" value="'+esc(f)+'"></label>'}).join("")+
 '<p class="note">اكتبي زي: x^2 ، sin(x) ، abs(x) ، sqrt(x) ، 1/x . الرسم بالراديان.</p></div>'}
function bindGraph(){var c=$("gc"),dr=null;
 G.f.forEach(function(f,i){$("g"+i).oninput=function(){G.f[i]=this.value;gdraw()}});
 function zoom(k){G.s=Math.min(2000,Math.max(2,G.s*k));gdraw()}
 $("gp").onclick=function(){zoom(1.4)};$("gm").onclick=function(){zoom(1/1.4)};$("gh").onclick=function(){G.cx=0;G.cy=0;G.s=36;gdraw()};
 c.onpointerdown=function(e){dr={x:e.clientX,y:e.clientY,cx:G.cx,cy:G.cy};c.setPointerCapture(e.pointerId)};
 c.onpointermove=function(e){if(dr){G.cx=dr.cx-(e.clientX-dr.x)/G.s;G.cy=dr.cy+(e.clientY-dr.y)/G.s;gdraw()}
  var u=G.cx+(e.clientX-c.getBoundingClientRect().left-c.clientWidth/2)/G.s,src=G.f.filter(function(s){return s.trim()})[0],t="x = "+F(u),m=S.mode;
  if(src){S.mode="RAD";try{t+="   y = "+F(compile(src)({x:u}))}catch(x){}S.mode=m}$("gro").textContent=t};
 c.onpointerup=c.onpointercancel=function(){dr=null};
 c.addEventListener("wheel",function(e){e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15)},{passive:false})}

/* ---------- أدوات: معادلات / نظام / إحصاء / نظم عدّ ---------- */
var TOOLS=[["q","معادلة ٢"],["l","نظام"],["s","إحصاء"],["b","نظم عدّ"]];
function res(o){$("tr").innerHTML=o.map(function(r){return"<div><span>"+r[0]+"</span><bdi dir=\"ltr\">"+r[1]+"</bdi></div>"}).join("")}
function inp(id,ph){return'<input id="'+id+'" type="number" step="any" inputmode="decimal" dir="ltr" placeholder="'+ph+'">'}
function gauss(M){var n=M.length,i,r,c;for(i=0;i<n;i++){var p=i;for(r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[p][i]))p=r;
 if(Math.abs(M[p][i])<1e-12)return null;var t=M[i];M[i]=M[p];M[p]=t;
 for(r=0;r<n;r++)if(r!==i){var f=M[r][i]/M[i][i];for(c=i;c<=n;c++)M[r][c]-=f*M[i][c]}}
 return M.map(function(r,i){return r[n]/r[i]})}
function panel(){var p=$("tp"),T=S.tool;
 if(T==="q"){p.innerHTML='<div class="card col"><b>ax² + bx + c = 0</b><div class="g3" style="grid-template-columns:repeat(3,1fr)">'+inp("qa","a")+inp("qb","b")+inp("qc","c")+'</div><button class="btn" id="qg" type="button">احسبي</button><div class="tres" id="tr"></div></div>';
  $("qg").onclick=function(){var a=+$("qa").value,b=+$("qb").value,c=+$("qc").value,o=[];
   if(!a){if(!b)return res([["النتيجة","مفيش حل"]]);o.push(["x",F(-c/b)])}
   else{var D=b*b-4*a*c,r=-b/(2*a);o.push(["Δ",F(D)]);
    if(D>0){var q=Math.sqrt(D);o.push(["x₁",F((-b+q)/(2*a))],["x₂",F((-b-q)/(2*a))])}
    else if(D===0)o.push(["x",F(r)]);
    else{var im=F(Math.abs(Math.sqrt(-D)/(2*a)));o.push(["x₁",F(r)+" + "+im+"i"],["x₂",F(r)+" − "+im+"i"])}
    o.push(["الرأس","("+F(r)+" , "+F(c-b*b/(4*a))+")"])}
   res(o)}}
 else if(T==="l"){var n=S.n,h='<div class="card col"><b>نظام معادلات خطية</b><div class="ctabs sm"><button type="button" data-n="2" class="'+(n===2?"on":"")+'">٢ مجهول</button><button type="button" data-n="3" class="'+(n===3?"on":"")+'">٣ مجاهيل</button></div>';
  for(var i=0;i<n;i++){h+='<div class="g3" style="grid-template-columns:repeat('+(n+1)+',1fr)">';for(var j=0;j<=n;j++)h+=inp("s"+i+j,j<n?"xyz".charAt(j):"=");h+="</div>"}
  p.innerHTML=h+'<button class="btn" id="lg" type="button">احسبي</button><div class="tres" id="tr"></div></div>';
  p.querySelector(".ctabs").onclick=function(e){var b=e.target.closest("button");if(b){S.n=+b.dataset.n;panel()}};
  $("lg").onclick=function(){var M=[];for(var i=0;i<n;i++){M.push([]);for(var j=0;j<=n;j++)M[i].push(+$("s"+i+j).value)}
   var r=gauss(M);res(r?r.map(function(v,i){return["xyz".charAt(i),F(v)]}):[["النتيجة","مفيش حل وحيد"]])}}
 else if(T==="s"){p.innerHTML='<div class="card col"><b>إحصاء (متغير واحد)</b><textarea id="sd" rows="3" dir="ltr" placeholder="3 5 7 9 11"></textarea><button class="btn" id="sg" type="button">احسبي</button><div class="tres" id="tr"></div></div>';
  $("sg").onclick=function(){var v=$("sd").value.split(/[\s,،;]+/).filter(Boolean).map(Number).filter(function(x){return isFinite(x)}).sort(function(a,b){return a-b}),n=v.length;
   if(!n)return res([["النتيجة","اكتبي أرقام"]]);
   var sum=v.reduce(function(a,b){return a+b},0),m=sum/n,ss=v.reduce(function(a,b){return a+(b-m)*(b-m)},0),med=n%2?v[(n-1)/2]:(v[n/2-1]+v[n/2])/2;
   res([["n",n],["Σx",F(sum)],["Σx²",F(v.reduce(function(a,b){return a+b*b},0))],["x̄ المتوسط",F(m)],["σ (مجتمع)",F(Math.sqrt(ss/n))],["s (عينة)",n>1?F(Math.sqrt(ss/(n-1))):"—"],["الوسيط",F(med)],["أصغر",F(v[0])],["أكبر",F(v[n-1])],["المدى",F(v[n-1]-v[0])]])}}
 else{p.innerHTML='<div class="card col"><b>تحويل نظم العدّ</b><input id="bi" dir="ltr" autocomplete="off" placeholder="الرقم"><select id="bb"><option value="10">DEC عشري</option><option value="2">BIN ثنائي</option><option value="8">OCT ثماني</option><option value="16">HEX سداسي عشري</option></select><button class="btn" id="bg" type="button">حوّلي</button><div class="tres" id="tr"></div></div>';
  $("bg").onclick=function(){var b=+$("bb").value,t=$("bi").value.trim().toUpperCase();
   if(!t||!t.split("").every(function(c){return parseInt(c,16)<b}))return res([["النتيجة","رقم غير صحيح للنظام ده"]]);
   var n=parseInt(t,b);res([["DEC",n.toString(10)],["BIN",n.toString(2)],["OCT",n.toString(8)],["HEX",n.toString(16).toUpperCase()]])}}}
function toolsHtml(){return'<div class="ctabs sm" id="ts">'+TOOLS.map(function(t){return'<button type="button" data-t="'+t[0]+'" class="'+(S.tool===t[0]?"on":"")+'">'+t[1]+"</button>"}).join("")+'</div><div id="tp"></div>'}
function bindTools(){$("ts").onclick=function(e){var b=e.target.closest("button");if(!b)return;S.tool=b.dataset.t;
 Array.prototype.forEach.call($("ts").children,function(x){x.className=x===b?"on":""});panel()};panel()}

/* ---------- الصفحة ---------- */
function view(){
 $("ct").innerHTML=[["c","حاسبة"],["g","رسم بياني"],["t","أدوات"]].map(function(t){return'<button type="button" data-t="'+t[0]+'" class="'+(S.tab===t[0]?"on":"")+'">'+t[1]+"</button>"}).join("");
 var b=$("cb");
 if(S.tab==="c"){b.innerHTML=calcHtml();bindCalc();paint()}
 else if(S.tab==="g"){b.innerHTML=graphHtml();bindGraph();gdraw()}
 else{b.innerHTML=toolsHtml();bindTools()}}
window.renderCalc=function(){
 app('<div class="calc" id="cx"><h2>الآلة الحاسبة</h2><p class="sub">حاسبة علمية زي كاسيو، ومعاها رسم ومعادلات وإحصاء.</p><div class="ctabs" id="ct"></div><div id="cb"></div></div>');
 $("ct").onclick=function(e){var b=e.target.closest("button");if(!b)return;S.tab=b.dataset.t;view()};
 view()};
})();

/* ===== config ===== */
/* ضع رابط الـ Worker الخاص بلوحة الإدارة هنا (بعد نشره) */
window.HUDUR = { API: "https://hudur-api.YOUR-ACCOUNT.workers.dev/api" };

/* ===== الموقع ===== */

/* ---- تبديل الواجهة: الموقع / لوحة الإدارة (#admin) ---- */
var __adminStarted=false;
function showView(w){
 var s=document.getElementById("siteRoot"),a=document.getElementById("adminRoot");
 var isA=w==="admin";s.hidden=isA;a.hidden=!isA;
 if(isA){document.title="حضور — لوحة الإدارة";if(!__adminStarted&&window.__adminBoot){__adminStarted=true;window.__adminBoot()}}
 else{document.title="Zewail Smart"}
}
var KARIMA="201020956352";                          // رقم مس كريمة بصيغة دولية بدون +
var API="https://sheetdb.io/api/v1/l5bu05bnss7oe";  // رابط SheetDB
var CHAT_API="https://rapid-wildflower-d6e4.msrybsmlh.workers.dev";                                    // رابط الـ Worker بتاع Gemini (شوفي الملف gemini-worker.js)
var SCHOOL_URL="https://elmasryfathy774-bit.github.io/System/";
var SPRIX_URL="https://sprixportal.jp/";
var LIB_URL="http://studentbooks.moe.gov.eg/";
var pages=[["home","الرئيسية","home"],["chat","المساعد","chat"],["books","بنك الكتب","book"],["platforms","المنصات","globe"],["ig","مركز IG","cap"],["focus","جلسة مذاكرة","play"],["calc","الآلة الحاسبة","calc"],["cards","بطاقات تحفيزية","sun"],["translate","الترجمة","lang"],["lost-found","المفقودات","search"],["study-share","الملخصات","file"],["leaderboard","لوحة الشرف","trophy"],["parent","ولي الأمر","school"],["suggestions","المقترحات","mail"]];
var FAQ={
"عن المدرسة":[["مين مديرة المدرسة؟","مديرة المدرسة هي مس مروة أمين."],["مين وكيلة المدرسة؟","وكيلة المدرسة هي مس أسماء يحيي."],["المدرسة فين؟","مدرسة دكتور أحمد زويل في الحي 15 بمدينة العاشر من رمضان."],["فين معمل الكمبيوتر والمكتبة؟","معمل الكمبيوتر والمكتبة في الطابق الثاني."],["مين مس كريمة؟","مس كريمة هي اللي بتنسّق استلام وتسليم الكتب الخارجية والمفقودات على واتساب، وبسرية تامة."],["مواعيد الامتحانات إمتى؟","معنديش جدول الامتحانات. راجعي لوحة إعلانات المدرسة أو اسألي المعلمة."]],
"المذاكرة":[["إزاي أنظم وقتي؟","قسّمي يومك لفترات: ٤٥ دقيقة مذاكرة و١٠ دقايق راحة. ابدأي بالمادة الأصعب وإنتي نشيطة، واكتبي جدول أسبوعي بسيط فيه وقت للراحة والنوم."],["إزاي أذاكر للامتحان؟","راجعي الملخصات بدل ما تقري المنهج كله من الأول، وحلّي أسئلة وامتحانات السنين اللي فاتت. وقبل الامتحان نامي كويس."],["إزاي أركز وأنا بذاكر؟","ذاكري في مكان هادي وسيبي الموبايل بعيد. اشتغلي ٢٥ دقيقة وريّحي ٥ دقايق، واشربي مياه."],["محتاجة ملخصات","روحي لصفحة «الملخصات» في الموقع، هتلاقي ملخصات زميلاتك، وتقدري تنشري ملخصك كمان."]],
"عن الموقع":[["إزاي أطلب كتاب خارجي؟","روحي لصفحة «بنك الكتب» واضغطي «طلب الكتاب» جنب الكتاب. هيفتح واتساب مع مس كريمة بسرية تامة وبدون أي إحراج."],["إزاي أتبرع بكتاب؟","في صفحة «بنك الكتب» املي بيانات الكتاب واضغطي «أتبرع بالكتاب». ولو كتبتي اسمك الأول هتظهري في لوحة الشرف."],["ضاع مني حاجة أعمل إيه؟","روحي لصفحة «المفقودات» وسجّلي وصف الشيء. ومس كريمة هتساعدك في استلامه."],["إزاي أبعت اقتراح بدون اسم؟","من صفحة «المقترحات» اكتبي رسالتك واضغطي إرسال. اسمك مش بيتسجل خالص."]]
};
var chatHist=[];
// لوحة الإدارة أصبحت في موقع منفصل (admin-site)

function ic(n){return '<svg class="ic"><use href="#i-'+n+'"/></svg>'}
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function wa(t){return "https://wa.me/"+KARIMA+"?text="+encodeURIComponent(t)}
function tf(u,o){var c=new AbortController(),t=setTimeout(function(){c.abort()},15000);o=o||{};o.signal=c.signal;return fetch(u,o).then(function(r){clearTimeout(t);return r},function(e){clearTimeout(t);throw e})}
function get(s){return tf(API+"?sheet="+s).then(function(r){if(!r.ok)throw 0;return r.json()})}
function post(s,row){return tf(API+"?sheet="+s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:[row]})}).then(function(r){if(!r.ok)throw 0})}
function today(){var n=new Date();return n.getFullYear()+"-"+("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2)}
function app(h){document.getElementById("app").innerHTML=h}
function $(i){return document.getElementById(i)}
function empty(i,t){return '<div class="empty">'+ic(i)+'<p>'+t+'</p></div>'}
var err='<p class="note">مش قادرة أوصل لجدول البيانات دلوقتي. اتأكدي إن الموقع مرفوع على استضافة وإن الإنترنت شغال.</p>';

var FS={mode:"focus",d:{focus:25,rest:5},left:1500,run:false,end:0,tid:null,subj:""};
function subjs(){try{return JSON.parse(localStorage.getItem("ig_sj"))||[]}catch(e){return[]}}
function addSubj(n){n=(n||"").trim();if(!n)return;var a=subjs();if(a.indexOf(n)<0){a.push(n);try{localStorage.setItem("ig_sj",JSON.stringify(a))}catch(e){}}}
function allSubj(b){var o=(b||[]).slice();subjs().forEach(function(x){if(o.indexOf(x)<0)o.push(x)});return o}
function f2(n){return(n<10?"0":"")+n}
function fsLog(k){try{return JSON.parse(localStorage.getItem("study_"+(k||today()))||"null")||{s:0,m:0}}catch(e){return{s:0,m:0}}}
function fsAdd(m){var l=fsLog();l.s++;l.m+=m;try{localStorage.setItem("study_"+today(),JSON.stringify(l))}catch(e){}}
function fsLeft(){return FS.run?Math.max(0,Math.round((FS.end-Date.now())/1000)):FS.left}
function fsBeep(){try{var A=window.AudioContext||window.webkitAudioContext,c=new A();[880,660,880].forEach(function(f,k){var o=c.createOscillator(),g=c.createGain(),t=c.currentTime+k*.25;o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.25)})}catch(e){}try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}}
function fsPaint(){var t=$("ft"),l=fsLeft(),tot=FS.d[FS.mode]*60,tx=f2(Math.floor(l/60))+":"+f2(l%60);
 document.title=FS.run?tx+" · Zewail Smart":"Zewail Smart";if(!t)return;
 t.textContent=tx;$("fr").style.setProperty("--v",Math.round((tot-l)/tot*100));$("fr").className="fr "+FS.mode;
 $("fm").textContent=FS.mode==="focus"?"مذاكرة"+(FS.subj?" · "+FS.subj:""):"وقت الراحة";$("fgo").textContent=FS.run?"إيقاف مؤقت":(l<tot?"كمّلي":"ابدئي");
 [].forEach.call(document.querySelectorAll(".fmodes button"),function(b){b.classList.toggle("on",b.dataset.m===FS.mode)});
 [].forEach.call(document.querySelectorAll("#fp button"),function(b){b.classList.toggle("on",b.dataset.p===FS.d.focus+"-"+FS.d.rest)})}
function fsStop(){clearInterval(FS.tid);FS.tid=null}
function fsStart(){if(FS.run)return;FS.run=true;FS.end=Date.now()+FS.left*1000;FS.tid=setInterval(function(){if(fsLeft()<=0)fsDone();else fsPaint()},500);fsPaint()}
function fsPause(){if(!FS.run)return;FS.left=fsLeft();FS.run=false;fsStop();fsPaint()}
function fsSet(m){fsPause();FS.mode=m;FS.left=FS.d[m]*60;fsPaint()}
function fsDone(){fsStop();FS.run=false;var was=FS.mode;if(was==="focus")fsAdd(FS.d.focus);fsBeep();FS.mode=was==="focus"?"rest":"focus";FS.left=FS.d[FS.mode]*60;fsPaint();
 var m=$("fmsg");if(m)m.textContent=was==="focus"?"برافو! خلّصتي جلسة 🎉 خدي راحة قصيرة.":"الراحة خلصت، يلا نكمّل 💪";if($("fst"))fsStats()}
function fsStats(){var l=fsLog(),G=4,ds=[],i,d,k,v;
 for(i=6;i>=0;i--){d=new Date();d.setDate(d.getDate()-i);k=d.getFullYear()+"-"+f2(d.getMonth()+1)+"-"+f2(d.getDate());v=fsLog(k).m;ds.push([d.toLocaleDateString("ar-EG",{weekday:"short"}),v])}
 var mx=Math.max.apply(null,ds.map(function(x){return x[1]}).concat([1])),gp=Math.min(100,Math.round(l.s/G*100));
 $("fst").innerHTML='<div class="stats"><div><b>'+l.s+'</b><span>جلسات اليوم</span></div><div><b>'+l.m+'</b><span>دقيقة مذاكرة</span></div><div><b>'+gp+'%</b><span>هدف اليوم ('+G+' جلسات)</span></div></div><div class="gbar"><i style="width:'+gp+'%"></i></div><div class="card col"><div class="t">آخر ٧ أيام (بالدقايق)</div><div class="wk">'+ds.map(function(x){return '<div><em>'+x[1]+'</em><i style="height:'+Math.max(4,Math.round(x[1]/mx*80))+'px"></i><span>'+esc(x[0])+'</span></div>'}).join("")+'</div></div>'}
var MC=[["push","كل صفحة بتذاكريها النهاردة بتقرّبك خطوة من حلمك."],["push","مش لازم تكوني الأفضل، المهم تكوني أفضل من إمبارح."],["push","الاستمرار أهم من الحماس. ٢٠ دقيقة كل يوم أحسن من يوم كامل مرة في الشهر."],["push","إنتي أقوى من أي مادة صعبة، وأذكى من أي امتحان."],["push","الخطوة الصغيرة اللي بتعمليها دلوقتي هتبقى فخر بكرة."],["push","ابدأي حتى لو مش جاهزة. الجاهزية بتيجي بعد البداية."],
["exam","خدي نَفَس عميق. إنتي ذاكرتي، وده كفاية تثقي في نفسك."],["exam","نامي كويس الليلة قبل الامتحان، دماغك بتثبّت المعلومات وإنتي نايمة."],["exam","اقري السؤال مرتين قبل ما تجاوبي، نص الدرجة في الفهم."],["exam","ابدأي بالأسئلة اللي عارفاها، وده هيديكي ثقة تكمّلي بيها."],["exam","لو نسيتي معلومة، سيبيها وكمّلي. هتفتكريها وإنتي بتحلي غيرها."],["exam","الامتحان مش بيقيس قيمتك، هو بس خطوة في الطريق."],
["tired","التعب دليل إنك بتحاولي. ريّحي شوية وارجعي أقوى."],["tired","مش لازم كل يوم يبقى مثالي. كفاية إنك ما استسلمتيش."],["tired","لو مضغوطة، اتكلمي مع حد بتثقي فيه. مفيش حد لازم يشيل لوحده."],["tired","اشربي مياه، وقومي اتحركي ٥ دقايق. جسمك محتاج شوية اهتمام."],["tired","الغلط مش فشل، ده طريقة المخ في التعلم."],["tired","إنتي مش متأخرة. كل واحدة ليها سرعتها ومواعيدها."],
["tips","ذاكري المادة الصعبة أول ما تبدأي، وإنتي لسه نشيطة."],["tips","اشرحي الدرس بصوت عالي كأنك بتدرّسيه لصاحبتك، ده أقوى مراجعة."],["tips","حلّي أوراق امتحانات السنين اللي فاتت، وراجعي إجابتك بالـ Mark Scheme."],["tips","سيبي الموبايل في أوضة تانية وقت الجلسة، التركيز بيتضاعف."],["tips","راجعي اللي ذاكرتيه بعد يوم وبعد أسبوع، كده بيثبت في الدماغ."],["tips","اكتبي هدف واحد واضح للجلسة قبل ما تبدئي."]];
var MG=["linear-gradient(135deg,#6c3fd1,#ff6fa5)","linear-gradient(135deg,#0f8f77,#4fd6b6)","linear-gradient(135deg,#f59e0b,#ef4444)","linear-gradient(135deg,#2563eb,#8b5cf6)","linear-gradient(135deg,#db2777,#f59e0b)","linear-gradient(135deg,#0e7490,#22d3ee)"];
var MT={push:"تحفيز",exam:"قبل الامتحان",tired:"لو تعبانة",tips:"نصيحة مذاكرة"};

var V={
home:function(){var d={chat:"اسألي أي سؤال عن المدرسة والمذاكرة","books":"شوفي الكتب المتاحة وتبرعي بكتبك",platforms:"منصات دولية للمذاكرة والتعلم",ig:"متابعة منهج IG وبطاقات مراجعة ودرجات وامتحانات",focus:"تايمر بومودورو ومتابعة مذاكرتك",cards:"كلام حلو يشجعك كل يوم",translate:"ترجمي أي كلمة أو جملة فورًا","lost-found":"ضاع منكِ حاجة أو لقيتي حاجة","study-share":"ملخصات وكشاكيل زميلاتك","leaderboard":"سفيرات الخير",parent:"الحضور والغياب والدرجات والإنذارات","suggestions":"رأيك بدون اسم",calc:"حاسبة علمية زي كاسيو + رسم ومعادلات"};
 app('<h2>تحبي تروحي فين؟</h2><div class="grid">'+pages.slice(1).map(function(p,i){return '<a class="tile'+(p[0]==="chat"?' wide':'')+'" style="animation-delay:'+i*.06+'s" href="#'+p[0]+'"><div class="bx">'+ic(p[2])+'</div><b>'+(p[0]==="chat"?"المساعد الذكي":p[1])+'</b><span>'+d[p[0]]+'</span></a>'}).join("")+'</div>')},

chat:function(){
 app('<h2>المساعد الذكي</h2><p class="sub">اختاري موضوع وسؤال وأنا أجاوبك.</p><div class="chat" id="ch"></div><div class="chips" id="cc"></div><div class="cbar"><input id="ci" placeholder="أو اكتبي سؤالك هنا" autocomplete="off"><button class="btn" id="cs" aria-label="إرسال">'+ic("send")+'</button></div>');
 function add(t,w){var b=document.createElement("div");b.className="bub "+w;b.textContent=t;$("ch").appendChild(b);return b}
 function chip(t,f){var c=document.createElement("button");c.className="chip";c.textContent=t;c.onclick=f;$("cc").appendChild(c)}
 function end(){$("cc").scrollIntoView({block:"end"})}
 function menu(){$("cc").innerHTML="";Object.keys(FAQ).forEach(function(k){chip(k,function(){add(k,"me");add("تمام، اختاري السؤال اللي عايزاه:","bot");qs(k)})});end()}
 function qs(k){$("cc").innerHTML="";FAQ[k].forEach(function(x){chip(x[0],function(){add(x[0],"me");add(x[1],"bot");qs(k)})});chip("رجوع للمواضيع",function(){menu()});end()}
 add("مرحباً بكِ يا صديقتي، أنا شات بوت مساعد ذكي، تم تصميمي من مدرسة دكتور أحمد زويل. اختاري موضوع من تحت وأنا أجاوبك.","bot");menu();
 function send(){var i=$("ci"),t=i.value.trim();if(!t)return;i.value="";add(t,"me");
  if(!CHAT_API){add("اختاري سؤال من الأزرار اللي تحت.","bot");end();return}
  var w=add("...","bot");end();
  tf(CHAT_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:t,history:chatHist.slice(-10)})}).then(function(r){return r.json()}).then(function(d){var r=d.reply||"معلش، حصلت مشكلة. جرّبي تاني.";w.textContent=r;chatHist.push({role:"user",text:t},{role:"model",text:r});end()}).catch(function(){w.textContent="معلش، مقدرتش أرد دلوقتي. اختاري سؤال من الأزرار.";end()})}
 $("cs").onclick=send;$("ci").onkeydown=function(e){if(e.key==="Enter")send()}},

platforms:function(){
 var FK="fav_platforms",fav=[];try{fav=JSON.parse(localStorage.getItem(FK)||"[]")}catch(e){}
 var cat="all",q="";
 var CATS=[["all","الكل"],["fav","المفضلة"],["math","رياضيات وعلوم"],["lang","لغات"],["skill","مهارات وبرمجة"],["tool","أدوات مذاكرة"]];
 // [id, تصنيف, اسم, وصف, رابط, أيقونة, لون, بلد]
 var INTL=[
  ["khan","math","Khan Academy","شرح مجاني للرياضيات والعلوم بالفيديو والتمارين","https://www.khanacademy.org/","play","linear-gradient(135deg,#14bf96,#0b8f6f)","USA"],
  ["geo","math","GeoGebra","رياضيات وهندسة تفاعلية ترسمي بيها وتجربي","https://www.geogebra.org/","layers","linear-gradient(135deg,#6557d2,#9a8cf5)","AT"],
  ["desmos","math","Desmos","آلة حاسبة ورسم بياني أونلاين","https://www.desmos.com/calculator","layers","linear-gradient(135deg,#2e8b57,#6fcf97)","USA"],
  ["phet","math","PhET","تجارب علوم وفيزياء افتراضية بالعربي","https://phet.colorado.edu/ar/","globe","linear-gradient(135deg,#f59e0b,#f97316)","USA"],
  ["duo","lang","Duolingo","تعلّمي لغة جديدة في ١٠ دقايق باليوم","https://www.duolingo.com/","lang","linear-gradient(135deg,#58cc02,#3ea000)","USA"],
  ["bbc","lang","BBC Learning English","دروس إنجليزي ونطق من بي بي سي","https://www.bbc.co.uk/learningenglish","lang","linear-gradient(135deg,#bb1919,#e8505b)","UK"],
  ["bc","lang","British Council Kids","ألعاب وقصص لتحسين الإنجليزي","https://learnenglishkids.britishcouncil.org/","book","linear-gradient(135deg,#1d4ed8,#60a5fa)","UK"],
  ["cour","skill","Coursera","كورسات جامعية دولية بشهادات","https://www.coursera.org/","cap","linear-gradient(135deg,#0056d2,#2a8bf2)","USA"],
  ["edx","skill","edX","كورسات من هارفارد وMIT وغيرهم","https://www.edx.org/","cap","linear-gradient(135deg,#02262b,#0e7c86)","USA"],
  ["scr","skill","Scratch","اتعلمي البرمجة بالبلوكات وسوّي ألعابك","https://scratch.mit.edu/","play","linear-gradient(135deg,#ff8c1a,#ffbf00)","MIT"],
  ["code","skill","Code.org","ساعة برمجة وكورسات للمبتدئين","https://code.org/","layers","linear-gradient(135deg,#00adbc,#006b75)","USA"],
  ["ted","tool","TED-Ed","فيديوهات قصيرة بتفتّح العقل","https://ed.ted.com/","play","linear-gradient(135deg,#e62b1e,#ff6a5c)","USA"],
  ["quiz","tool","Quizlet","بطاقات مراجعة واختبارات ذاتية","https://quizlet.com/","file","linear-gradient(135deg,#4255ff,#8b97ff)","USA"],
  ["gcl","tool","Google Classroom","فصلك الدراسي أونلاين","https://classroom.google.com/","school","linear-gradient(135deg,#0f9d58,#4cc38a)","USA"]
 ];
 function pt(u,ico,name,desc,bg,cls){return '<a class="ptile'+(cls||"")+'" href="'+u+'" target="_blank" rel="noopener noreferrer" aria-label="فتح '+name+'"><div class="pi" style="background:'+bg+'">'+ic(ico)+'</div><div><b>'+name+'</b><span class="d">'+desc+'</span></div><span class="go">'+ic("ext")+'</span></a>'}
 function saveF(){try{localStorage.setItem(FK,JSON.stringify(fav))}catch(e){}}
 function xt(x){var on=fav.indexOf(x[0])>-1;return '<div class="xt"><a class="xa" href="'+x[4]+'" target="_blank" rel="noopener noreferrer" aria-label="فتح '+esc(x[2])+'"><div class="pi" style="background:'+x[6]+'">'+ic(x[5])+'</div><div class="xb"><b>'+esc(x[2])+'</b><span class="d">'+esc(x[3])+'</span><em class="cn">'+esc(x[7])+'</em></div></a><button class="star'+(on?' on':'')+'" data-id="'+x[0]+'" aria-pressed="'+on+'" aria-label="'+(on?'إزالة من المفضلة':'إضافة للمفضلة')+'">'+(on?'★':'☆')+'</button></div>'}
 function draw(){
  var r=INTL.filter(function(x){return (cat==="all"||(cat==="fav"?fav.indexOf(x[0])>-1:x[1]===cat))&&(!q||(x[2]+" "+x[3]).toLowerCase().indexOf(q)>-1)});
  $("xl").innerHTML=r.length?r.map(xt).join(""):empty("search",cat==="fav"&&!q?"لسه مفيش مفضلة. اضغطي النجمة جنب أي منصة.":"مفيش نتيجة، جرّبي كلمة تانية.");
  $("xc").innerHTML=CATS.map(function(c){return '<button class="chip'+(c[0]===cat?' on':'')+'" data-c="'+c[0]+'">'+c[1]+(c[0]==="fav"?' ('+fav.length+')':'')+'</button>'}).join("");
 }
 app('<h2>المنصات التعليمية</h2><p class="sub">اضغطي على المنصة وهتفتحلك مباشرة.</p>'
  +'<div class="stats"><div><b>'+(INTL.length+3)+'</b><span>منصة</span></div><div><b>'+INTL.length+'</b><span>دولية</span></div><div><b>'+(CATS.length-2)+'</b><span>تصنيفات</span></div></div>'
  +'<div class="sec">منصتنا</div>'+pt(SCHOOL_URL,"school","منصة المدرسة","نظام المدرسة الذكي في مكان واحد","linear-gradient(135deg,#6c3fd1,#ff6fa5)"," school")
  +'<div class="sec">المنصة التعليمية</div>'+pt(SPRIX_URL,"layers","اسبريكس","بوابة اسبريكس التعليمية","rgba(255,255,255,.22)"," feat")
  +'<div class="sec">مصادر مصرية</div>'+pt(LIB_URL,"lib","المكتبة الإلكترونية","كتب الطالب الرسمية من وزارة التربية والتعليم","linear-gradient(135deg,#18b394,#0f8f77)")
  +'<div class="sec">🌍 المنصات الدولية</div><input id="xs" class="xs" type="search" placeholder="ابحثي عن منصة..." aria-label="بحث في المنصات" autocomplete="off"><div class="chips xcs" id="xc"></div><div id="xl"></div>');
 draw();
 $("xs").oninput=function(){q=this.value.trim().toLowerCase();draw()};
 $("xc").onclick=function(e){var b=e.target.closest("button[data-c]");if(!b)return;cat=b.dataset.c;draw()};
 $("xl").onclick=function(e){var b=e.target.closest("button.star");if(!b)return;var i=fav.indexOf(b.dataset.id);if(i>-1)fav.splice(i,1);else fav.push(b.dataset.id);saveF();draw()}},

translate:function(){
 var L=[["ar","العربية"],["en","English"],["fr","Français"],["de","Deutsch"],["es","Español"],["it","Italiano"],["tr","Türkçe"],["ru","Русский"],["zh-CN","中文"],["ja","日本語"]];
 var o=function(s){return L.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===s?' selected':'')+'>'+x[1]+'</option>'}).join("")};
 app('<h2>المترجم</h2><p class="sub">اكتبي النص واختاري اللغات وهترجمهولك.</p><div class="card col"><div class="tr"><div><label for="tf">من</label><select id="tf"><option value="auto" selected>تلقائي (اكتشاف اللغة)</option>'+o("")+'</select></div><button class="tbtn" id="tw" type="button" aria-label="عكس اللغتين">'+ic("swap")+'</button><div><label for="tt">إلى</label><select id="tt">'+o("ar")+'</select></div></div><label for="tx" style="display:block;margin-top:10px">النص</label><textarea id="tx" rows="4" maxlength="500" dir="auto" placeholder="اكتبي هنا..."></textarea><div class="cc2"><span id="tn">0</span>/500</div><button class="btn" id="tg">ترجمة</button></div><div class="card col"><div class="m">الترجمة</div><div class="out" id="to" dir="auto" aria-live="polite">—</div><div class="acts"><button class="btn alt" id="tcp">'+ic("copy")+'نسخ</button><button class="btn alt" id="tsp">'+ic("speak")+'استماع</button></div><p class="msg" id="tm"></p></div>');
 $("tx").oninput=function(){$("tn").textContent=this.value.length};
 $("tw").onclick=function(){var a=$("tf").value;if(a==="auto")a=window.dl||"en";if(!$("tt").querySelector('option[value="'+a+'"]'))a="en";$("tf").value=$("tt").value;$("tt").value=a;var t=$("to").textContent;if(t&&t!=="—"&&t!=="جاري الترجمة..."){$("tx").value=t;$("tn").textContent=t.length;$("to").textContent="—"}};
 $("tg").onclick=function(){var q=$("tx").value.trim(),m=$("tm");m.textContent="";if(!q)return;var f=$("tf").value,t=$("tt").value;
  if(f===t){$("to").textContent=q;return}
  $("to").textContent="جاري الترجمة...";
  fetch("https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl="+encodeURIComponent(f)+"&tl="+encodeURIComponent(t)+"&q="+encodeURIComponent(q)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
   var s=d[0].map(function(x){return x[0]||""}).join("");if(!s)throw 0;window.dl=d[2];$("to").textContent=s}).catch(function(){
   fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(q)+"&langpair="+encodeURIComponent((f==="auto"?"en":f)+"|"+t)).then(function(r){return r.json()}).then(function(d){
    if(String(d.responseStatus)!=="200"||!d.responseData)throw 0;$("to").textContent=d.responseData.translatedText}).catch(function(){$("to").textContent="—";m.textContent="مقدرتش أترجم دلوقتي. اتأكدي من الإنترنت وجرّبي تاني."})})};
 $("tcp").onclick=function(){var t=$("to").textContent;if(!t||t==="—")return;var m=$("tm");(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){m.textContent="تم النسخ."}).catch(function(){m.textContent="مقدرتش أنسخ، حدّديه وانسخيه بإيدك."})};
 $("tsp").onclick=function(){var t=$("to").textContent;if(!t||t==="—"||!window.speechSynthesis)return;var u=new SpeechSynthesisUtterance(t);u.lang=$("tt").value;speechSynthesis.cancel();speechSynthesis.speak(u)}},

books:function(){
 app('<h2>بنك الكتب الخارجية</h2><p class="sub">اختاري الكتاب، ومس كريمة هتنسّق الاستلام بسرية تامة.</p><div id="bl"><p class="m">جاري التحميل...</p></div><div class="card col"><div class="t">عندك كتاب من السنة اللي فاتت؟</div><label for="bt">اسم الكتاب</label><input id="bt" placeholder="مثال: كتاب الامتحان - عربي"><label for="bg">الصف</label><select id="bg"><option>سنة أولى</option><option>سنة ثانية</option><option>سنة ثالثة</option></select><label for="bd">اسمك الأول (اختياري، علشان تظهري في لوحة الشرف)</label><input id="bd"><button class="btn" id="badd">أتبرع بالكتاب</button><p class="msg" id="bm"></p></div>');
 get("books").then(function(rows){var g={};rows.forEach(function(r){if(!r.title||r.status==="taken")return;var k=r.title+"|"+(r.grade||"");g[k]=g[k]||{t:r.title,gr:r.grade,n:0};g[k].n++});
  var ks=Object.keys(g);$("bl").innerHTML=ks.length?ks.map(function(k){var b=g[k];return '<div class="card"><div><div class="t">'+esc(b.t)+'</div><div class="m">'+esc(b.gr)+' · <span class="cnt">متاح '+b.n+'</span></div></div><a class="btn" target="_blank" rel="noopener" href="'+wa("السلام عليكم يا مس كريمة 🌸\nأنا عايزة أطلب كتاب:\n📘 "+b.t+"\nممكن ننسّق الاستلام؟ شكراً ليكي 💜")+'">طلب الكتاب</a></div>'}).join(""):empty("book","لسه مفيش كتب. كوني أول من يتبرع.")}).catch(function(){$("bl").innerHTML=err});
 $("badd").onclick=function(){var t=$("bt").value.trim(),m=$("bm");if(!t){m.textContent="اكتبي اسم الكتاب الأول.";return}var gr=$("bg").value;
  window.open(wa("السلام عليكم يا مس كريمة 🌸\nأنا عايزة أتبرع بكتاب:\n📘 الكتاب: "+t+"\n🎓 الصف: "+gr+"\nممكن ننسّق الاستلام؟ شكراً ليكي 💜"),"_blank");
  post("books",{title:t,grade:gr,status:"available",added:today(),donor:$("bd").value.trim()}).then(function(){m.textContent="شكراً يا سفيرة الخير! كمّلي مع مس كريمة على واتساب.";setTimeout(V.books,1500)}).catch(function(){m.textContent="فتحنالك واتساب مع مس كريمة. كمّلي معاها هناك."})}},

"lost-found":function(){
 app('<h2>سوق المفقودات</h2><p class="sub">سجّلي مواصفات الشيء، ومس كريمة هتساعدك في استلامه.</p><div class="card col"><label for="lk">النوع</label><select id="lk"><option>ضاع مني</option><option>لقيته</option></select><label for="lt">الوصف</label><input id="lt" placeholder="مثال: مقلمة زرقاء"><button class="btn" id="ladd">إضافة</button></div><div id="ll"><p class="m">جاري التحميل...</p></div>');
 get("lost").then(function(r){r=r.filter(function(x){return x.desc}).reverse();$("ll").innerHTML=r.length?r.map(function(x){return '<div class="card"><div><span class="badge">'+esc(x.type)+'</span><div class="t">'+esc(x.desc)+'</div></div><a class="btn alt" target="_blank" rel="noopener" href="'+wa("السلام عليكم يا مس كريمة 🌸\nأنا شوفت إعلان في المفقودات وعايزة أسأل عنه:\n🔎 "+x.desc+"\nشكراً ليكي 💜")+'">مس كريمة</a></div>'}).join(""):empty("search","مفيش مفقودات دلوقتي.")}).catch(function(){$("ll").innerHTML=err});
 $("ladd").onclick=function(){var v=$("lt").value.trim();if(!v)return;var k=$("lk").value;window.open(wa("السلام عليكم يا مس كريمة 🌸\n"+(k==="لقيته"?"أنا لقيت حاجة وعايزة أسلّمها لصاحبتها:":"أنا ضاع مني حاجة:")+"\n🔎 "+v+"\n"+(k==="لقيته"?"ممكن ننسّق التسليم؟":"ممكن تساعديني ألاقيها؟")+" شكراً ليكي 💜"),"_blank");post("lost",{type:k,desc:v,date:today()}).then(V["lost-found"]).catch(function(){})}},

"study-share":function(){
 app('<h2>بنك الملخصات والملزمات</h2><p class="sub">ارفعي الملخص على جوجل درايف وانشري رابطه هنا.</p><div class="card col"><label for="ut">عنوان الملخص</label><input id="ut"><label for="us">المادة</label><select id="us"><option>عربي</option><option>إنجليزي</option><option>رياضيات</option><option>علوم</option><option>دراسات</option><option>أخرى</option></select><label for="ul">رابط الملف (يبدأ بـ https)</label><input id="ul" type="url" dir="ltr"><button class="btn" id="uadd">نشر الملخص</button><p class="msg" id="um"></p></div><div id="ml"><p class="m">جاري التحميل...</p></div>');
 get("summaries").then(function(r){r=r.filter(function(x){return x.title&&/^https:\/\//.test(x.link||"")}).reverse();$("ml").innerHTML=r.length?r.map(function(x){return '<div class="card"><div><div class="t">'+esc(x.title)+'</div><div class="m">'+esc(x.subject)+'</div></div><a class="btn" target="_blank" rel="noopener noreferrer" href="'+esc(x.link)+'">فتح</a></div>'}).join(""):empty("file","لسه مفيش ملخصات. انشري أول ملخص.")}).catch(function(){$("ml").innerHTML=err});
 $("uadd").onclick=function(){var t=$("ut").value.trim(),l=$("ul").value.trim(),m=$("um");if(!t||!/^https:\/\//.test(l)){m.textContent="اكتبي العنوان ورابط صحيح يبدأ بـ https.";return}
  post("summaries",{title:t,subject:$("us").value,link:l,date:today()}).then(function(){V["study-share"]()}).catch(function(){m.textContent="حصلت مشكلة، جرّبي تاني."})}},

leaderboard:function(){
 app('<h2>لوحة الشرف الرقمية</h2><p class="sub">سفيرات الخير حسب عدد الكتب المتبرع بها (١٠ نقاط لكل كتاب).</p><div id="lb"><p class="m">جاري التحميل...</p></div>');
 get("books").then(function(rows){var c={};rows.forEach(function(r){var n=(r.donor||"").trim();if(n)c[n]=(c[n]||0)+1});
  var a=Object.keys(c).sort(function(x,y){return c[y]-c[x]}).slice(0,10);
  $("lb").innerHTML=a.length?a.map(function(n,i){return '<div class="card"><div class="rk"><div class="rank">'+(i+1)+'</div><div><div class="t">'+esc(n)+'</div><div class="m">'+c[n]*10+' نقطة تميز</div></div></div>'+(i===0?'<span class="badge">سفيرة الخير</span>':'')+'</div>'}).join(""):empty("trophy","لسه مفيش ترتيب. تبرعي بكتاب واكتبي اسمك، وهتظهري هنا.")}).catch(function(){$("lb").innerHTML=err})},

focus:function(){
 var P=[[25,5],[45,10],[50,10]];
 app('<h2>جلسة المذاكرة</h2><p class="sub">ذاكري بتركيز وبعدها خدي راحة. التايمر بيكمّل حتى لو خرجتي من الصفحة.</p><div class="card col fcard"><div class="fmodes"><button data-m="focus">مذاكرة</button><button data-m="rest">راحة</button></div><div class="fpre" id="fp">'+P.map(function(p){return '<button data-p="'+p[0]+'-'+p[1]+'">'+p[0]+' / '+p[1]+'</button>'}).join("")+'</div><div class="fr focus" id="fr"><div class="fi"><div class="fmm" id="fm"></div><div class="ft" id="ft" dir="ltr">25:00</div></div></div><label for="fs">بذاكر إيه؟ (اكتبي اسم المادة)</label><input id="fs" list="fsl" placeholder="مثال: عربي" maxlength="30" autocomplete="off" dir="auto" value="'+esc(FS.subj)+'"><datalist id="fsl">'+allSubj(["عربي","إنجليزي","رياضيات","علوم","دراسات"]).map(function(x){return '<option value="'+esc(x)+'">'}).join("")+'</datalist><div class="fbtns"><button class="btn" id="fgo">ابدئي</button><button class="btn alt" id="frs">إعادة</button><button class="btn alt" id="fsk">تخطّي</button></div><p class="msg" id="fmsg" aria-live="polite"></p></div><div class="sec">إنجازك</div><div id="fst"></div>');
 fsPaint();fsStats();
 $("fgo").onclick=function(){$("fmsg").textContent="";FS.run?fsPause():fsStart()};
 $("frs").onclick=function(){fsPause();FS.left=FS.d[FS.mode]*60;fsPaint()};
 $("fsk").onclick=function(){fsSet(FS.mode==="focus"?"rest":"focus")};
 $("fs").oninput=function(){FS.subj=this.value.trim();fsPaint()};$("fs").onchange=function(){addSubj(this.value)};
 document.querySelector(".fmodes").onclick=function(e){var b=e.target.closest("button[data-m]");if(b)fsSet(b.dataset.m)};
 $("fp").onclick=function(e){var b=e.target.closest("button[data-p]");if(!b)return;if(FS.run){$("fmsg").textContent="أوقفي التايمر الأول علشان تغيّري المدة.";return}var a=b.dataset.p.split("-");FS.d={focus:+a[0],rest:+a[1]};FS.left=FS.d[FS.mode]*60;fsPaint()}},

cards:function(){
 var cat="all",idx=Math.floor(Date.now()/864e5)%MC.length;
 var CT=[["all","الكل"],["push","تحفيز"],["exam","قبل الامتحان"],["tired","لو تعبانة"],["tips","نصايح"]];
 function mc(i,big){var c=MC[i];return '<div class="mc'+(big?' big':'')+'" style="background:'+MG[i%MG.length]+'"><span class="mq">“</span><p>'+esc(c[1])+'</p><div class="mf"><em>'+MT[c[0]]+'</em><div><button data-cp="'+i+'">نسخ</button><a target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(c[1]+"\n— Zewail Smart 💜")+'">واتساب</a></div></div></div>'}
 function draw(){$("cd").innerHTML='<div class="sec">بطاقة اليوم</div>'+mc(idx,1)+'<div class="acts"><button class="btn alt" id="cr">'+ic("swap")+'بطاقة عشوائية</button></div>';
  $("cc2").innerHTML=CT.map(function(c){return '<button class="chip'+(c[0]===cat?' on':'')+'" data-c="'+c[0]+'">'+c[1]+'</button>'}).join("");
  $("cl").innerHTML=MC.map(function(c,i){return cat==="all"||c[0]===cat?mc(i):""}).join("");
  $("cr").onclick=function(){idx=Math.floor(Math.random()*MC.length);draw()}}
 app('<h2>بطاقات تحفيزية</h2><p class="sub">كلام حلو يفكّرك إنك قدّها. انسخي البطاقة أو ابعتيها لصاحبتك.</p><div id="cd"></div><div class="chips xcs" id="cc2"></div><div id="cl"></div>');
 draw();
 $("cc2").onclick=function(e){var b=e.target.closest("button[data-c]");if(!b)return;cat=b.dataset.c;draw()};
 $("app").onclick=function(e){var b=e.target.closest("button[data-cp]");if(!b)return;var t=MC[+b.dataset.cp][1];(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent="تم ✓"}).catch(function(){b.textContent="حدّديها وانسخي"})}},

ig:function(){
 var SUBJ=["Mathematics","Biology","Chemistry","Physics","English","Computer Science","Business","Arabic"],
 TOP={Mathematics:["Number","Algebra","Functions & graphs","Geometry","Mensuration","Trigonometry","Vectors & transformations","Probability","Statistics"],
  Biology:["Cells","Movement in & out of cells","Enzymes","Plant nutrition","Human nutrition","Transport","Respiration","Coordination & response","Reproduction","Inheritance","Ecology"],
  Chemistry:["States of matter","Atoms & bonding","Stoichiometry","Electrochemistry","Energetics","Rates of reaction","Acids, bases & salts","Periodic Table","Metals","Organic chemistry"],
  Physics:["Motion","Forces","Energy","Thermal physics","Waves","Light","Electricity","Magnetism","Atomic physics"],
  English:["Reading comprehension","Directed writing","Narrative writing","Descriptive writing","Summary","Grammar & vocabulary"],
  "Computer Science":["Data representation","Algorithms","Programming","Databases","Networks","Security"],Business:[],Arabic:[]},
 INT=[0,0,1,3,7,14],
 TABS=[["track","متابعة المنهج"],["fc","بطاقات المراجعة"],["mk","درجاتي"],["ex","الامتحانات"],["cw","كلمات الأسئلة"]],
 WORDS=[["State / Name","اكتبي المعلومة مباشرة في جملة قصيرة. من غير شرح."],["Define","اكتبي المعنى بالظبط زي ما اتعلمتيه. الكلمات المفتاحية هي اللي بتاخد الدرجة."],["Give","اديني مثال أو سبب. إجابة قصيرة."],["Describe","قولي إيه اللي بيحصل أو شكله إيه. وصف بس من غير تفسير."],["Explain","اذكري إيه اللي حصل وليه حصل. استخدمي because / so / therefore."],["Compare","اذكري أوجه الشبه والاختلاف، وخلي الاتنين في نفس الجملة."],["Calculate","اكتبي القانون وخطوات الحل والوحدة. الخطوات بتجيب درجات حتى لو الناتج غلط."],["Suggest","استخدمي معلوماتك في موقف جديد. مفيش إجابة محفوظة."],["Deduce / Predict","استنتجي من المعطيات اللي قدامك."],["Outline","اذكري النقاط الرئيسية باختصار."],["Discuss","اعرضي أكتر من وجهة نظر، وبعدين خلّصي برأيك."],["Evaluate","قيّمي الإيجابيات والسلبيات وخدي قرار مبرر."],["Justify","اديني دليل يثبت إجابتك."],["Sketch / Draw","ارسمي بشكل تقريبي مع كتابة العناصر المهمة (labels)."]],
 tab="track",sj="Mathematics",mode="rev",rq=[],rv=false,qc=null,qo=[],qa=-1,qs={r:0,t:0};
 function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
 function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function sh(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
 function ad(n){var d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+f2(d.getMonth()+1)+"-"+f2(d.getDate())}
 function AS(){return allSubj(SUBJ)}
 function sin(id){return '<input id="'+id+'" list="igl" dir="auto" placeholder="اكتبي اسم المادة" maxlength="40" autocomplete="off">'}
 function chips(l,cur,at){return l.map(function(c){return '<button class="chip'+(c[0]===cur?' on':'')+'" data-a="'+at+'" data-v="'+esc(c[0])+'">'+c[1]+'</button>'}).join("")}
 function grade(p){var B=[[90,"A*"],[80,"A"],[70,"B"],[60,"C"],[50,"D"],[40,"E"],[30,"F"],[20,"G"]];for(var i=0;i<B.length;i++)if(p>=B[i][0])return B[i][1];return "U"}
 function reset(){var cd=ls("ig_c",[]);rq=sh(cd.filter(function(c){return c.due<=today()}).map(function(c){return c.id}));rv=false;qc=null;qs={r:0,t:0}}
 function newQ(){var cd=ls("ig_c",[]);if(cd.length<4){qc=null;return}qc=cd[Math.floor(Math.random()*cd.length)];qo=sh([qc].concat(sh(cd.filter(function(c){return c.id!==qc.id})).slice(0,3)));qa=-1}
 function vT(){var st=ls("ig_t",{}),cu=ls("ig_tc",{}),L=(TOP[sj]||[]).concat(cu[sj]||[]),m=st[sj]||{},sum=0;
  L.forEach(function(n){sum+=m[n]||0});var p=L.length?Math.round(sum/(L.length*3)*100):0,cl=["لسه","ضعيفة","متوسطة","قوية"];
  return '<div class="card col"><label for="igs">المادة</label><select id="igs" data-a="sj">'+AS().map(function(x){return '<option'+(x===sj?" selected":"")+'>'+esc(x)+'</option>'}).join("")+'</select><div class="t">إتقان المادة: '+p+'%</div><div class="gbar"><i style="width:'+p+'%"></i></div><p class="m">اضغطي على الموضوع علشان تغيّري مستواك فيه: لسه ← ضعيفة ← متوسطة ← قوية.</p></div>'
  +(L.length?'<div class="tps">'+L.map(function(n,i){var v=m[n]||0;return '<button class="tp s'+v+'" data-a="t" data-v="'+i+'"><span>'+esc(n)+'</span><em>'+cl[v]+'</em></button>'}).join("")+'</div>':empty("file","مفيش مواضيع للمادة دي. ضيفي مواضيعك."))
  +'<div class="card col"><label for="igsn">ضيفي مادة جديدة</label><input id="igsn" dir="auto" placeholder="اسم المادة" maxlength="40"><button class="btn" data-a="sa">إضافة المادة</button><label for="igtn">ضيفي موضوع للمادة دي</label><input id="igtn" placeholder="اسم الموضوع"><button class="btn" data-a="ta">إضافة</button></div>'}
 function vF(){var cd=ls("ig_c",[]),dn=cd.filter(function(c){return c.due<=today()}).length,ms=cd.filter(function(c){return c.box>=5}).length,ar="";
  if(mode==="rev"){var c=rq.length?cd.filter(function(x){return x.id===rq[0]})[0]:null;
   ar=c?'<div class="fcz"><small class="en">'+esc(c.s)+'</small><div class="fq">'+esc(c.f)+'</div>'+(rv?'<hr><div class="fa">'+esc(c.b)+'</div>':'')+'</div>'+(rv?'<div class="fbtns"><button class="btn alt" data-a="no">لسه مش حافظاها</button><button class="btn" data-a="ok">عرفتها ✓</button></div>':'<button class="btn wb" data-a="show">اظهري الإجابة</button>')+'<p class="m">باقي '+rq.length+' بطاقة في الجلسة دي.</p>':empty("trophy",cd.length?"خلّصتي كل بطاقات النهاردة 🎉 ارجعي بكرة.":"ضيفي أول بطاقة من تحت.")}
  else if(!qc)ar=empty("file","محتاجة ٤ بطاقات على الأقل علشان الاختبار.");
  else{ar='<div class="fcz"><small>اختاري الإجابة الصح · '+qs.r+'/'+qs.t+'</small><div class="fq">'+esc(qc.f)+'</div></div><div class="qos">'+qo.map(function(o,i){var k=qa<0?"":(o.id===qc.id?" ok":(i===qa?" bad":""));return '<button class="qo'+k+'" data-a="qa" data-v="'+i+'"'+(qa>-1?" disabled":"")+'>'+esc(o.b)+'</button>'}).join("")+'</div>'+(qa>-1?'<button class="btn wb" data-a="qn">السؤال اللي بعده</button>':"")}
  return '<div class="stats"><div><b>'+cd.length+'</b><span>بطاقة</span></div><div><b>'+dn+'</b><span>مستحقة النهاردة</span></div><div><b>'+ms+'</b><span>محفوظة</span></div></div><div class="chips xcs">'+chips([["rev","مراجعة"],["quiz","اختبار"]],mode,"fm")+'</div><div class="card col">'+ar+'</div>'
  +'<div class="card col"><div class="t">بطاقة جديدة</div><label for="igcs">المادة</label>'+sin("igcs")+'<label for="igcf">السؤال / الكلمة</label><input id="igcf" dir="auto"><label for="igcb">الإجابة</label><textarea id="igcb" rows="2" dir="auto"></textarea><button class="btn" data-a="ca">إضافة البطاقة</button></div>'
  +(cd.length?'<details class="card col"><summary class="t">كل البطاقات ('+cd.length+')</summary>'+cd.map(function(c){return '<div class="rw"><span dir="auto">'+esc(c.f)+'</span><button class="btn alt sm" data-a="cd" data-v="'+c.id+'" aria-label="حذف">✕</button></div>'}).join("")+'</details>':"")}
 function vM(){var pp=ls("ig_p",[]),g={},bars=pp.slice(-8);
  pp.forEach(function(x){g[x.s]=g[x.s]||{a:0,m:0};g[x.s].a+=x.g;g[x.s].m+=x.m});
  return '<div class="card col"><div class="t">سجّلي نتيجة ورقة</div><label for="igps">المادة</label>'+sin("igps")+'<label for="igpn">اسم الورقة</label><input id="igpn" placeholder="مثال: Paper 2 - May 2023"><div class="tr"><div><label for="igpg">درجتك</label><input id="igpg" type="number" min="0" inputmode="decimal"></div><div><label for="igpm">من</label><input id="igpm" type="number" min="1" inputmode="decimal"></div></div><button class="btn" data-a="pa">حفظ</button><p class="msg" id="igpe"></p></div>'
  +(Object.keys(g).length?'<div class="stats">'+Object.keys(g).map(function(k){var p=Math.round(g[k].a/g[k].m*100);return '<div><b>'+grade(p)+'</b><span class="en">'+esc(k)+' · '+p+'%</span></div>'}).join("")+'</div><p class="m">التقدير تقريبي حسب حدود افتراضية. الحدود الحقيقية بتتغير كل دورة.</p>'
  +'<div class="card col"><div class="t">آخر الأوراق</div><div class="wk">'+bars.map(function(x){var p=Math.round(x.g/x.m*100);return '<div><em>'+p+'</em><i style="height:'+Math.max(4,p*.8)+'px"></i><span class="en">'+esc(x.s.slice(0,4))+'</span></div>'}).join("")+'</div></div>'
  +pp.slice().reverse().map(function(x){return '<div class="card"><div><div class="t" dir="auto">'+esc(x.n)+'</div><div class="m"><span class="en">'+esc(x.s)+'</span> · '+x.g+'/'+x.m+' · '+grade(Math.round(x.g/x.m*100))+'</div></div><button class="btn alt sm" data-a="pd" data-v="'+x.id+'" aria-label="حذف">✕</button></div>'}).join(""):empty("trophy","لسه مفيش أوراق. سجّلي أول نتيجة وهتتابعي تقدمك."))}
 function vE(){var ex=ls("ig_e",[]),t0=new Date().setHours(0,0,0,0);
  ex=ex.map(function(x){x.d=Math.round((new Date(x.dt+"T00:00:00")-t0)/864e5);return x}).sort(function(a,b){return a.d-b.d});
  return '<div class="card col"><div class="t">ضيفي امتحان</div><label for="ige">المادة</label>'+sin("ige")+'<label for="igd">التاريخ</label><input id="igd" type="date"><button class="btn" data-a="ea">إضافة</button></div>'
  +(ex.length?ex.map(function(x){var c=x.d<0?"var(--muted)":x.d<=7?"var(--bad)":x.d<=30?"var(--gold)":"var(--mint)";return '<div class="card"><div class="cdn" style="--c:'+c+'"><b>'+(x.d<0?"—":x.d)+'</b><small>'+(x.d<0?"خلص":"يوم")+'</small></div><div style="flex:1"><div class="t en">'+esc(x.s)+'</div><div class="m">'+esc(x.dt)+(x.d>=0?' · ≈ '+x.d*3+' جلسة لو ٣ في اليوم':"")+'</div></div><button class="btn alt sm" data-a="ed" data-v="'+x.id+'" aria-label="حذف">✕</button></div>'}).join(""):empty("search","ضيفي مواعيد امتحاناتك وهتشوفي العد التنازلي."))}
 function vW(){return '<p class="m">فهم كلمة السؤال بيوفّر عليكي درجات كتير في IG.</p>'+WORDS.map(function(w){return '<details class="card col"><summary class="t en">'+w[0]+'</summary><p class="m" style="margin:6px 0 0">'+w[1]+'</p></details>'}).join("")}
 function draw(){$("igt").innerHTML=chips(TABS,tab,"tab");$("igl").innerHTML=AS().map(function(x){return '<option value="'+esc(x)+'">'}).join("");$("igv").innerHTML=({track:vT,fc:vF,mk:vM,ex:vE,cw:vW})[tab]()}
 app('<h2>مركز IG</h2><p class="sub">أدوات المذاكرة بتاعة منصات IG في مكان واحد. بياناتك بتتحفظ على جهازك.</p><datalist id="igl"></datalist><div id="igw"><div class="chips xcs" id="igt"></div><div id="igv"></div></div>');
 reset();draw();
 $("igw").onchange=function(e){if(e.target.dataset.a==="sj"){sj=e.target.value;draw()}};
 $("igw").onclick=function(e){var b=e.target.closest("button[data-a]");if(!b)return;var a=b.dataset.a,v=b.dataset.v,V2=function(i){return($(i).value||"").trim()},cd,x;
  if(a==="tab"){tab=v;if(v==="fc")reset()}
  else if(a==="t"){var st=ls("ig_t",{}),cu=ls("ig_tc",{}),L=(TOP[sj]||[]).concat(cu[sj]||[]),n=L[+v];st[sj]=st[sj]||{};st[sj][n]=((st[sj][n]||0)+1)%4;sv("ig_t",st)}
  else if(a==="sa"){var sn=V2("igsn");if(!sn)return;addSubj(sn);sj=sn}
  else if(a==="ta"){var nm=V2("igtn");if(!nm)return;var c2=ls("ig_tc",{});c2[sj]=(c2[sj]||[]).concat([nm]);sv("ig_tc",c2)}
  else if(a==="fm"){mode=v;if(v==="quiz")newQ()}
  else if(a==="show"){rv=true}
  else if(a==="ok"||a==="no"){cd=ls("ig_c",[]);x=cd.filter(function(c){return c.id===rq[0]})[0];if(x){if(a==="ok"){x.box=Math.min(5,(x.box||1)+1);x.due=ad(INT[x.box]);rq.shift()}else{x.box=1;x.due=today();rq.push(rq.shift())}sv("ig_c",cd)}rv=false}
  else if(a==="qa"){qa=+v;qs.t++;if(qo[qa].id===qc.id)qs.r++}
  else if(a==="qn"){newQ()}
  else if(a==="ca"){var f=V2("igcf"),bk=V2("igcb"),sb=V2("igcs");if(!f||!bk||!sb)return;addSubj(sb);cd=ls("ig_c",[]);x={id:Date.now()+Math.floor(Math.random()*999),s:sb,f:f,b:bk,box:1,due:today()};cd.push(x);sv("ig_c",cd);rq.push(x.id)}
  else if(a==="cd"){cd=ls("ig_c",[]).filter(function(c){return String(c.id)!==v});sv("ig_c",cd);rq=rq.filter(function(i){return String(i)!==v})}
  else if(a==="pa"){var gg=+$("igpg").value,mm=+$("igpm").value,ps=V2("igps");if(!ps){$("igpe").textContent="اكتبي اسم المادة.";return}if(!(mm>0)||gg<0||gg>mm||$("igpg").value===""){$("igpe").textContent="اكتبي الدرجة والدرجة النهائية صح.";return}addSubj(ps);var pp=ls("ig_p",[]);pp.push({id:Date.now(),s:ps,n:V2("igpn")||"Paper",g:gg,m:mm});sv("ig_p",pp)}
  else if(a==="pd"){sv("ig_p",ls("ig_p",[]).filter(function(p){return String(p.id)!==v}))}
  else if(a==="ea"){var dt=$("igd").value,es=V2("ige");if(!dt||!es)return;addSubj(es);var ee=ls("ig_e",[]);ee.push({id:Date.now(),s:es,dt:dt});sv("ig_e",ee)}
  else if(a==="ed"){sv("ig_e",ls("ig_e",[]).filter(function(p){return String(p.id)!==v}))}
  draw()}},

parent:function(){
 var PAPI="https://sheetdb.io/api/v1/qqdrgdnzgoacx",busy=false;
 var SCHOOL_DAYS=20,EXAM_MAX=20; // عدد أيام الدراسة في الشهر + الدرجة النهائية للاختبار الشهري (غيّريهم لو مختلفين)
 var RE={ // أسماء الأعمدة في الإكسل (أول عمود يطابق وقيمته مش #REF! هو اللي بيتاخد)
  name:[/اسم\s*(ال)?(طالب|تلميذ)/,/^(ال)?اسم$/],
  cls:[/^(ال)?فصل/,/^(ال)?صف/],
  grade:[/(اختبار|امتحان).*شهر/,/شهر.*(اختبار|امتحان|درجة)/,/درجة.*شهر/],
  fee:[/(إجمالي|اجمالي|قيمة|كل).*(مصروف|رسوم)/,/^(ال)?(مصروفات|رسوم)/],
  paid:[/(مدفوع|المسدد|مسدد|سداد|دفع)/],
  rest:[/(متبقي|المتبقي|باقي|الباقي)/],
  code:[/كود/,/code/i],
  fid:[/قومي.*(أب|اب|والد|ولي)/,/(أب|اب|والد|ولي).*(قومي|وطني)/,/(رقم|بطاقة).*(أب|والد|ولي)/],
  absent:[/(غياب.*شهر|شهر.*غياب)/,/^(اجمالي|إجمالي)\s*(ال)?غياب/,/^(عدد\s*)?(ايام|أيام)\s*(ال)?غياب/]};
 var CSS=".pc{background:var(--surface);border:1px solid var(--line);border-radius:24px;overflow:hidden;box-shadow:var(--sh);margin:14px 0;animation:pcin .5s ease both}"
 +".pc-h{display:flex;align-items:center;gap:14px;padding:18px;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;position:relative;overflow:hidden}"
 +".pc-h:after{content:'';position:absolute;inset-inline-end:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.14)}"
 +".pc-av{width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.25);display:grid;place-items:center;font-size:26px;font-weight:800;flex:none;border:2px solid rgba(255,255,255,.55)}"
 +".pc-h b{font-size:19px;line-height:1.45;display:block}.pc-h span{display:block;font-size:13px;opacity:.92}"
 +".pc-g{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px}"
 +".pc-t{background:var(--soft);border-radius:22px;padding:16px 8px 14px;text-align:center;animation:pcin .6s ease both}.pc-t.w{grid-column:1/-1}"
 +".pc-r{--v:0;--c:var(--mint);width:106px;height:106px;border-radius:50%;margin:0 auto 10px;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--v)*1%),var(--line) 0)}"
 +".pc-r i{font-style:normal;width:80px;height:80px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-size:21px;font-weight:800;color:var(--ink)}"
 +".pc-d{width:106px;height:106px;border-radius:50%;margin:0 auto 10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;font-size:38px;font-weight:800;box-shadow:0 6px 16px rgba(108,63,209,.3)}"
 +".pc-t small{display:block;color:var(--muted);font-size:13px;font-weight:700}"
 +".pc-bar{height:10px;border-radius:999px;background:var(--line);overflow:hidden;margin:10px 14px 0}.pc-bar i{display:block;height:100%;border-radius:999px;background:var(--c,var(--mint))}"
 +".pc-f{margin:0 14px 14px;background:var(--soft);border-radius:22px;padding:14px}.pc-f h4{margin:0 0 10px;font-size:16px}.pc-fr{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.pc-fr div{background:var(--surface);border-radius:14px;padding:8px 4px}.pc-fr b{display:block;font-size:17px}.pc-fr small{color:var(--muted);font-size:12px;font-weight:700}.pc-fp{display:inline-block;margin-top:10px;border-radius:999px;padding:0 12px;font-size:13px;font-weight:800;background:var(--c);color:#161616}"
 +"@keyframes pcin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}";
 if(!$("pst")){var st=document.createElement("style");st.id="pst";st.textContent=CSS;document.head.appendChild(st)}
 function dg(x){return String(x==null?"":x).replace(/[\u0660-\u0669]/g,function(c){return c.charCodeAt(0)-1632}).replace(/[\u06F0-\u06F9]/g,function(c){return c.charCodeAt(0)-1776})}
 function nd(x){return dg(x).replace(/\D/g,"").replace(/^0+/,"")}
 function ok(v){v=String(v==null?"":v).trim();return v!==""&&v.charAt(0)!=="#"}
 function pick(r,res){var ks=Object.keys(r);for(var i=0;i<res.length;i++)for(var j=0;j<ks.length;j++)if(res[i].test(ks[j])&&ok(r[ks[j]]))return r[ks[j]];return null}
 function num(v){var m=dg(v).replace(/٫/g,".").match(/-?\d+(\.\d+)?/);return m?parseFloat(m[0]):null}
 function js(u){return tf(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
 function tabs(){return js(PAPI+"/sheets").then(function(t){if(t&&!Array.isArray(t))t=t.sheets||Object.keys(t);return (t||[]).map(function(x){return typeof x==="string"?x:(x.name||x.title||"")}).filter(Boolean)}).catch(function(){return []})}
 function allRows(){return tabs().then(function(t){var u=t.length?t.map(function(n){return PAPI+"?sheet="+encodeURIComponent(n)}):[PAPI];
  return Promise.all(u.map(function(x){return js(x).then(function(r){return Array.isArray(r)?r:[]}).catch(function(){return []})})).then(function(a){return [].concat.apply([],a)})})}
 function dgt(v){v=dg(v).trim().replace(/[\s,،]/g,"");
  if(/^\d+(\.\d+)?e\+?\d+$/i.test(v)){var n=Number(v);if(isFinite(n))v=n.toFixed(0)}
  v=v.replace(/^(\d+)\.0+$/,"$1");return v.replace(/\D/g,"")}
 function find(rows,c,id){var C=nd(c);return rows.filter(function(r){var ks=Object.keys(r),
  ck=ks.filter(function(k){return RE.code.some(function(re){return re.test(k)})}),
  fk=ks.filter(function(k){return RE.fid.some(function(re){return re.test(k)})}),
  cv=ks.map(function(k){return nd(r[k])}),
  cvk=ck.map(function(k){return nd(r[k])}),
  fv=(fk.length?fk:ks).map(function(k){return dgt(r[k])});
  return (cvk.indexOf(C)>-1||cv.indexOf(C)>-1)&&fv.indexOf(id)>-1})}
 var DEBUG=true; // خليها false بعد ما المشكلة تتحل عشان التشخيص يختفي
 function diag(rows,c,id){var C=nd(c),hc=rows.filter(function(r){return Object.keys(r).some(function(k){return nd(r[k])===C})}).length,
  hi=rows.filter(function(r){return Object.keys(r).some(function(k){return dgt(r[k])===id})}).length,
  cols=rows[0]?Object.keys(rows[0]).join(" | "):"—";
  return '<p class="m">تشخيص: '+rows.length+' صف · الكود موجود في '+hc+' صف · الرقم القومي موجود في '+hi+' صف<br>الأعمدة: '+esc(cols)+'</p>'}
 function merge(base,rows,C){var o={};Object.keys(base).forEach(function(k){o[k]=base[k]});rows.forEach(function(x){if(x===base)return;var v=Object.keys(x).map(function(k){return nd(x[k])});if(v.indexOf(C)>-1)Object.keys(x).forEach(function(k){if(!ok(o[k])&&ok(x[k]))o[k]=x[k]})});return o}
 function col(p){return p>=85?"var(--mint)":p>=50?"var(--gold)":"var(--bad)"}
 function colAbs(p){return p<=10?"var(--mint)":p<=20?"var(--gold)":"var(--bad)"}
 function card(r){
  var name=pick(r,RE.name)||"الطالبة",cls=pick(r,RE.cls),mon="";try{mon=new Date().toLocaleDateString("ar-EG",{month:"long"})}catch(e){}
  var gv=pick(r,RE.grade),g=null,mx=EXAM_MAX;
  if(gv!=null){var s=dg(gv),sl=s.split("/");g=num(sl[0]);if(sl.length>1&&num(sl[1]))mx=num(sl[1])}
  var av=pick(r,RE.absent),ab=av==null?null:num(av);
  var gp=g==null?0:Math.max(0,Math.min(100,Math.round(g/mx*100)));
  var rp=ab==null?0:Math.max(0,Math.min(100,Math.round(ab/SCHOOL_DAYS*1000)/10));
  var fv=pick(r,RE.fee),pv=pick(r,RE.paid),rv=pick(r,RE.rest),fe=fv==null?null:num(fv),pa=pv==null?null:num(pv),re=rv==null?null:num(rv);
  if(fe==null&&pa!=null&&re!=null)fe=pa+re;if(re==null&&fe!=null&&pa!=null)re=Math.max(0,fe-pa);if(pa==null&&fe!=null&&re!=null)pa=Math.max(0,fe-re);
  var fm=function(n){return n==null?"—":n.toLocaleString("ar-EG")+" ج"},fp=fe>0&&pa!=null?Math.max(0,Math.min(100,Math.round(pa/fe*100))):0,fc=re===0?"var(--mint)":fp>=50?"var(--gold)":"var(--bad)";
  var fh=(fe==null&&pa==null&&re==null)?"":'<div class="pc-f" style="--c:'+fc+'"><h4>💰 المصروفات</h4><div class="pc-fr"><div><b>'+fm(fe)+'</b><small>الإجمالي</small></div><div><b>'+fm(pa)+'</b><small>المدفوع</small></div><div><b>'+fm(re)+'</b><small>المتبقي</small></div></div><div class="pc-bar" style="margin:12px 0 0"><i style="width:'+fp+'%;background:'+fc+'"></i></div><span class="pc-fp">'+(re===0?"تم السداد بالكامل ✓":"تم سداد "+fp+"%")+'</span></div>';
  return '<div class="pc"><div class="pc-h"><div class="pc-av">'+esc(String(name).trim().charAt(0))+'</div><div><b>'+esc(name)+'</b><span>'+esc((cls?cls+" · ":"")+(mon?"شهر "+mon:""))+'</span></div></div>'
  +'<div class="pc-g">'
  +'<div class="pc-t"><div class="pc-r" style="--v:'+gp+';--c:'+col(gp)+'"><i>'+(g==null?"—":esc(g+"/"+mx))+'</i></div><small>درجة الاختبار الشهري</small></div>'
  +'<div class="pc-t"><div class="pc-d">'+(ab==null?"—":esc(ab))+'</div><small>أيام الغياب</small></div>'
  +'<div class="pc-t w"><div class="pc-r" style="--v:'+rp+';--c:'+colAbs(rp)+'"><i>'+(ab==null?"—":esc(rp+"%"))+'</i></div><small>نسبة الغياب في الشهر</small><div class="pc-bar" style="--c:'+colAbs(rp)+'"><i style="width:'+rp+'%"></i></div></div>'
  +'</div>'+fh+'</div>'}
 app('<h2>متابعة ولي الأمر</h2><p class="sub">اكتب كود الطالبة والرقم القومي للأب (14 رقم) المسجل في المدرسة.</p><div class="card col"><label for="pc">كود الطالبة</label><input id="pc" dir="ltr" inputmode="numeric" autocomplete="off"><label for="pp">الرقم القومي للأب (14 رقم)</label><input id="pp" dir="ltr" inputmode="numeric" maxlength="14" autocomplete="off"><button class="btn" id="pg">عرض</button></div><div id="pr" aria-live="polite"></div>');
 var BAD='<p class="note">البيانات غير متطابقة</p>';
 $("pg").onclick=function(){if(busy)return;var c=dg($("pc").value).trim(),nid=dg($("pp").value).replace(/\D/g,""),o=$("pr"),b=$("pg");
  if(!c||nid.length!==14){o.innerHTML=BAD;return}
  busy=true;b.disabled=true;b.textContent="جاري التحميل...";o.innerHTML='<p class="m">جاري التحميل...</p>';
  allRows().then(function(rows){var r=find(rows,c,nid);o.innerHTML=r.length?r.map(function(x){return card(merge(x,rows,nd(c)))}).join(""):BAD+(DEBUG?diag(rows,c,nid):"")}).catch(function(){o.innerHTML='<p class="note">مش قادرة أوصل لجدول البيانات دلوقتي. جرّبي تاني.</p>'}).then(function(){busy=false;b.disabled=false;b.textContent="عرض"})}},

calc:function(){window.renderCalc()},

suggestions:function(){app('<h2>صندوق المقترحات السري</h2><p class="sub">اسمك مش بيتسجل خالص.</p><div class="card col"><label for="st">رسالتك</label><textarea id="st" rows="5"></textarea><button class="btn" id="ss">إرسال</button><p class="msg" id="sm"></p></div>');
 $("ss").onclick=function(){var t=$("st").value.trim();if(!t)return;post("suggestions",{text:t,date:today()}).then(function(){$("st").value="";$("sm").textContent="وصلت رسالتك، شكراً يا صديقتي."}).catch(function(){$("sm").textContent="حصلت مشكلة، جرّبي تاني."})}}
};

function route(){var r=(location.hash||"#home").slice(1);
 if(r.indexOf("admin")===0){showView("admin");return}
 showView("site");
 if(!V[r])r="home";
 $("nav").innerHTML=pages.map(function(p){return '<a href="#'+p[0]+'"'+(p[0]===r?' class="on" aria-current="page"':'')+'>'+ic(p[2])+p[1]+'</a>'}).join("");
 var fb=$("fab");if(fb)fb.style.display=r==="chat"?"none":"grid";window.scrollTo(0,0);V[r]()}
function greet(){var n=new Date(),h=n.getHours(),g,i;
 if(h>=5&&h<12){g="صباح الخير";i="sun"}else if(h>=12&&h<18){g="نهارك سعيد";i="sun"}else{g="مساء الخير";i="moon"}
 $("gr").textContent=g+" يا صديقتي";$("gi").innerHTML='<use href="#i-'+i+'"/>';
 var ds="";try{ds=n.toLocaleDateString("ar-EG",{weekday:"long",day:"numeric",month:"long"})}catch(e){}
 $("gd").textContent=(ds?ds+" · ":"")+"مكانك لكل اللي محتاجاه في المدرسة"}
function isDark(){var t=document.documentElement.getAttribute("data-theme");return t?t==="dark":window.matchMedia("(prefers-color-scheme:dark)").matches}
$("tb").onclick=function(){var n=isDark()?"light":"dark";document.documentElement.setAttribute("data-theme",n);try{localStorage.setItem("theme",n)}catch(e){}};
greet();setInterval(greet,60000);
window.addEventListener("hashchange",route);route();

/* ===== لوحة الإدارة ===== */
(function () {
"use strict";
var API = (window.HUDUR && window.HUDUR.API) || "";
var $ = function (i) { return document.getElementById(i); };
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
var S = { token: null, user: null, settings: null, tab: "dash", students: null, memo: {} };
var PAGE = 25;
try { S.token = sessionStorage.getItem("hudur_t"); S.user = JSON.parse(sessionStorage.getItem("hudur_u") || "null"); } catch (e) {}

// ---------- أدوات ----------
function toast(m) { var t = $("a_toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("show"); }, 3500); }
function dow(d) { return new Date(d + "T00:00:00Z").getUTCDay(); }
function addDays(d, n) { var t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
function cairoToday() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date()); }
function monthEnd(m) { return addDays(addDays(m + "-28", 4).slice(0, 7) + "-01", -1); }
function fmt(n) { return n == null ? "—" : String(n); }
function debounce(f, ms) { var h; return function () { var a = arguments; clearTimeout(h); h = setTimeout(function () { f.apply(null, a); }, ms); }; }

async function api(path, o) {
  o = o || {};
  var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, o.timeout || 25000);
  try {
    var h = { "Content-Type": "application/json" };
    if (S.token) h.Authorization = "Bearer " + S.token;
    var r = await fetch(API + path, { method: o.method || "GET", headers: h, body: o.body ? JSON.stringify(o.body) : undefined, signal: ctl.signal });
    var j = {}; try { j = await r.json(); } catch (e) {}
    if (r.status === 401 && S.token) { logout("انتهت الجلسة، سجّل الدخول من جديد"); throw new Error("انتهت الجلسة"); }
    if (!r.ok) throw new Error(j.error || "حدث خطأ (" + r.status + ")");
    return j;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("انتهت مهلة الاتصال بالخادم، حاول مرة أخرى");
    if (e instanceof TypeError) throw new Error("تعذّر الوصول للخادم. تأكد من الإنترنت ومن رابط الـ Worker في config.js");
    throw e;
  } finally { clearTimeout(t); }
}
function report(from, to) {
  var k = (from || "") + "|" + (to || "");
  if (!S.memo[k]) S.memo[k] = api("/report" + (from ? "?from=" + from + "&to=" + to : "")).catch(function (e) { delete S.memo[k]; throw e; });
  return S.memo[k];
}
function dirty() { S.memo = {}; S.students = null; }
function loading(el) { el.innerHTML = '<div class="skel"></div><div class="skel" style="margin-top:10px"></div>'; }
function fail(el, e) { el.innerHTML = '<p class="note">' + esc(e.message) + '</p><button class="btn alt sm" onclick="location.reload()">إعادة المحاولة</button>'; }

// ---------- الدخول ----------
var busy = false;
function showLogin(msg) { $("a_shell").hidden = true; $("a_login").hidden = false; $("a_le").textContent = msg || ""; }
function logout(msg) { S.token = null; S.user = null; S.memo = {}; try { sessionStorage.clear(); } catch (e) {} showLogin(msg); }
$("a_lf").addEventListener("submit", async function (ev) {
  ev.preventDefault();
  if (busy) return;                                   // منع إرسال الطلب أكثر من مرة
  var u = $("a_lu").value.trim(), p = $("a_lp").value;
  if (!u || !p) { $("a_le").textContent = "اكتب اسم المستخدم وكلمة المرور"; return; }
  busy = true; $("a_lb").disabled = true; $("a_ls").hidden = false; $("a_lt").textContent = "جاري الدخول..."; $("a_le").textContent = "";
  try {
    var r = await api("/login", { method: "POST", body: { username: u, password: p }, timeout: 20000 });
    S.token = r.token; S.user = r.user;
    try { sessionStorage.setItem("hudur_t", r.token); sessionStorage.setItem("hudur_u", JSON.stringify(r.user)); } catch (e) {}
    $("a_lp").value = ""; boot();
  } catch (e) { $("a_le").textContent = e.message; }
  finally { busy = false; $("a_lb").disabled = false; $("a_ls").hidden = true; $("a_lt").textContent = "تسجيل الدخول"; }
});
$("a_out").onclick = function () { logout(); };
$("a_mx").onclick = function () { $("a_modal").hidden = true; };
$("a_modal").addEventListener("click", function (e) { if (e.target === $("a_modal")) $("a_modal").hidden = true; });

// ---------- التشغيل ----------
var TABS = [["dash", "لوحة التحكم"], ["students", "الطلاب"], ["attend", "تسجيل الحضور"], ["stats", "الإحصائيات والتقارير"], ["grades", "الدرجات"], ["warn", "الإنذارات"], ["settings", "الإعدادات", 1], ["users", "المستخدمون", 1]];
async function boot() {
  if (!API || /YOUR-ACCOUNT/.test(API)) { showLogin("لم يُضبط رابط الخادم في config.js بعد"); return; }
  if (!S.token) { showLogin(); return; }
  $("a_login").hidden = true; $("a_shell").hidden = false;
  $("a_who").textContent = S.user.name + " — " + (S.user.role === "admin" ? "مدير المدرسة" : "معلم");
  try { S.settings = await api("/settings"); } catch (e) { toast(e.message); return; }
  $("a_sname").textContent = S.settings.school_name || "حضور";
  var adm = S.user.role === "admin";
  $("a_tabs").innerHTML = TABS.filter(function (t) { return !t[2] || adm; }).map(function (t) { return '<a data-t="' + t[0] + '" role="button" tabindex="0">' + t[1] + "</a>"; }).join("");
  $("a_tabs").onclick = function (e) { var a = e.target.closest("a"); if (a) go(a.dataset.t); };
  go(S.tab);
}
function go(t) {
  S.tab = t;
  Array.prototype.forEach.call($("a_tabs").children, function (a) { a.classList.toggle("on", a.dataset.t === t); });
  var el = $("a_view"); loading(el);
  var V = { dash: vDash, students: vStudents, attend: vAttend, stats: vStats, grades: vGrades, warn: vWarn, settings: vSettings, users: vUsers };
  Promise.resolve(V[t](el)).catch(function (e) { fail(el, e); });
}

// ---------- لوحة التحكم ----------
function kpi(v, l, c) { return '<div class="kpi ' + (c || "") + '"><b>' + v + "</b><span>" + l + "</span></div>"; }
function barsChart(items) {
  var mx = Math.max.apply(null, items.map(function (i) { return i.v; }).concat([1]));
  return '<div class="bars">' + items.map(function (i) { return '<div class="bar"><em>' + i.v + '%</em><i style="height:' + Math.max(2, i.v / mx * 100) + '%"></i>' + esc(i.l) + "</div>"; }).join("") + "</div>";
}
async function vDash(el) {
  var r = await report();
  var t = r.todayStats, T = r.totals;
  var tot = Math.max(1, T.students);
  el.innerHTML = '<div class="kpis">' + kpi(T.students, "إجمالي الطلاب") + kpi(t.present, "حاضرون اليوم", "ok") + kpi(t.absent, "غائبون اليوم", t.absent ? "warn" : "") + kpi(t.late, "متأخرون اليوم") +
    kpi(T.presRate + "%", "نسبة الحضور (من بداية العام)", "ok") + kpi(T.absRate + "%", "نسبة الغياب (من بداية العام)", T.absRate > 10 ? "warn" : "") + kpi(r.warningsOpen, "إنذارات بانتظار الاعتماد", r.warningsOpen ? "warn" : "") + kpi(r.warningsTotal, "إجمالي الإنذارات الحالية") + "</div>" +
    (t.unrecorded ? '<p class="note">لم يُسجَّل حضور اليوم لعدد ' + t.unrecorded + ' طالب (فصول لم يُرصد حضورها بعد) — ولا تُحسب ضمن الحاضرين.</p>' : "") +
    '<div class="two"><div class="panel"><h3>حالة اليوم</h3><div class="bar-row" aria-hidden="true"><i style="width:' + t.present / tot * 100 + '%;background:var(--mint)"></i><i style="width:' + t.late / tot * 100 + '%;background:var(--gold)"></i><i style="width:' + t.absent / tot * 100 + '%;background:var(--bad)"></i></div><div class="lg"><span><s style="background:var(--mint)"></s>حاضر ' + t.present + '</span><span><s style="background:var(--gold)"></s>متأخر ' + t.late + '</span><span><s style="background:var(--bad)"></s>غائب ' + t.absent + '</span><span><s style="background:var(--soft)"></s>غير مسجّل ' + t.unrecorded + "</span></div></div>" +
    '<div class="panel"><h3>نسبة الغياب حسب الفصل (من بداية العام)</h3>' + (r.byClass.length ? r.byClass.map(function (c) { return '<div class="hb"><span>' + esc(c.class) + '</span><div><i style="width:' + Math.min(100, c.absRate * 4) + '%"></i></div><b>' + c.absRate + "%</b></div>"; }).join("") : '<p class="m">لا بيانات</p>') + "</div></div>" +
    '<div class="panel"><h3>مقارنة نسبة الغياب بين الشهور</h3>' + (r.monthly.some(function (m) { return m.days; }) ? barsChart(r.monthly.map(function (m) { return { l: m.month.slice(5) + "/" + m.month.slice(2, 4), v: m.absRate }; })) : '<p class="m">لا توجد أيام دراسة مسجلة بعد. ابدأ من «تسجيل الحضور».</p>') + "</div>" +
    '<div id="a_sp"></div>';
  studentsPanel($("a_sp"), r, true);
}

// ---------- الطلاب (جدول + بحث + تصفية + ملف) ----------
function vStudents(el) { return report().then(function (r) { el.innerHTML = '<div id="a_sp"></div>'; studentsPanel($("a_sp"), r, false); }); }
function studentsPanel(el, r, compact) {
  var F = { q: "", grade: "", cls: "", today: "", warn: "", page: 0 };
  var uniq = function (k) { var s = {}; r.rows.forEach(function (x) { if (x[k]) s[x[k]] = 1; }); return Object.keys(s).sort(); };
  var opt = function (a) { return '<option value="">الكل</option>' + a.map(function (x) { return "<option>" + esc(x) + "</option>"; }).join(""); };
  var adm = S.user.role === "admin";
  el.innerHTML = '<div class="panel"><h3>قائمة الطلاب (' + r.rows.length + ')</h3><div class="filters no-print">' +
    '<div><label for="a_fq">بحث بالاسم أو الرقم التعريفي</label><input id="a_fq" placeholder="اكتب للبحث" autocomplete="off"></div>' +
    '<div><label for="a_fg">الصف</label><select id="a_fg">' + opt(uniq("grade")) + '</select></div><div><label for="a_fcl">الفصل</label><select id="a_fcl">' + opt(uniq("class")) + "</select></div>" +
    '<div><label for="a_ft">حالة اليوم</label><select id="a_ft"><option value="">الكل</option><option value="present">حاضر</option><option value="absent">غائب</option><option value="late">متأخر</option><option value="unrecorded">غير مسجّل</option></select></div>' +
    '<div><label for="a_fw">الإنذار</label><select id="a_fw"><option value="">الكل</option><option value="any">عليه إنذار</option><option value="none">بدون إنذار</option></select></div></div>' +
    (adm ? '<div class="rowb no-print"><button class="btn alt sm" id="a_imp">استيراد طلاب من Excel / CSV</button></div>' : "") +
    '<div class="tw"><table class="t"><thead><tr><th>الاسم</th><th>الرقم التعريفي</th><th>الصف</th><th>الفصل</th><th>ولي الأمر / التواصل</th><th>أيام الحضور</th><th>أيام الغياب</th><th>نسبة الغياب</th><th>متوسط الدرجات</th><th>الإنذار</th><th>اليوم</th><th></th></tr></thead><tbody id="a_tb"></tbody></table></div><div class="pager" id="a_pg"></div></div>';
  function filtered() {
    var q = F.q.trim();
    return r.rows.filter(function (x) {
      return (!q || x.name.indexOf(q) > -1 || x.code.indexOf(q) > -1) && (!F.grade || x.grade === F.grade) && (!F.cls || x.class === F.cls) && (!F.today || x.today === F.today) &&
        (!F.warn || (F.warn === "any" ? !!x.warning : !x.warning));
    });
  }
  var TS = { present: ["حاضر", "g"], absent: ["غائب", "r"], late: ["متأخر", "y"], unrecorded: ["غير مسجّل", "m"] };
  function draw() {
    var f = filtered(), pages = Math.max(1, Math.ceil(f.length / PAGE)); if (F.page >= pages) F.page = pages - 1;
    var sl = f.slice(F.page * PAGE, F.page * PAGE + PAGE);
    $("a_tb").innerHTML = sl.length ? sl.map(function (x) {
      var w = x.warning ? (x.warning === "approved" ? '<span class="pill r">إنذار معتمد</span>' : '<span class="pill y">إنذار بانتظار الاعتماد</span>') : '<span class="pill g">لا</span>';
      return "<tr><td class=n>" + esc(x.name) + "</td><td dir=ltr>" + esc(x.code) + "</td><td>" + esc(x.grade || "—") + "</td><td>" + esc(x.class) + "</td><td>" + (x.phone ? '<a href="tel:' + esc(x.phone) + '" dir="ltr">' + esc(x.phone) + "</a>" : '<span class="pill m">بدون رقم</span>') + "</td><td>" + x.present + "</td><td>" + x.absent + "</td><td>" + x.absRate + "%</td><td>" + (x.avg == null ? "—" : x.avg + "% (" + esc(x.label) + ")") + "</td><td>" + w + '</td><td><span class="pill ' + TS[x.today][1] + '">' + TS[x.today][0] + '</span></td><td><button class="btn alt sm" data-c="' + esc(x.code) + '">فتح الملف</button></td></tr>';
    }).join("") : '<tr><td colspan="12" class="m">لا يوجد طلاب مطابقون</td></tr>';
    $("a_pg").innerHTML = '<button class="btn alt sm" id="a_pp"' + (F.page ? "" : " disabled") + '>السابق</button><span>صفحة ' + (F.page + 1) + " من " + pages + " (" + f.length + ' طالب)</span><button class="btn alt sm" id="a_pn"' + (F.page < pages - 1 ? "" : " disabled") + ">التالي</button>";
    $("a_pp").onclick = function () { F.page--; draw(); }; $("a_pn").onclick = function () { F.page++; draw(); };
  }
  var set = function (k) { return function () { F[k] = this.value; F.page = 0; draw(); }; };
  $("a_fq").oninput = debounce(function () { F.q = $("a_fq").value; F.page = 0; draw(); }, 200);
  $("a_fg").onchange = set("grade"); $("a_fcl").onchange = set("cls"); $("a_ft").onchange = set("today"); $("a_fw").onchange = set("warn");
  $("a_tb").onclick = function (e) { var b = e.target.closest("button[data-c]"); if (b) openStudent(b.dataset.c); };
  if ($("a_imp")) $("a_imp").onclick = importDialog;
  draw();
}
async function openStudent(code) {
  $("a_mb").innerHTML = '<div class="skel"></div>'; $("a_modal").hidden = false;
  try {
    var d = await api("/student/" + encodeURIComponent(code)), s = d.student;
    var ab = d.attendance.filter(function (a) { return a.status === "absent"; }).length;
    var ST = { absent: "غائب", late: "متأخر", excused: "غياب بعذر" };
    $("a_mb").innerHTML = '<h2 style="margin:0">' + esc(s.name) + '</h2><p class="m">الرقم التعريفي: <span dir=ltr>' + esc(s.code) + "</span> · الفصل: " + esc(s.class) + (s.grade ? " · الصف: " + esc(s.grade) : "") + " · ولي الأمر: " + esc(s.phone || "غير مسجل") + "</p>" +
      '<div class="kpis">' + kpi(ab, "أيام الغياب المسجلة") + kpi(d.attendance.filter(function (a) { return a.status === "late"; }).length, "مرات التأخر") + kpi(d.gradeSummary ? d.gradeSummary.avg + "% — " + esc(d.gradeSummary.label) : "—", "متوسط الدرجات") + "</div>" +
      '<div class="rowb"><button class="btn sm" id="a_sr">تحميل تقرير الطالب (Excel)</button><button class="btn alt sm" id="a_sp2">PDF / طباعة</button></div>' +
      '<div class="panel"><h3>الإنذارات (السجل الكامل)</h3>' + (d.warnings.length ? '<div class="tw"><table class="t"><tr><th>التاريخ</th><th>الأيام</th><th>السبب</th><th>الحالة</th><th>القراءة</th></tr>' + d.warnings.map(function (w) { return "<tr><td>" + esc(w.created) + "</td><td>" + esc(w.abs_count) + '</td><td class=n>' + esc(w.reason) + "</td><td>" + wl(w.status) + "</td><td>" + (w.read === "yes" ? "تمت قراءته" : "جديد") + "</td></tr>"; }).join("") + "</table></div>" : '<p class="m">لا توجد إنذارات</p>') + "</div>" +
      '<div class="panel"><h3>سجل الغياب والتأخر</h3>' + (d.attendance.length ? '<div class="tw" style="max-height:260px"><table class="t"><tr><th>التاريخ</th><th>الحالة</th></tr>' + d.attendance.map(function (a) { return "<tr><td>" + esc(a.date) + "</td><td>" + (ST[a.status] || esc(a.status)) + "</td></tr>"; }).join("") + "</table></div>" : '<p class="m">لا يوجد غياب مسجل</p>') + "</div>" +
      '<div class="panel"><h3>الدرجات</h3>' + (d.grades.length ? '<div class="tw"><table class="t"><tr><th>الفصل الدراسي</th><th>الفترة</th><th>المادة</th><th>الدرجة</th><th>من</th></tr>' + d.grades.map(function (g) { return "<tr><td>" + esc(g.term) + "</td><td>" + esc(g.period) + "</td><td>" + esc(g.subject) + "</td><td>" + esc(g.score) + "</td><td>" + esc(g.max) + "</td></tr>"; }).join("") + "</table></div>" : '<p class="m">لا توجد درجات</p>') + "</div>";
    var mk = function () { return studentReportData(d); };
    $("a_sr").onclick = function () { exportAs("xlsx", mk()); }; $("a_sp2").onclick = function () { exportAs("pdf", mk()); };
  } catch (e) { $("a_mb").innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
}
function wl(s) { return s === "approved" ? '<span class="pill r">معتمد</span>' : s === "dismissed" ? '<span class="pill m">ملغى</span>' : '<span class="pill y">بانتظار الاعتماد</span>'; }

// ---------- استيراد الطلاب ----------
function parseCSV(t) {
  t = t.replace(/^﻿/, ""); var rows = [], row = [], cur = "", q = false;
  for (var i = 0; i < t.length; i++) {
    var c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some(function (x) { return x.trim(); })) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some(function (x) { return x.trim(); })) rows.push(row); return rows;
}
function mapStudents(rows) {
  var h = rows[0].map(function (x) { return String(x).trim(); }), idx = function (re) { return h.findIndex(function (x) { return re.test(x); }); };
  var ic = idx(/كود|رقم|code|id/i), inm = idx(/اسم|name/i), icl = idx(/فصل|class/i), ig = idx(/^الصف|grade/i), ip = idx(/تليفون|هاتف|موبايل|phone|mobile/i);
  if (ic < 0 || inm < 0 || icl < 0) throw new Error("لم أجد أعمدة: الكود، الاسم، الفصل في الصف الأول من الملف");
  return rows.slice(1).map(function (r) { return { code: String(r[ic] || "").trim(), name: String(r[inm] || "").trim(), class: String(r[icl] || "").trim(), grade: ig >= 0 ? String(r[ig] || "").trim() : "", phone: ip >= 0 ? String(r[ip] || "").trim() : "" }; }).filter(function (x) { return x.code && x.name; });
}
function loadScript(src) { return new Promise(function (res, rej) { if (window.XLSX) return res(); var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("تعذّر تحميل مكتبة Excel، تأكد من الإنترنت")); }; document.head.appendChild(s); }); }
var XLSX_SRC = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
function importDialog() {
  $("a_mb").innerHTML = '<h2 style="margin:0">استيراد بيانات الطلاب</h2><p class="m">الأعمدة المطلوبة في الصف الأول: <b>الكود، الاسم، الفصل</b> (واختياري: الصف، تليفون ولي الأمر). الطالب الموجود (بنفس الكود) يتم تحديثه ولا يتكرر.</p><input type="file" id="a_fi" accept=".csv,.xlsx,.xls"><div id="a_ip"></div>';
  $("a_modal").hidden = false;
  $("a_fi").onchange = async function () {
    var f = this.files[0]; if (!f) return; var ip = $("a_ip"); ip.innerHTML = '<p class="m">جاري قراءة الملف...</p>';
    try {
      var rows;
      if (/\.csv$/i.test(f.name)) rows = parseCSV(await f.text());
      else { await loadScript(XLSX_SRC); var wb = XLSX.read(await f.arrayBuffer(), { type: "array" }); rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false }); }
      var data = mapStudents(rows), noPh = data.filter(function (x) { return !x.phone; }).length;
      ip.innerHTML = '<div class="panel"><b>' + data.length + ' طالب جاهز للاستيراد</b>' + (noPh ? '<p class="note">' + noPh + " طالب بدون رقم ولي أمر — لن يستطيع ولي أمرهم الدخول حتى يُسجَّل الرقم.</p>" : "") + '<button class="btn" id="a_igo">تأكيد الاستيراد</button></div>';
      $("a_igo").onclick = async function () {
        this.disabled = true; this.textContent = "جاري الاستيراد...";
        try { var a = 0, u = 0; for (var i = 0; i < data.length; i += 400) { var r = await api("/students/import", { method: "POST", body: { rows: data.slice(i, i + 400) }, timeout: 90000 }); a += r.added; u += r.updated; ip.innerHTML = '<p class="m">تمت معالجة ' + Math.min(i + 400, data.length) + " من " + data.length + "...</p>"; } dirty(); ip.innerHTML = '<p class="msg">تم: إضافة ' + a + " وتحديث " + u + " طالب.</p>"; go(S.tab); }
        catch (e) { ip.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
      };
    } catch (e) { ip.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
  };
}

// ---------- تسجيل الحضور ----------
async function classList() {
  if (!S.students) S.students = await api("/students");
  var s = {}; S.students.forEach(function (x) { s[x.class] = 1; }); return Object.keys(s).sort();
}
async function vAttend(el) {
  var cl = await classList(), today = cairoToday();
  el.innerHTML = '<div class="panel"><h3>تسجيل الحضور والغياب اليومي</h3><div class="inl"><div><label for="a_ad">اليوم</label><input type="date" id="a_ad" value="' + today + '" max="' + today + '"></div><div><label for="a_ac">الفصل</label><select id="a_ac">' + cl.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + '</select></div><button class="btn alt" id="a_al">عرض</button></div><div id="a_ar"></div></div>';
  async function load() {
    var d = $("a_ad").value, c = $("a_ac").value, ar = $("a_ar"); if (!d || !c) return; loading(ar);
    try {
      var res = await api("/attendance?date=" + d + "&class=" + encodeURIComponent(c)), m = {}; res.records.forEach(function (r) { m[r.code] = r.status; });
      var list = S.students.filter(function (s) { return s.class === c; });
      ar.innerHTML = (res.recorded ? '<p class="note">هذا اليوم مسجّل من قبل — الحفظ سيستبدل السجل.</p>' : '<p class="note">كل من لا تغيّر حالته يُحسب <b>حاضرًا</b>.</p>') + '<div class="rowb"><button class="btn alt sm" id="a_allp">الكل حاضر</button></div><div class="tw"><table class="t"><thead><tr><th>الاسم</th><th>الحالة</th></tr></thead><tbody>' + list.map(function (s) {
        var v = m[s.code] || "present";
        return "<tr><td class=n>" + esc(s.name) + '</td><td><span class="seg">' + [["present", "حاضر"], ["absent", "غائب"], ["late", "متأخر"], ["excused", "بعذر"]].map(function (o) { return '<label><input type="radio" name="s' + esc(s.code) + '" value="' + o[0] + '"' + (v === o[0] ? " checked" : "") + "><span>" + o[1] + "</span></label>"; }).join("") + "</span></td></tr>";
      }).join("") + '</tbody></table></div><div class="rowb"><button class="btn" id="a_asv">حفظ الحضور</button></div>';
      $("a_allp").onclick = function () { ar.querySelectorAll('input[value="present"]').forEach(function (i) { i.checked = true; }); };
      $("a_asv").onclick = async function () {
        var b = this; b.disabled = true; b.textContent = "جاري الحفظ...";
        var recs = []; list.forEach(function (s) { var ch = ar.querySelector('input[name="s' + s.code + '"]:checked'); if (ch && ch.value !== "present") recs.push({ code: s.code, status: ch.value }); });
        try { var r = await api("/attendance", { method: "POST", body: { date: d, class: c, records: recs }, timeout: 60000 }); dirty(); toast("تم الحفظ (" + recs.length + " غياب/تأخر)" + (r.newWarnings ? " — وتم إنشاء " + r.newWarnings + " إنذار جديد" : "")); b.textContent = "حفظ الحضور"; b.disabled = false; }
        catch (e) { toast(e.message); b.textContent = "حفظ الحضور"; b.disabled = false; }
      };
    } catch (e) { ar.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
  }
  $("a_al").onclick = load; $("a_ac").onchange = load; $("a_ad").onchange = load; if (cl.length) load(); else $("a_ar").innerHTML = '<p class="note">لا يوجد طلاب بعد. استورد قائمة الطلاب من تبويب «الطلاب».</p>';
}

// ---------- الفترات ----------
function ranges(today) {
  var d = dow(today), ws = addDays(today, -d);
  return { thisWeek: [ws, today, "الأسبوع الحالي"], lastWeek: [addDays(ws, -7), addDays(ws, -1), "الأسبوع السابق"], last2w: [addDays(today, -13), today, "آخر أسبوعين"], lastMonth: [addDays(today, -29), today, "آخر شهر"] };
}
var KINDS = [["weekly", "تقرير الغياب الأسبوعي"], ["monthly", "تقرير الغياب الشهري"], ["last2w", "تقرير آخر أسبوعين"], ["custom", "تقرير فترة زمنية مخصصة"], ["general", "تقرير الغياب العام للمدرسة"], ["top", "تقرير الطلاب الأكثر غيابًا"], ["warnings", "تقرير الإنذارات"], ["student", "تقرير طالب محدد"]];
async function vStats(el) {
  var today = cairoToday(), R = ranges(today), cur = R.thisWeek;
  el.innerHTML = '<div class="panel"><h3>اختيار الفترة</h3><div class="rowb">' + Object.keys(R).map(function (k) { return '<button class="btn alt sm" data-r="' + k + '">' + R[k][2] + "</button>"; }).join("") + '</div><div class="inl"><div><label for="a_sm">شهر معيّن</label><input type="month" id="a_sm" max="' + today.slice(0, 7) + '"></div><div><label for="a_sf">من تاريخ</label><input type="date" id="a_sf" max="' + today + '"></div><div><label for="a_se">إلى تاريخ</label><input type="date" id="a_se" max="' + today + '"></div><button class="btn" id="a_sg">عرض</button></div></div><div id="a_so"></div>' +
    '<div class="panel no-print"><h3>تحميل التقرير</h3><div class="inl"><div><label for="a_rk">نوع التقرير</label><select id="a_rk">' + KINDS.map(function (k) { return '<option value="' + k[0] + '">' + k[1] + "</option>"; }).join("") + '</select></div><div id="a_rs" hidden><label for="a_rc">كود الطالب</label><input id="a_rc" dir="ltr"></div></div><p class="m">التقارير الأسبوعية/الشهرية/المخصصة تتبع الفترة المعروضة أعلاه. التقرير يحتوي على بيانات حقيقية من النظام.</p><div class="rowb"><button class="btn" id="a_d1">تحميل التقرير (Excel)</button><button class="btn alt" id="a_d2">CSV</button><button class="btn alt" id="a_d3">PDF / طباعة</button></div></div>';
  var label = cur[2];
  async function show(from, to, lab) {
    cur = [from, to, lab]; var o = $("a_so"); loading(o);
    try {
      var r = await report(from, to), T = r.totals, P = r.previous, dlt = Math.round((T.absRate - P.absRate) * 10) / 10;
      var top = r.rows.filter(function (x) { return x.absent > 0; }).sort(function (a, b) { return b.absent - a.absent; });
      o.innerHTML = '<p class="m">الفترة: ' + esc(lab) + " (" + from + " → " + to + ")</p>" + (T.totalAvail ? "" : '<p class="note">لا توجد أيام دراسة مسجلة في هذه الفترة.</p>') + '<div class="kpis">' + kpi(T.absentStudents, "طلاب تغيّبوا يومًا فأكثر", T.absentStudents ? "warn" : "") + kpi(T.totalAbsences, "إجمالي حالات الغياب") + kpi(top.filter(function (x) { return x.absent >= 3; }).length, "غابوا ٣ أيام أو أكثر") + kpi(T.absRate + "%", "نسبة الغياب", T.absRate > 10 ? "warn" : "") + kpi(T.presRate + "%", "نسبة الحضور", "ok") + kpi(r.topClass ? esc(r.topClass.class) : "—", "الفصل/الصف الأكثر غيابًا") + "</div>" +
        '<div class="panel"><h3>مقارنة بالفترة السابقة (' + P.from + " → " + P.to + ')</h3><p>نسبة الغياب الحالية <b>' + T.absRate + "%</b> مقابل <b>" + P.absRate + "%</b> — " + (dlt > 0 ? '<span class="pill r">زيادة ' + dlt + " نقطة</span>" : dlt < 0 ? '<span class="pill g">انخفاض ' + Math.abs(dlt) + " نقطة</span>" : '<span class="pill m">لا تغيير</span>') + " · إجمالي الغياب السابق: " + P.totalAbsences + "</p></div>" +
        '<div class="panel"><h3>الطلاب الأكثر غيابًا في الفترة</h3>' + (top.length ? '<div class="tw"><table class="t"><tr><th>#</th><th>الاسم</th><th>الصف</th><th>الفصل</th><th>أيام الغياب</th><th>نسبة الغياب</th></tr>' + top.slice(0, 20).map(function (x, i) { return "<tr><td>" + (i + 1) + "</td><td class=n>" + esc(x.name) + "</td><td>" + esc(x.grade || "—") + "</td><td>" + esc(x.class) + "</td><td>" + x.absent + "</td><td>" + x.absRate + "%</td></tr>"; }).join("") + "</table></div>" : '<p class="m">لا يوجد غياب في هذه الفترة</p>') + "</div>";
    } catch (e) { o.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
  }
  el.querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { var x = R[b.dataset.r]; show(x[0], x[1], x[2]); }; });
  $("a_sg").onclick = function () {
    var m = $("a_sm").value, f = $("a_sf").value, e = $("a_se").value;
    if (m) { var to = monthEnd(m); show(m + "-01", to > today ? today : to, "شهر " + m); }
    else if (f && e && f <= e) show(f, e > today ? today : e, "فترة مخصصة");
    else toast("اختر شهرًا، أو تاريخ البداية والنهاية بشكل صحيح");
  };
  $("a_rk").onchange = function () { $("a_rs").hidden = this.value !== "student"; };
  [["d1", "xlsx"], ["d2", "csv"], ["d3", "pdf"]].forEach(function (x) {
    $(x[0]).onclick = async function () {
      var w = x[1] === "pdf" ? window.open("", "_blank") : null;
      if (x[1] === "pdf" && !w) { toast("المتصفح منع النافذة المنبثقة. اسمح بها ثم أعد المحاولة"); return; }
      var b = this, old = b.textContent; b.disabled = true; b.textContent = "جاري التجهيز...";
      try { await exportAs(x[1], await buildReport($("a_rk").value, cur, $("a_rc").value.trim()), w); }
      catch (e) { if (w) w.close(); toast(e.message); }
      finally { b.disabled = false; b.textContent = old; }
    };
  });
  show(cur[0], cur[1], cur[2]);
}

// ---------- بناء التقارير والتصدير ----------
function meta(r, lab) { var T = r.totals; return [["اسم المدرسة", S.settings.school_name], ["الفترة الزمنية", lab + " (" + r.from + " إلى " + r.to + ")"], ["إجمالي الطلاب", T.students], ["عدد الطلاب الغائبين", T.absentStudents], ["إجمالي أيام الغياب", T.totalAbsences], ["نسبة الغياب", T.absRate + "%"]]; }
var ABS_H = ["اسم الطالب", "الرقم التعريفي", "الصف", "الفصل", "أيام الدراسة", "أيام الحضور", "أيام الغياب", "نسبة الغياب"];
var absRow = function (x) { return [x.name, x.code, x.grade, x.class, x.avail, x.present, x.absent, x.absRate + "%"]; };
async function buildReport(kind, cur, code) {
  var today = cairoToday(), R = ranges(today), lab, from, to;
  if (kind === "weekly") { from = R.thisWeek[0]; to = R.thisWeek[1]; lab = "الأسبوع الحالي"; }
  else if (kind === "last2w") { from = R.last2w[0]; to = R.last2w[1]; lab = "آخر أسبوعين"; }
  else if (kind === "monthly") { from = today.slice(0, 7) + "-01"; to = today; lab = "الشهر الحالي"; if (cur[2].indexOf("شهر ") === 0) { from = cur[0]; to = cur[1]; lab = cur[2]; } }
  else if (kind === "custom") { from = cur[0]; to = cur[1]; lab = cur[2]; }
  else if (kind === "warnings") {
    var ws = await api("/warnings"), st = { approved: "معتمد", pending: "بانتظار الاعتماد", dismissed: "ملغى" };
    return { title: "تقرير الإنذارات", meta: [["اسم المدرسة", S.settings.school_name], ["حد الإنذار", S.settings.absence_threshold + " يوم"], ["عدد الإنذارات", ws.length]], headers: ["اسم الطالب", "الرقم التعريفي", "الفصل", "أيام الغياب", "تاريخ الإنذار", "السبب", "الحالة", "قراءة ولي الأمر"], rows: ws.map(function (w) { return [w.name, w.code, w.class, w.abs_count, w.created, w.reason, st[w.status] || w.status, w.read === "yes" ? "تمت قراءته" : "جديد"]; }) };
  }
  else if (kind === "student") {
    if (!code) throw new Error("اكتب كود الطالب أولًا");
    return studentReportData(await api("/student/" + encodeURIComponent(code)));
  }
  var r;
  if (kind === "general") { r = await report(); lab = "من بداية العام الدراسي"; return { title: "تقرير الغياب العام للمدرسة", meta: meta(r, lab), headers: ABS_H, rows: r.rows.filter(function (x) { return x.absent > 0; }).sort(function (a, b) { return b.absent - a.absent; }).map(absRow) }; }
  if (kind === "top") { r = await report(); lab = "من بداية العام الدراسي"; return { title: "تقرير الطلاب الأكثر غيابًا", meta: meta(r, lab), headers: ["الترتيب"].concat(ABS_H), rows: r.rows.filter(function (x) { return x.absent > 0; }).sort(function (a, b) { return b.absent - a.absent; }).slice(0, 30).map(function (x, i) { return [i + 1].concat(absRow(x)); }) }; }
  r = await report(from, to);
  return { title: KINDS.filter(function (k) { return k[0] === kind; })[0][1], meta: meta(r, lab), headers: ABS_H, rows: r.rows.filter(function (x) { return x.absent > 0; }).sort(function (a, b) { return b.absent - a.absent; }).map(absRow) };
}
function studentReportData(d) {
  var s = d.student, ab = d.attendance.filter(function (a) { return a.status === "absent"; }), ST = { absent: "غائب", late: "متأخر", excused: "غياب بعذر" };
  var rows = d.attendance.map(function (a) { return ["حضور", a.date, ST[a.status] || a.status, ""]; }).concat(d.grades.map(function (g) { return ["درجة", g.term + " / " + g.period, g.subject, g.score + " من " + g.max]; })).concat(d.warnings.map(function (w) { return ["إنذار", w.created, w.reason, w.status === "approved" ? "معتمد" : w.status === "dismissed" ? "ملغى" : "بانتظار الاعتماد"]; }));
  return { title: "تقرير الطالب: " + s.name, meta: [["اسم المدرسة", S.settings.school_name], ["الطالب", s.name], ["الرقم التعريفي", s.code], ["الفصل", s.class], ["أيام الغياب", ab.length], ["متوسط الدرجات", d.gradeSummary ? d.gradeSummary.avg + "% — " + d.gradeSummary.label : "—"]], headers: ["النوع", "التاريخ / الفترة", "التفاصيل", "ملاحظات"], rows: rows };
}
function safeCell(v) { v = v == null ? "" : String(v); return /^[=+\-@\t\r]/.test(v) && isNaN(v) ? "'" + v : v; }
function dl(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
async function exportAs(fmt, rep, win) {
  var name = "hudur-" + cairoToday();
  var all = rep.meta.map(function (m) { return [m[0], m[1]]; }).concat([[]], [rep.headers], rep.rows);
  if (fmt === "csv") { var csv = "﻿" + all.map(function (r) { return r.map(function (c) { return '"' + safeCell(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n"); dl(new Blob([csv], { type: "text/csv;charset=utf-8" }), name + ".csv"); }
  else if (fmt === "xlsx") {
    await loadScript(XLSX_SRC);
    var ws = XLSX.utils.aoa_to_sheet([[rep.title]].concat([[]], all.map(function (r) { return r.map(safeCell); })));
    ws["!views"] = [{ RTL: true }]; ws["!cols"] = rep.headers.map(function () { return { wch: 22 }; });
    var wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] }; XLSX.utils.book_append_sheet(wb, ws, "التقرير"); XLSX.writeFile(wb, name + ".xlsx");
  } else {
    var w = win || window.open("", "_blank"); if (!w) throw new Error("المتصفح منع النافذة المنبثقة");
    w.document.write('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(rep.title) + '</title><style>body{font-family:Cairo,Tahoma,Arial;padding:16px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #999;padding:5px 8px;text-align:right}th{background:#eee}h1{font-size:20px}.m td{border:0;padding:2px 6px}</style></head><body><h1>' + esc(rep.title) + '</h1><table class="m">' + rep.meta.map(function (m) { return "<tr><td><b>" + esc(m[0]) + "</b></td><td>" + esc(m[1]) + "</td></tr>"; }).join("") + "</table><br><table><tr>" + rep.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr>" + rep.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table><p>للحفظ كملف PDF اختر «حفظ بصيغة PDF» من نافذة الطباعة.</p></body></html>");
    w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 400);
  }
}

// ---------- الدرجات ----------
async function vGrades(el) {
  var cl = await classList(), subs = S.settings.subjects || [];
  el.innerHTML = '<div class="panel"><h3>إدخال الدرجات</h3><div class="inl"><div><label for="a_gc">الفصل</label><select id="a_gc">' + cl.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + '</select></div><div><label for="a_gt">الفصل الدراسي</label><select id="a_gt"><option>الأول</option><option>الثاني</option></select></div><div><label for="a_gp">الشهر / الفترة</label><input id="a_gp" placeholder="مثال: أكتوبر"></div><div><label for="a_gs">المادة</label><input id="a_gs" list="a_gl" placeholder="اسم المادة"><datalist id="a_gl">' + subs.map(function (s) { return '<option value="' + esc(s.name) + '">'; }).join("") + '</datalist></div><div><label for="a_gm">الدرجة النهائية</label><input id="a_gm" type="number" min="1" value="' + (subs[0] ? subs[0].max : 50) + '"></div><button class="btn alt" id="a_gl2">عرض الطلاب</button></div><div id="a_go"></div></div><div class="panel"><h3>تقرير الدرجات (الفصل / المدرسة)</h3><div class="inl"><div><label for="a_rt">الفصل الدراسي</label><select id="a_rt"><option value="">كل الفصول الدراسية</option><option>الأول</option><option>الثاني</option></select></div><div><label for="a_rc2">الفصل</label><select id="a_rc2"><option value="">كل المدرسة</option>' + cl.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + '</select></div><button class="btn" id="a_rb">عرض التقرير</button></div><div id="a_gr"></div></div>';
  $("a_gs").onchange = function () { var s = subs.filter(function (x) { return x.name === $("a_gs").value; })[0]; if (s) $("a_gm").value = s.max; };
  $("a_gl2").onclick = async function () {
    var c = $("a_gc").value, g = $("a_go"); if (!c) return; loading(g);
    try {
      var res = await api("/grades?class=" + encodeURIComponent(c) + "&term=" + encodeURIComponent($("a_gt").value)), sub = $("a_gs").value.trim(), per = $("a_gp").value.trim(), ex = {};
      res.grades.forEach(function (x) { if (x.subject === sub && x.period === per) ex[x.code] = x.score; });
      g.innerHTML = '<div class="tw"><table class="t"><tr><th>الاسم</th><th>الدرجة (من ' + esc($("a_gm").value) + ')</th></tr>' + res.students.map(function (s) { return "<tr><td class=n>" + esc(s.name) + '</td><td><input type="number" step="0.25" min="0" data-c="' + esc(s.code) + '" value="' + (ex[s.code] == null ? "" : esc(ex[s.code])) + '" style="margin:0;width:110px"></td></tr>'; }).join("") + '</table></div><div class="rowb"><button class="btn" id="a_gsv">حفظ الدرجات</button></div>';
      $("a_gsv").onclick = async function () {
        var term = $("a_gt").value, mx = +$("a_gm").value, b = this;
        if (!sub || !per || !(mx > 0)) { toast("اكتب المادة والفترة والدرجة النهائية"); return; }
        var recs = []; g.querySelectorAll("input[data-c]").forEach(function (i) { if (i.value !== "") recs.push({ code: i.dataset.c, score: i.value }); });
        b.disabled = true; b.textContent = "جاري الحفظ...";
        try { var r = await api("/grades", { method: "POST", body: { term: term, period: per, subject: sub, max: mx, records: recs }, timeout: 90000 }); dirty(); toast("تم حفظ " + r.saved + " درجة"); }
        catch (e) { toast(e.message); } finally { b.disabled = false; b.textContent = "حفظ الدرجات"; }
      };
    } catch (e) { g.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
  };
  $("a_rb").onclick = async function () {
    var o = $("a_gr"); loading(o);
    try {
      var q = "?term=" + encodeURIComponent($("a_rt").value) + "&class=" + encodeURIComponent($("a_rc2").value), res = await api("/grades" + q), by = {}, per = {};
      var smap = {}; subs.forEach(function (s) { smap[s.name] = s; });
      res.grades.forEach(function (g) { var k = g.term + " / " + g.period; per[k] = 1; var p = ((by[g.code] = by[g.code] || {})[k] = by[g.code][k] || {}); (p[g.subject] = p[g.subject] || []).push(+g.score / +g.max * 100); });
      var ks = Object.keys(per).sort();
      var avg = function (o2) { var n = 0, d = 0; for (var s in o2) { var v = o2[s].reduce(function (a, b) { return a + b; }, 0) / o2[s].length, w = smap[s] && +smap[s].weight > 0 ? +smap[s].weight : 1; n += v * w; d += w; } return d ? Math.round(n / d * 10) / 10 : null; };
      var rows = res.students.map(function (s) { var per2 = ks.map(function (k) { return by[s.code] && by[s.code][k] ? avg(by[s.code][k]) : null; }), vals = per2.filter(function (v) { return v != null; }); return { s: s, per: per2, all: vals.length ? Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length * 10) / 10 : null }; });
      var cs = {}; rows.forEach(function (r) { if (r.all != null) { (cs[r.s.class] = cs[r.s.class] || []).push(r.all); } });
      var scale = S.settings.grade_scale, lab = function (v) { if (v == null) return "—"; for (var i = 0; i < scale.length; i++) if (v >= scale[i][1]) return scale[i][0]; return "—"; };
      var mean = function (a) { return Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length * 10) / 10; };
      var all = rows.filter(function (r) { return r.all != null; }).map(function (r) { return r.all; });
      o.innerHTML = '<p class="m">متوسط المدرسة: <b>' + (all.length ? mean(all) + "%" : "—") + "</b> — " + Object.keys(cs).map(function (c) { return esc(c) + ": " + mean(cs[c]) + "%"; }).join(" · ") + '</p><div class="tw"><table class="t"><tr><th>الاسم</th><th>الفصل</th>' + ks.map(function (k) { return "<th>" + esc(k) + "</th>"; }).join("") + "<th>المتوسط</th><th>التقدير</th></tr>" + rows.map(function (r) { return "<tr><td class=n>" + esc(r.s.name) + "</td><td>" + esc(r.s.class) + "</td>" + r.per.map(function (v) { return "<td>" + (v == null ? "—" : v + "%") + "</td>"; }).join("") + "<td>" + (r.all == null ? "—" : r.all + "%") + "</td><td>" + lab(r.all) + "</td></tr>"; }).join("") + "</table></div>" + (ks.length ? "" : '<p class="m">لا توجد درجات مسجلة بعد.</p>') + '<div class="rowb"><button class="btn alt sm" id="a_gx">تحميل Excel</button><button class="btn alt sm" id="a_gp2">PDF / طباعة</button></div>';
      var rep = { title: "تقرير الدرجات", meta: [["اسم المدرسة", S.settings.school_name], ["الفصل الدراسي", $("a_rt").value || "الكل"], ["متوسط المدرسة", all.length ? mean(all) + "%" : "—"]], headers: ["الاسم", "الفصل"].concat(ks, ["المتوسط", "التقدير"]), rows: rows.map(function (r) { return [r.s.name, r.s.class].concat(r.per.map(function (v) { return v == null ? "" : v + "%"; }), [r.all == null ? "" : r.all + "%", lab(r.all)]); }) };
      $("a_gx").onclick = function () { exportAs("xlsx", rep).catch(function (e) { toast(e.message); }); }; $("a_gp2").onclick = function () { exportAs("pdf", rep).catch(function (e) { toast(e.message); }); };
    } catch (e) { o.innerHTML = '<p class="note">' + esc(e.message) + "</p>"; }
  };
}

// ---------- الإنذارات ----------
async function vWarn(el) {
  var ws = await api("/warnings"), adm = S.user.role === "admin", th = S.settings.absence_threshold;
  el.innerHTML = '<div class="panel"><h3>الإنذارات والطلاب الذين يحتاجون متابعة</h3><p class="m">يُنشأ الإنذار تلقائيًا عند بلوغ ' + th + ' يوم غياب (قابل للتعديل من الإعدادات). الإنذار <b>غير رسمي</b> حتى تعتمده الإدارة.</p>' + (adm ? '<div class="rowb"><button class="btn alt sm" id="a_wr">فحص الطلاب وإنشاء الإنذارات المستحقة الآن</button></div>' : "") + (ws.length ? '<div class="tw"><table class="t"><tr><th>الطالب</th><th>الفصل</th><th>أيام الغياب</th><th>التاريخ</th><th>السبب</th><th>الحالة</th><th>ولي الأمر</th>' + (adm ? "<th>إجراء</th>" : "") + "</tr>" + ws.map(function (w) {
    var msg = "السلام عليكم، نفيدكم بأن عدد أيام غياب الطالبة " + w.name + " بلغ " + w.abs_count + " يوم، برجاء المتابعة والتواصل مع إدارة المدرسة.", ph = String(w.phone || "").replace(/^0/, "20");
    return "<tr><td class=n>" + esc(w.name) + "</td><td>" + esc(w.class) + "</td><td>" + esc(w.abs_count) + "</td><td>" + esc(w.created) + "</td><td class=n>" + esc(w.reason) + "</td><td>" + wl(w.status) + (w.read === "yes" ? ' <span class="pill g">قرأه ولي الأمر</span>' : "") + "</td><td>" + (ph ? '<a class="btn alt sm" target="_blank" rel="noopener" href="https://wa.me/' + esc(ph) + "?text=" + encodeURIComponent(msg) + '">واتساب</a>' : "بدون رقم") + "</td>" + (adm ? '<td><button class="btn sm" data-a="approved" data-i="' + esc(w.id) + '">اعتماد</button> <button class="btn alt sm" data-a="dismissed" data-i="' + esc(w.id) + '">إلغاء</button></td>' : "") + "</tr>";
  }).join("") + "</table></div>" : '<p class="m">لا توجد إنذارات حالية</p>') + "</div>";
  if (adm) {
    $("a_wr").onclick = async function () { this.disabled = true; try { var r = await api("/warnings/run", { method: "POST", body: {}, timeout: 60000 }); toast("تم إنشاء " + r.created + " إنذار جديد"); dirty(); go("warn"); } catch (e) { toast(e.message); this.disabled = false; } };
    el.onclick = async function (e) { var b = e.target.closest("button[data-a]"); if (!b) return; b.disabled = true; try { await api("/warnings/" + encodeURIComponent(b.dataset.i), { method: "PATCH", body: { status: b.dataset.a } }); dirty(); go("warn"); } catch (x) { toast(x.message); b.disabled = false; } };
  }
}

// ---------- الإعدادات ----------
async function vSettings(el) {
  var s = S.settings, hol = await api("/holidays"), wk = [[6, "السبت"], [0, "الأحد"], [1, "الإثنين"], [2, "الثلاثاء"], [3, "الأربعاء"], [4, "الخميس"], [5, "الجمعة"]];
  var subj = function (x) { return '<div class="inl subr"><input class="sn" placeholder="المادة" value="' + esc(x.name) + '"><input class="sm2" type="number" placeholder="الدرجة النهائية" value="' + esc(x.max) + '"><input class="sw" type="number" step="0.5" placeholder="الوزن" value="' + esc(x.weight) + '"></div>'; };
  var scl = function (x) { return '<div class="inl scr"><input class="gn" placeholder="التقدير" value="' + esc(x[0]) + '"><input class="gm2" type="number" placeholder="الحد الأدنى %" value="' + esc(x[1]) + '"></div>'; };
  el.innerHTML = '<div class="panel"><h3>إعدادات المدرسة</h3><label for="a_s1">اسم المدرسة (يظهر في التقارير)</label><input id="a_s1" value="' + esc(s.school_name) + '"><label for="a_s2">عدد أيام الغياب لإصدار الإنذار</label><input id="a_s2" type="number" min="1" value="' + esc(s.absence_threshold) + '"><label for="a_s3">بداية العام الدراسي (اختياري — الافتراضي 1 سبتمبر)</label><input id="a_s3" type="date" value="' + esc(s.year_start) + '"><label for="a_s4">ظهور الإنذار لولي الأمر</label><select id="a_s4"><option value="on_create"' + (s.notify_mode === "on_create" ? " selected" : "") + '>فور إنشائه (كتنبيه مبدئي)</option><option value="on_approval"' + (s.notify_mode === "on_approval" ? " selected" : "") + '>بعد اعتماد الإدارة فقط</option></select><label>أيام الإجازة الأسبوعية</label><div class="inl">' + wk.map(function (d) { return '<label><input type="checkbox" class="wd" value="' + d[0] + '"' + (s.weekend.map(Number).indexOf(d[0]) > -1 ? " checked" : "") + ' style="width:auto"> ' + d[1] + "</label>"; }).join("") + "</div></div>" +
    '<div class="panel"><h3>المواد الدراسية (الدرجة النهائية والوزن النسبي)</h3><div id="a_sj">' + (s.subjects.length ? s.subjects : [{ name: "", max: 50, weight: 1 }]).map(subj).join("") + '</div><button class="btn alt sm" id="a_sa">+ مادة</button><p class="m">المتوسط = مجموع (نسبة الطالب في المادة × وزنها) ÷ مجموع الأوزان. لا يتأثر بالحضور إطلاقًا.</p></div>' +
    '<div class="panel"><h3>مقياس التقدير</h3><div id="a_sc">' + s.grade_scale.map(scl).join("") + '</div><button class="btn alt sm" id="a_sb">+ تقدير</button></div><div class="rowb"><button class="btn" id="a_ssv">حفظ الإعدادات</button></div>' +
    '<div class="panel"><h3>الإجازات والعطلات (تُستبعد من حساب أيام الدراسة)</h3><div class="inl"><input type="date" id="a_hd"><input id="a_hn" placeholder="الوصف (اختياري)"><button class="btn alt sm" id="a_ha">إضافة</button></div>' + (hol.length ? '<div class="tw" style="margin-top:8px"><table class="t"><tr><th>التاريخ</th><th>الوصف</th><th></th></tr>' + hol.sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (h) { return "<tr><td>" + esc(h.date) + "</td><td>" + esc(h.note) + '</td><td><button class="btn alt sm" data-h="' + esc(h.date) + '">حذف</button></td></tr>'; }).join("") + "</table></div>" : '<p class="m">لا توجد عطلات مسجلة</p>') + "</div>";
  $("a_sa").onclick = function () { $("a_sj").insertAdjacentHTML("beforeend", subj({ name: "", max: 50, weight: 1 })); };
  $("a_sb").onclick = function () { $("a_sc").insertAdjacentHTML("beforeend", scl(["", 0])); };
  $("a_ssv").onclick = async function () {
    var b = this, subs = [].map.call(el.querySelectorAll(".subr"), function (r) { return { name: r.querySelector(".sn").value.trim(), max: +r.querySelector(".sm2").value, weight: +r.querySelector(".sw").value || 1 }; }).filter(function (x) { return x.name && x.max > 0; });
    var sc = [].map.call(el.querySelectorAll(".scr"), function (r) { return [r.querySelector(".gn").value.trim(), +r.querySelector(".gm2").value]; }).filter(function (x) { return x[0]; }).sort(function (a, b2) { return b2[1] - a[1]; });
    if (!sc.length || sc[sc.length - 1][1] > 0) { toast("يجب أن يحتوي المقياس على تقدير حدّه الأدنى 0"); return; }
    var th = Math.floor(+$("a_s2").value); if (!(th >= 1)) { toast("حد الإنذار رقم صحيح 1 أو أكثر"); return; }
    b.disabled = true;
    try { S.settings = await api("/settings", { method: "PUT", body: { school_name: $("a_s1").value.trim(), absence_threshold: th, year_start: $("a_s3").value, notify_mode: $("a_s4").value, weekend: [].map.call(el.querySelectorAll(".wd:checked"), function (c) { return +c.value; }), subjects: subs, grade_scale: sc } }); dirty(); $("a_sname").textContent = S.settings.school_name; toast("تم حفظ الإعدادات"); }
    catch (e) { toast(e.message); } finally { b.disabled = false; }
  };
  $("a_ha").onclick = async function () { var d = $("a_hd").value; if (!d) return; try { await api("/holidays", { method: "POST", body: { date: d, note: $("a_hn").value } }); dirty(); go("settings"); } catch (e) { toast(e.message); } };
  el.querySelectorAll("button[data-h]").forEach(function (b) { b.onclick = async function () { try { await api("/holidays?date=" + b.dataset.h, { method: "DELETE" }); dirty(); go("settings"); } catch (e) { toast(e.message); } }; });
}

// ---------- المستخدمون ----------
async function vUsers(el) {
  var us = await api("/users"), cl = await classList();
  el.innerHTML = '<div class="panel"><h3>إضافة معلم / مدير</h3><div class="inl"><input id="a_un" placeholder="الاسم الكامل"><input id="a_uu" dir="ltr" placeholder="اسم المستخدم (إنجليزي)"><input id="a_up" type="password" dir="ltr" placeholder="كلمة مرور (8 أحرف+)" autocomplete="new-password"><select id="a_ur"><option value="teacher">معلم</option><option value="admin">مدير</option></select></div><label>الفصول المسموحة للمعلم</label><div class="inl">' + cl.map(function (c) { return '<label><input type="checkbox" class="uc" value="' + esc(c) + '" style="width:auto"> ' + esc(c) + "</label>"; }).join("") + '</div><div class="rowb"><button class="btn" id="a_ua">إنشاء الحساب</button></div></div><div class="panel"><h3>الحسابات</h3><div class="tw"><table class="t"><tr><th>الاسم</th><th>المستخدم</th><th>الدور</th><th>الفصول</th><th>الحالة</th><th></th></tr>' + us.map(function (u) { return "<tr><td>" + esc(u.name) + "</td><td dir=ltr>" + esc(u.username) + "</td><td>" + (u.role === "admin" ? "مدير" : "معلم") + "</td><td>" + esc(u.classes || "—") + "</td><td>" + (u.active === "no" ? "معطّل" : "نشط") + "</td><td>" + (u.active !== "no" && u.username !== S.user.u ? '<button class="btn alt sm" data-u="' + esc(u.username) + '">تعطيل</button>' : "") + "</td></tr>"; }).join("") + "</table></div></div>";
  $("a_ua").onclick = async function () {
    var b = this; b.disabled = true;
    try { await api("/users", { method: "POST", body: { name: $("a_un").value, username: $("a_uu").value, password: $("a_up").value, role: $("a_ur").value, classes: [].map.call(el.querySelectorAll(".uc:checked"), function (c) { return c.value; }).join(",") } }); toast("تم إنشاء الحساب"); go("users"); }
    catch (e) { toast(e.message); b.disabled = false; }
  };
  el.querySelectorAll("button[data-u]").forEach(function (b) { b.onclick = async function () { if (!confirm("تعطيل هذا الحساب؟")) return; try { await api("/users/" + encodeURIComponent(b.dataset.u), { method: "DELETE" }); go("users"); } catch (e) { toast(e.message); } }; });
}

window.addEventListener("error", function () { toast("حدث خطأ غير متوقع، أعد تحميل الصفحة"); });
window.addEventListener("unhandledrejection", function (e) { if (e.reason && e.reason.message) toast(e.reason.message); });
window.__adminBoot = boot;
})();
