(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var Tree=require("./tree");self.onmessage=function(e){if("inputs"===e.data.event){var t=new Tree(e.data);t.start(function(e){self.postMessage({event:"svg",value:e})})}}},{"./tree":3}],2:[function(require,module,exports){function Path(t){return"undefined"!=typeof t&&(this.d=t),this}function Paper(t,e,i){this.width=e||0,this.height=i||0,this.container=t,this.paths=[],this.xmlns="http://www.w3.org/2000/svg",this.version="1.1",this.viewBox=null}function Raphael(t,e,i){return new Paper(t,e,i)}var _=require("underscore");Path.prototype.attr=function(t){var e=this;return 2==arguments.length?e[arguments[0]]=arguments[1]:_.keys(t).forEach(function(i){e[i]=t[i]}),e},Path.prototype.toString=function(){var t=this,e=_.map(_.keys(t),function(e){return e+'="'+t[e]+'"'}).join(" "),i=t.tag||"path",r="<"+i+" "+e+"/>";return r},Paper.prototype.path=function(t,e){e=e||{};var i=new Path(t);return e.top?this.paths.push(i):e.bottom?this.paths.unshift(i):this.paths.push(i),i},Paper.prototype.circle=function(t,e,i){var r=(new Path).attr({tag:"circle",cx:t,cy:e,r:i});return this.paths.push(r),r},Paper.prototype.rect=function(t,e,i,r){var h=(new Path).attr({tag:"rect",x:t,y:e,width:i,height:r});return this.paths.push(h),h},Paper.prototype.setSize=function(t,e){return this.width=t,this.height=e,this},Paper.prototype.toString=function(){var t=this.viewBox?'viewBox="'+this.viewBox+'"':"",e='<svg version="'+this.version+'" xmlns="'+this.xmlns+'" width="'+this.width+'" height="'+this.height+'" '+t+' preserveAspectRatio="xMidYMax meet">';return e+="<defs>",e+='  <style type="text/css"><![CDATA[',e+="     path {",e+="       stroke-width:0.5px",e+="     }",e+="  ]]></style>",e+="</defs>",e+=_.map(this.paths,function(t){return t.toString()}).join("\n"),e+="</svg>"},Paper.prototype.getBoundingBoxSize=function(){var t=0,e=0;return _.each(this.container.children[0].children,function(i){var r=i.getBBox();e=_.max([e,r.x+r.width]),t=_.max([t,r.y+r.height])}),{height:t,width:e}},Paper.prototype.setViewBox=function(t,e,i,r){this.viewBox=t+" "+e+" "+i+" "+r},module.exports=Raphael},{underscore:7}],3:[function(require,module,exports){var Normal=require("box-muller"),seed=require("seed-random"),qs=require("querystring"),Utils=require("./utils"),Raphael=require("./raphael-lite");console.log("This is Literal Trees version 0.1.96");var Tree=function(e){var r=this;r.PERSISTANT_LINK,r.inputOptions=e,r.PAPER_WIDTH=e.width,r.PAPER_HEIGHT=e.height,r.DEBUG=e.debug||!1,r.TREE_MIN_X=1/0,r.TREE_MAX_X=0,r.TREE_MIN_Y=1/0,r.TREE_MAX_Y=0,r.paper=Raphael("#paper",r.PAPER_WIDTH,r.PAPER_HEIGHT),r.WINDX=parseInt(e.windx,10)||0,r.WINDY=parseInt(e.windy,10)||0,r.TRUNK_ANGLE=e.ta||90,r.TRUNK_HEIGHT=e.trunkheight||.6,r.COLOR=e.color||"black",r.BACKGROUND_COLOR=e.bgcolor||"none",r.MAX_DEPTH=parseInt(e.depth,10)||6,r.ANGLE_RANGE_MEAN=parseInt(e.arm,10)||65,r.ANGLE_RANGE_VARIANCE=e.arv||5,r.CIRCLE_ORIGINS=e.co||!1,r.CIRCLE_ENDS=e.ce||!1,r.BRANCH_AT_TIP=e.bat,r.BRANCH_LOCATION_DENOMINATOR=parseFloat(e.bld,10)||3,r.SHOW_BRANCHES=e.showbranches,r.CIRCLE_RADIUS=e.circleradius||1,r.MARGIN="undefined"!=typeof e.margin?parseFloat(e.margin):.05,e.seed||(e.seed=Math.random().toString(35).substr(2,16)),r.seed=e.seed,self.postMessage({event:"seed",value:r.seed}),seed(r.seed,{global:!0})};Tree.prototype.branch=function(e){for(var r=this,t=e.maxDepth,E=[{x:e.x,y:e.y,depth:0,referenceAngle:e.referenceAngle,previousLength:30}];E.length;){var a=E.shift();if(a.depth!==t){if(0===a.depth){var _=r.PAPER_HEIGHT*r.TRUNK_HEIGHT;r.paper.path(Utils.path("M",a.x,a.y,"L",a.x,_)).attr("stroke",r.COLOR),a.y+_<r.TREE_MIN_Y&&(r.TREE_MIN_Y=a.y+_),a.y+_>r.TREE_MAX_Y&&(r.TREE_MAX_Y=a.y+_)}for(var n=Normal()*r.ANGLE_RANGE_VARIANCE+r.ANGLE_RANGE_MEAN,s=Math.floor(.5*Normal()+Utils.LinearTransform([0,t],[4,8],a.depth)),i=[],R=1/0,o=0;s>o;o++){var p=5*Normal()-n/2+o*n/(s-1);Math.abs(p)<Math.abs(R)&&(R=p),i.push(p)}for(var o=0;s>o;o++){var p=i[o],A=a.referenceAngle+p,T=10*Normal()+Utils.LinearTransform([0,t],[75,0],a.depth);if(!(0>=T)){var l={x:a.x,y:a.y};if(!r.BRANCH_AT_TIP&&p!=R){var N=Utils.LinearTransform([0,1],[0,a.previousLength/r.BRANCH_LOCATION_DENOMINATOR],Math.random()),I=N*Math.cos(Utils.rad(a.referenceAngle)),h=N*Math.sin(Utils.rad(a.referenceAngle));l.x=a.x-I,l.y=a.y+h}r.CIRCLE_ORIGINS&&r.paper.circle(l.x,l.y,r.CIRCLE_RADIUS).attr({stroke:"none",fill:r.COLOR});var M=T*Math.cos(Utils.rad(A)),d=-T*Math.sin(Utils.rad(A));l.x+M<r.TREE_MIN_X&&(r.TREE_MIN_X=l.x+M),l.x+M>r.TREE_MAX_X&&(r.TREE_MAX_X=l.x+M),l.y+d<r.TREE_MIN_Y&&(r.TREE_MIN_Y=l.y+d),l.y+d>r.TREE_MAX_Y&&(r.TREE_MAX_Y=l.y+d),r.SHOW_BRANCHES&&r.paper.path(Utils.path("M",l.x,l.y,"l",M,d)).attr("stroke",r.COLOR),r.CIRCLE_ENDS&&r.paper.circle(l.x+M,l.y+d,r.CIRCLE_RADIUS).attr({stroke:"none",fill:r.COLOR}),E.push({x:l.x+M,y:l.y+d,depth:a.depth+1,referenceAngle:a.referenceAngle+p,previousLength:T})}}}}},Tree.prototype.start=function(e){console.time("tree-rendering");var r=Date.now(),t=this;t.branch({x:0,y:0,maxDepth:t.MAX_DEPTH,referenceAngle:t.TRUNK_ANGLE}),console.timeEnd("tree-rendering");var E=Date.now()-r;t.inputOptions.tr=E,t.inputOptions.seed=t.seed,t.inputOptions.version="0.1.96",self.postMessage({event:"metrics",value:qs.stringify(t.inputOptions)});{var a=t.TREE_MAX_Y-t.TREE_MIN_Y,_=t.TREE_MAX_X-t.TREE_MIN_X,n=t.PAPER_HEIGHT/a,s=t.PAPER_WIDTH/_;Math.min(n,s)}t.paper.setSize("100%","95%"),t.paper.setViewBox(t.TREE_MIN_X,t.TREE_MIN_Y,_,a),t.DEBUG&&t.paper.rect(t.TREE_MIN_X,t.TREE_MIN_Y,_,a).attr({fill:"none",stroke:"blue"}),"function"==typeof e&&e(t.paper.toString())},module.exports=Tree},{"./raphael-lite":2,"./utils":4,"box-muller":5,querystring:10,"seed-random":6}],4:[function(require,module,exports){module.exports.LinearTransform=function(e,r,t){var o=(r[1]-r[0])/(e[1]-e[0]),n=r[0]-o*e[0];return"number"==typeof t?o*t+n:function(e){return o*e+n}},module.exports.rad=function(e){return Math.PI*e/180},module.exports.path=function(){var e=!1,r="";return Array.prototype.slice.call(arguments,0).forEach(function(t){"number"==typeof t&&e&&(r+=","),r+=t,e="number"==typeof t}),r},module.exports.decimal2hex=function(e){var r=(10>e?"0":"")+e.toString(16);return 1===r.length?"0"+r:r},module.exports.rgb2hex=function(e,r,t){return"#"+module.exports.decimal2hex(e)+module.exports.decimal2hex(r)+module.exports.decimal2hex(t)}},{}],5:[function(require,module,exports){module.exports=polar;module.exports.basic=basic;var phase=0;var v2,s;function polar(){var u1,u2,v1,result;if(phase==1){result=v2*Math.sqrt(-2*Math.log(s)/s)}else{do{u1=Math.random();u2=Math.random();v1=2*u1-1;v2=2*u2-1;s=v1*v1+v2*v2}while(s>=1||s==0);result=v1*Math.sqrt(-2*Math.log(s)/s)}phase=1-phase;return result}function basic(){var u=Math.random();var v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}},{}],6:[function(require,module,exports){(function(global){"use strict";var width=256;var chunks=6;var digits=52;var pool=[];var GLOBAL=typeof global==="undefined"?window:global;var startdenom=Math.pow(width,chunks),significance=Math.pow(2,digits),overflow=significance*2,mask=width-1;var oldRandom=Math.random;module.exports=function(seed,options){if(options&&options.global===true){options.global=false;Math.random=module.exports(seed,options);options.global=true;return Math.random}var use_entropy=options&&options.entropy||false;var key=[];var shortseed=mixkey(flatten(use_entropy?[seed,tostring(pool)]:0 in arguments?seed:autoseed(),3),key);var arc4=new ARC4(key);mixkey(tostring(arc4.S),pool);return function(){var n=arc4.g(chunks),d=startdenom,x=0;while(n<significance){n=(n+x)*width;d*=width;x=arc4.g(1)}while(n>=overflow){n/=2;d/=2;x>>>=1}return(n+x)/d}};module.exports.resetGlobal=function(){Math.random=oldRandom};function ARC4(key){var t,keylen=key.length,me=this,i=0,j=me.i=me.j=0,s=me.S=[];if(!keylen){key=[keylen++]}while(i<width){s[i]=i++}for(i=0;i<width;i++){s[i]=s[j=mask&j+key[i%keylen]+(t=s[i])];s[j]=t}(me.g=function(count){var t,r=0,i=me.i,j=me.j,s=me.S;while(count--){t=s[i=mask&i+1];r=r*width+s[mask&(s[i]=s[j=mask&j+t])+(s[j]=t)]}me.i=i;me.j=j;return r})(width)}function flatten(obj,depth){var result=[],typ=(typeof obj)[0],prop;if(depth&&typ=="o"){for(prop in obj){try{result.push(flatten(obj[prop],depth-1))}catch(e){}}}return result.length?result:typ=="s"?obj:obj+"\x00"}function mixkey(seed,key){var stringseed=seed+"",smear,j=0;while(j<stringseed.length){key[mask&j]=mask&(smear^=key[mask&j]*19)+stringseed.charCodeAt(j++)}return tostring(key)}function autoseed(seed){try{GLOBAL.crypto.getRandomValues(seed=new Uint8Array(width));return tostring(seed)}catch(e){return[+new Date,GLOBAL,GLOBAL.navigator&&GLOBAL.navigator.plugins,GLOBAL.screen,tostring(pool)]}}function tostring(a){return String.fromCharCode.apply(0,a)}mixkey(Math.random(),pool)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],7:[function(require,module,exports){(function(){var root=this;var previousUnderscore=root._;var ArrayProto=Array.prototype,ObjProto=Object.prototype,FuncProto=Function.prototype;var push=ArrayProto.push,slice=ArrayProto.slice,concat=ArrayProto.concat,toString=ObjProto.toString,hasOwnProperty=ObjProto.hasOwnProperty;var nativeIsArray=Array.isArray,nativeKeys=Object.keys,nativeBind=FuncProto.bind;var _=function(obj){if(obj instanceof _)return obj;if(!(this instanceof _))return new _(obj);this._wrapped=obj};if(typeof exports!=="undefined"){if(typeof module!=="undefined"&&module.exports){exports=module.exports=_}exports._=_}else{root._=_}_.VERSION="1.7.0";var createCallback=function(func,context,argCount){if(context===void 0)return func;switch(argCount==null?3:argCount){case 1:return function(value){return func.call(context,value)};case 2:return function(value,other){return func.call(context,value,other)};case 3:return function(value,index,collection){return func.call(context,value,index,collection)};case 4:return function(accumulator,value,index,collection){return func.call(context,accumulator,value,index,collection)}}return function(){return func.apply(context,arguments)}};_.iteratee=function(value,context,argCount){if(value==null)return _.identity;if(_.isFunction(value))return createCallback(value,context,argCount);if(_.isObject(value))return _.matches(value);return _.property(value)};_.each=_.forEach=function(obj,iteratee,context){if(obj==null)return obj;iteratee=createCallback(iteratee,context);var i,length=obj.length;if(length===+length){for(i=0;i<length;i++){iteratee(obj[i],i,obj)}}else{var keys=_.keys(obj);for(i=0,length=keys.length;i<length;i++){iteratee(obj[keys[i]],keys[i],obj)}}return obj};_.map=_.collect=function(obj,iteratee,context){if(obj==null)return[];iteratee=_.iteratee(iteratee,context);var keys=obj.length!==+obj.length&&_.keys(obj),length=(keys||obj).length,results=Array(length),currentKey;for(var index=0;index<length;index++){currentKey=keys?keys[index]:index;results[index]=iteratee(obj[currentKey],currentKey,obj)}return results};var reduceError="Reduce of empty array with no initial value";_.reduce=_.foldl=_.inject=function(obj,iteratee,memo,context){if(obj==null)obj=[];iteratee=createCallback(iteratee,context,4);var keys=obj.length!==+obj.length&&_.keys(obj),length=(keys||obj).length,index=0,currentKey;if(arguments.length<3){if(!length)throw new TypeError(reduceError);memo=obj[keys?keys[index++]:index++]}for(;index<length;index++){currentKey=keys?keys[index]:index;memo=iteratee(memo,obj[currentKey],currentKey,obj)}return memo};_.reduceRight=_.foldr=function(obj,iteratee,memo,context){if(obj==null)obj=[];iteratee=createCallback(iteratee,context,4);var keys=obj.length!==+obj.length&&_.keys(obj),index=(keys||obj).length,currentKey;if(arguments.length<3){if(!index)throw new TypeError(reduceError);memo=obj[keys?keys[--index]:--index]}while(index--){currentKey=keys?keys[index]:index;memo=iteratee(memo,obj[currentKey],currentKey,obj)}return memo};_.find=_.detect=function(obj,predicate,context){var result;predicate=_.iteratee(predicate,context);_.some(obj,function(value,index,list){if(predicate(value,index,list)){result=value;return true}});return result};_.filter=_.select=function(obj,predicate,context){var results=[];if(obj==null)return results;predicate=_.iteratee(predicate,context);_.each(obj,function(value,index,list){if(predicate(value,index,list))results.push(value)});return results};_.reject=function(obj,predicate,context){return _.filter(obj,_.negate(_.iteratee(predicate)),context)};_.every=_.all=function(obj,predicate,context){if(obj==null)return true;predicate=_.iteratee(predicate,context);var keys=obj.length!==+obj.length&&_.keys(obj),length=(keys||obj).length,index,currentKey;for(index=0;index<length;index++){currentKey=keys?keys[index]:index;if(!predicate(obj[currentKey],currentKey,obj))return false}return true};_.some=_.any=function(obj,predicate,context){if(obj==null)return false;predicate=_.iteratee(predicate,context);var keys=obj.length!==+obj.length&&_.keys(obj),length=(keys||obj).length,index,currentKey;for(index=0;index<length;index++){currentKey=keys?keys[index]:index;if(predicate(obj[currentKey],currentKey,obj))return true}return false};_.contains=_.include=function(obj,target){if(obj==null)return false;if(obj.length!==+obj.length)obj=_.values(obj);return _.indexOf(obj,target)>=0};_.invoke=function(obj,method){var args=slice.call(arguments,2);var isFunc=_.isFunction(method);return _.map(obj,function(value){return(isFunc?method:value[method]).apply(value,args)})};_.pluck=function(obj,key){return _.map(obj,_.property(key))};_.where=function(obj,attrs){return _.filter(obj,_.matches(attrs))};_.findWhere=function(obj,attrs){return _.find(obj,_.matches(attrs))};_.max=function(obj,iteratee,context){var result=-Infinity,lastComputed=-Infinity,value,computed;if(iteratee==null&&obj!=null){obj=obj.length===+obj.length?obj:_.values(obj);for(var i=0,length=obj.length;i<length;i++){value=obj[i];if(value>result){result=value}}}else{iteratee=_.iteratee(iteratee,context);_.each(obj,function(value,index,list){computed=iteratee(value,index,list);if(computed>lastComputed||computed===-Infinity&&result===-Infinity){result=value;lastComputed=computed}})}return result};_.min=function(obj,iteratee,context){var result=Infinity,lastComputed=Infinity,value,computed;if(iteratee==null&&obj!=null){obj=obj.length===+obj.length?obj:_.values(obj);for(var i=0,length=obj.length;i<length;i++){value=obj[i];if(value<result){result=value}}}else{iteratee=_.iteratee(iteratee,context);_.each(obj,function(value,index,list){computed=iteratee(value,index,list);if(computed<lastComputed||computed===Infinity&&result===Infinity){result=value;lastComputed=computed}})}return result};_.shuffle=function(obj){var set=obj&&obj.length===+obj.length?obj:_.values(obj);var length=set.length;var shuffled=Array(length);for(var index=0,rand;index<length;index++){rand=_.random(0,index);if(rand!==index)shuffled[index]=shuffled[rand];shuffled[rand]=set[index]}return shuffled};_.sample=function(obj,n,guard){if(n==null||guard){if(obj.length!==+obj.length)obj=_.values(obj);return obj[_.random(obj.length-1)]}return _.shuffle(obj).slice(0,Math.max(0,n))};_.sortBy=function(obj,iteratee,context){iteratee=_.iteratee(iteratee,context);return _.pluck(_.map(obj,function(value,index,list){return{value:value,index:index,criteria:iteratee(value,index,list)}}).sort(function(left,right){var a=left.criteria;var b=right.criteria;if(a!==b){if(a>b||a===void 0)return 1;if(a<b||b===void 0)return-1}return left.index-right.index}),"value")};var group=function(behavior){return function(obj,iteratee,context){var result={};iteratee=_.iteratee(iteratee,context);_.each(obj,function(value,index){var key=iteratee(value,index,obj);behavior(result,value,key)});return result}};_.groupBy=group(function(result,value,key){if(_.has(result,key))result[key].push(value);else result[key]=[value]});_.indexBy=group(function(result,value,key){result[key]=value});_.countBy=group(function(result,value,key){if(_.has(result,key))result[key]++;else result[key]=1});_.sortedIndex=function(array,obj,iteratee,context){iteratee=_.iteratee(iteratee,context,1);var value=iteratee(obj);var low=0,high=array.length;while(low<high){var mid=low+high>>>1;if(iteratee(array[mid])<value)low=mid+1;else high=mid}return low};_.toArray=function(obj){if(!obj)return[];if(_.isArray(obj))return slice.call(obj);if(obj.length===+obj.length)return _.map(obj,_.identity);return _.values(obj)};_.size=function(obj){if(obj==null)return 0;return obj.length===+obj.length?obj.length:_.keys(obj).length};_.partition=function(obj,predicate,context){predicate=_.iteratee(predicate,context);var pass=[],fail=[];_.each(obj,function(value,key,obj){(predicate(value,key,obj)?pass:fail).push(value)});return[pass,fail]};_.first=_.head=_.take=function(array,n,guard){if(array==null)return void 0;if(n==null||guard)return array[0];if(n<0)return[];return slice.call(array,0,n)};_.initial=function(array,n,guard){return slice.call(array,0,Math.max(0,array.length-(n==null||guard?1:n)))};_.last=function(array,n,guard){if(array==null)return void 0;if(n==null||guard)return array[array.length-1];return slice.call(array,Math.max(array.length-n,0))};_.rest=_.tail=_.drop=function(array,n,guard){return slice.call(array,n==null||guard?1:n)};_.compact=function(array){return _.filter(array,_.identity)};var flatten=function(input,shallow,strict,output){if(shallow&&_.every(input,_.isArray)){return concat.apply(output,input)}for(var i=0,length=input.length;i<length;i++){var value=input[i];if(!_.isArray(value)&&!_.isArguments(value)){if(!strict)output.push(value)}else if(shallow){push.apply(output,value)}else{flatten(value,shallow,strict,output)}}return output};_.flatten=function(array,shallow){return flatten(array,shallow,false,[])};_.without=function(array){return _.difference(array,slice.call(arguments,1))};_.uniq=_.unique=function(array,isSorted,iteratee,context){if(array==null)return[];if(!_.isBoolean(isSorted)){context=iteratee;iteratee=isSorted;isSorted=false}if(iteratee!=null)iteratee=_.iteratee(iteratee,context);var result=[];var seen=[];for(var i=0,length=array.length;i<length;i++){var value=array[i];if(isSorted){if(!i||seen!==value)result.push(value);seen=value}else if(iteratee){var computed=iteratee(value,i,array);if(_.indexOf(seen,computed)<0){seen.push(computed);result.push(value)}}else if(_.indexOf(result,value)<0){result.push(value)}}return result};_.union=function(){return _.uniq(flatten(arguments,true,true,[]))};_.intersection=function(array){if(array==null)return[];var result=[];var argsLength=arguments.length;for(var i=0,length=array.length;i<length;i++){var item=array[i];if(_.contains(result,item))continue;for(var j=1;j<argsLength;j++){if(!_.contains(arguments[j],item))break}if(j===argsLength)result.push(item)}return result};_.difference=function(array){var rest=flatten(slice.call(arguments,1),true,true,[]);return _.filter(array,function(value){return!_.contains(rest,value)})};_.zip=function(array){if(array==null)return[];var length=_.max(arguments,"length").length;var results=Array(length);for(var i=0;i<length;i++){results[i]=_.pluck(arguments,i)}return results};_.object=function(list,values){if(list==null)return{};var result={};for(var i=0,length=list.length;i<length;i++){if(values){result[list[i]]=values[i]}else{result[list[i][0]]=list[i][1]}}return result};_.indexOf=function(array,item,isSorted){if(array==null)return-1;var i=0,length=array.length;if(isSorted){if(typeof isSorted=="number"){i=isSorted<0?Math.max(0,length+isSorted):isSorted}else{i=_.sortedIndex(array,item);return array[i]===item?i:-1}}for(;i<length;i++)if(array[i]===item)return i;return-1};_.lastIndexOf=function(array,item,from){if(array==null)return-1;var idx=array.length;if(typeof from=="number"){idx=from<0?idx+from+1:Math.min(idx,from+1)}while(--idx>=0)if(array[idx]===item)return idx;return-1};_.range=function(start,stop,step){if(arguments.length<=1){stop=start||0;start=0}step=step||1;var length=Math.max(Math.ceil((stop-start)/step),0);var range=Array(length);for(var idx=0;idx<length;idx++,start+=step){range[idx]=start}return range};var Ctor=function(){};_.bind=function(func,context){var args,bound;if(nativeBind&&func.bind===nativeBind)return nativeBind.apply(func,slice.call(arguments,1));if(!_.isFunction(func))throw new TypeError("Bind must be called on a function");args=slice.call(arguments,2);bound=function(){if(!(this instanceof bound))return func.apply(context,args.concat(slice.call(arguments)));Ctor.prototype=func.prototype;var self=new Ctor;Ctor.prototype=null;var result=func.apply(self,args.concat(slice.call(arguments)));if(_.isObject(result))return result;return self};return bound};_.partial=function(func){var boundArgs=slice.call(arguments,1);return function(){var position=0;var args=boundArgs.slice();for(var i=0,length=args.length;i<length;i++){if(args[i]===_)args[i]=arguments[position++]}while(position<arguments.length)args.push(arguments[position++]);return func.apply(this,args)}};_.bindAll=function(obj){var i,length=arguments.length,key;if(length<=1)throw new Error("bindAll must be passed function names");for(i=1;i<length;i++){key=arguments[i];obj[key]=_.bind(obj[key],obj)}return obj};_.memoize=function(func,hasher){var memoize=function(key){var cache=memoize.cache;var address=hasher?hasher.apply(this,arguments):key;if(!_.has(cache,address))cache[address]=func.apply(this,arguments);return cache[address]};memoize.cache={};return memoize};_.delay=function(func,wait){var args=slice.call(arguments,2);return setTimeout(function(){return func.apply(null,args)},wait)};_.defer=function(func){return _.delay.apply(_,[func,1].concat(slice.call(arguments,1)))};_.throttle=function(func,wait,options){var context,args,result;var timeout=null;var previous=0;if(!options)options={};var later=function(){previous=options.leading===false?0:_.now();timeout=null;result=func.apply(context,args);if(!timeout)context=args=null};return function(){var now=_.now();if(!previous&&options.leading===false)previous=now;var remaining=wait-(now-previous);context=this;args=arguments;if(remaining<=0||remaining>wait){clearTimeout(timeout);timeout=null;previous=now;result=func.apply(context,args);if(!timeout)context=args=null}else if(!timeout&&options.trailing!==false){timeout=setTimeout(later,remaining)}return result}};_.debounce=function(func,wait,immediate){var timeout,args,context,timestamp,result;var later=function(){var last=_.now()-timestamp;if(last<wait&&last>0){timeout=setTimeout(later,wait-last)}else{timeout=null;if(!immediate){result=func.apply(context,args);if(!timeout)context=args=null}}};return function(){context=this;args=arguments;timestamp=_.now();var callNow=immediate&&!timeout;if(!timeout)timeout=setTimeout(later,wait);if(callNow){result=func.apply(context,args);context=args=null}return result}};_.wrap=function(func,wrapper){return _.partial(wrapper,func)};_.negate=function(predicate){return function(){return!predicate.apply(this,arguments)}};_.compose=function(){var args=arguments;var start=args.length-1;return function(){var i=start;var result=args[start].apply(this,arguments);while(i--)result=args[i].call(this,result);return result}};_.after=function(times,func){return function(){if(--times<1){return func.apply(this,arguments)}}};_.before=function(times,func){var memo;return function(){if(--times>0){memo=func.apply(this,arguments)}else{func=null}return memo}};_.once=_.partial(_.before,2);_.keys=function(obj){if(!_.isObject(obj))return[];if(nativeKeys)return nativeKeys(obj);var keys=[];for(var key in obj)if(_.has(obj,key))keys.push(key);return keys};_.values=function(obj){var keys=_.keys(obj);var length=keys.length;var values=Array(length);for(var i=0;i<length;i++){values[i]=obj[keys[i]]}return values};_.pairs=function(obj){var keys=_.keys(obj);var length=keys.length;var pairs=Array(length);for(var i=0;i<length;i++){pairs[i]=[keys[i],obj[keys[i]]]}return pairs};_.invert=function(obj){var result={};var keys=_.keys(obj);for(var i=0,length=keys.length;i<length;i++){result[obj[keys[i]]]=keys[i]}return result};_.functions=_.methods=function(obj){var names=[];for(var key in obj){if(_.isFunction(obj[key]))names.push(key)}return names.sort()};_.extend=function(obj){if(!_.isObject(obj))return obj;var source,prop;for(var i=1,length=arguments.length;i<length;i++){source=arguments[i];for(prop in source){if(hasOwnProperty.call(source,prop)){obj[prop]=source[prop]}}}return obj};_.pick=function(obj,iteratee,context){var result={},key;if(obj==null)return result;if(_.isFunction(iteratee)){iteratee=createCallback(iteratee,context);for(key in obj){var value=obj[key];if(iteratee(value,key,obj))result[key]=value}}else{var keys=concat.apply([],slice.call(arguments,1));obj=new Object(obj);for(var i=0,length=keys.length;i<length;i++){key=keys[i];if(key in obj)result[key]=obj[key]}}return result};_.omit=function(obj,iteratee,context){if(_.isFunction(iteratee)){iteratee=_.negate(iteratee)}else{var keys=_.map(concat.apply([],slice.call(arguments,1)),String);iteratee=function(value,key){return!_.contains(keys,key)}}return _.pick(obj,iteratee,context)};_.defaults=function(obj){if(!_.isObject(obj))return obj;for(var i=1,length=arguments.length;i<length;i++){var source=arguments[i];for(var prop in source){if(obj[prop]===void 0)obj[prop]=source[prop]}}return obj};_.clone=function(obj){if(!_.isObject(obj))return obj;return _.isArray(obj)?obj.slice():_.extend({},obj)};_.tap=function(obj,interceptor){interceptor(obj);return obj};var eq=function(a,b,aStack,bStack){if(a===b)return a!==0||1/a===1/b;if(a==null||b==null)return a===b;if(a instanceof _)a=a._wrapped;if(b instanceof _)b=b._wrapped;var className=toString.call(a);if(className!==toString.call(b))return false;switch(className){case"[object RegExp]":case"[object String]":return""+a===""+b;case"[object Number]":if(+a!==+a)return+b!==+b;return+a===0?1/+a===1/b:+a===+b;case"[object Date]":case"[object Boolean]":return+a===+b}if(typeof a!="object"||typeof b!="object")return false;var length=aStack.length;while(length--){if(aStack[length]===a)return bStack[length]===b}var aCtor=a.constructor,bCtor=b.constructor;if(aCtor!==bCtor&&"constructor"in a&&"constructor"in b&&!(_.isFunction(aCtor)&&aCtor instanceof aCtor&&_.isFunction(bCtor)&&bCtor instanceof bCtor)){return false}aStack.push(a);bStack.push(b);var size,result;if(className==="[object Array]"){size=a.length;result=size===b.length;if(result){while(size--){if(!(result=eq(a[size],b[size],aStack,bStack)))break}}}else{var keys=_.keys(a),key;size=keys.length;result=_.keys(b).length===size;if(result){while(size--){key=keys[size];if(!(result=_.has(b,key)&&eq(a[key],b[key],aStack,bStack)))break}}}aStack.pop();bStack.pop();return result};_.isEqual=function(a,b){return eq(a,b,[],[])};_.isEmpty=function(obj){if(obj==null)return true;if(_.isArray(obj)||_.isString(obj)||_.isArguments(obj))return obj.length===0;for(var key in obj)if(_.has(obj,key))return false;return true};_.isElement=function(obj){return!!(obj&&obj.nodeType===1)};_.isArray=nativeIsArray||function(obj){return toString.call(obj)==="[object Array]"};_.isObject=function(obj){var type=typeof obj;return type==="function"||type==="object"&&!!obj};_.each(["Arguments","Function","String","Number","Date","RegExp"],function(name){_["is"+name]=function(obj){return toString.call(obj)==="[object "+name+"]"}});if(!_.isArguments(arguments)){_.isArguments=function(obj){return _.has(obj,"callee")}}if(typeof/./!=="function"){_.isFunction=function(obj){return typeof obj=="function"||false}}_.isFinite=function(obj){return isFinite(obj)&&!isNaN(parseFloat(obj))};_.isNaN=function(obj){return _.isNumber(obj)&&obj!==+obj};_.isBoolean=function(obj){return obj===true||obj===false||toString.call(obj)==="[object Boolean]"};_.isNull=function(obj){return obj===null};_.isUndefined=function(obj){return obj===void 0};_.has=function(obj,key){return obj!=null&&hasOwnProperty.call(obj,key)};_.noConflict=function(){root._=previousUnderscore;return this};_.identity=function(value){return value};_.constant=function(value){return function(){return value}};_.noop=function(){};_.property=function(key){return function(obj){return obj[key]}};_.matches=function(attrs){var pairs=_.pairs(attrs),length=pairs.length;return function(obj){if(obj==null)return!length;obj=new Object(obj);for(var i=0;i<length;i++){var pair=pairs[i],key=pair[0];if(pair[1]!==obj[key]||!(key in obj))return false}return true}};_.times=function(n,iteratee,context){var accum=Array(Math.max(0,n));iteratee=createCallback(iteratee,context,1);for(var i=0;i<n;i++)accum[i]=iteratee(i);return accum};_.random=function(min,max){if(max==null){max=min;min=0}return min+Math.floor(Math.random()*(max-min+1))};_.now=Date.now||function(){return(new Date).getTime()};var escapeMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};var unescapeMap=_.invert(escapeMap);var createEscaper=function(map){var escaper=function(match){return map[match]};var source="(?:"+_.keys(map).join("|")+")";var testRegexp=RegExp(source);var replaceRegexp=RegExp(source,"g");return function(string){string=string==null?"":""+string;return testRegexp.test(string)?string.replace(replaceRegexp,escaper):string}};_.escape=createEscaper(escapeMap);_.unescape=createEscaper(unescapeMap);_.result=function(object,property){if(object==null)return void 0;var value=object[property];return _.isFunction(value)?object[property]():value};var idCounter=0;_.uniqueId=function(prefix){var id=++idCounter+"";return prefix?prefix+id:id};_.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var noMatch=/(.)^/;var escapes={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"};var escaper=/\\|'|\r|\n|\u2028|\u2029/g;var escapeChar=function(match){return"\\"+escapes[match]};_.template=function(text,settings,oldSettings){if(!settings&&oldSettings)settings=oldSettings;settings=_.defaults({},settings,_.templateSettings);var matcher=RegExp([(settings.escape||noMatch).source,(settings.interpolate||noMatch).source,(settings.evaluate||noMatch).source].join("|")+"|$","g");var index=0;var source="__p+='";text.replace(matcher,function(match,escape,interpolate,evaluate,offset){source+=text.slice(index,offset).replace(escaper,escapeChar);index=offset+match.length;if(escape){source+="'+\n((__t=("+escape+"))==null?'':_.escape(__t))+\n'"}else if(interpolate){source+="'+\n((__t=("+interpolate+"))==null?'':__t)+\n'"}else if(evaluate){source+="';\n"+evaluate+"\n__p+='"}return match});source+="';\n";if(!settings.variable)source="with(obj||{}){\n"+source+"}\n";source="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+source+"return __p;\n";try{var render=new Function(settings.variable||"obj","_",source)}catch(e){e.source=source;throw e}var template=function(data){return render.call(this,data,_)};var argument=settings.variable||"obj";template.source="function("+argument+"){\n"+source+"}";return template};_.chain=function(obj){var instance=_(obj);instance._chain=true;return instance};var result=function(obj){return this._chain?_(obj).chain():obj};_.mixin=function(obj){_.each(_.functions(obj),function(name){var func=_[name]=obj[name];_.prototype[name]=function(){var args=[this._wrapped];push.apply(args,arguments);return result.call(this,func.apply(_,args))}})};_.mixin(_);_.each(["pop","push","reverse","shift","sort","splice","unshift"],function(name){var method=ArrayProto[name];_.prototype[name]=function(){var obj=this._wrapped;method.apply(obj,arguments);if((name==="shift"||name==="splice")&&obj.length===0)delete obj[0];
return result.call(this,obj)}});_.each(["concat","join","slice"],function(name){var method=ArrayProto[name];_.prototype[name]=function(){return result.call(this,method.apply(this._wrapped,arguments))}});_.prototype.value=function(){return this._wrapped};if(typeof define==="function"&&define.amd){define("underscore",[],function(){return _})}}).call(this)},{}],8:[function(require,module,exports){"use strict";function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop)}module.exports=function(qs,sep,eq,options){sep=sep||"&";eq=eq||"=";var obj={};if(typeof qs!=="string"||qs.length===0){return obj}var regexp=/\+/g;qs=qs.split(sep);var maxKeys=1e3;if(options&&typeof options.maxKeys==="number"){maxKeys=options.maxKeys}var len=qs.length;if(maxKeys>0&&len>maxKeys){len=maxKeys}for(var i=0;i<len;++i){var x=qs[i].replace(regexp,"%20"),idx=x.indexOf(eq),kstr,vstr,k,v;if(idx>=0){kstr=x.substr(0,idx);vstr=x.substr(idx+1)}else{kstr=x;vstr=""}k=decodeURIComponent(kstr);v=decodeURIComponent(vstr);if(!hasOwnProperty(obj,k)){obj[k]=v}else if(isArray(obj[k])){obj[k].push(v)}else{obj[k]=[obj[k],v]}}return obj};var isArray=Array.isArray||function(xs){return Object.prototype.toString.call(xs)==="[object Array]"}},{}],9:[function(require,module,exports){"use strict";var stringifyPrimitive=function(v){switch(typeof v){case"string":return v;case"boolean":return v?"true":"false";case"number":return isFinite(v)?v:"";default:return""}};module.exports=function(obj,sep,eq,name){sep=sep||"&";eq=eq||"=";if(obj===null){obj=undefined}if(typeof obj==="object"){return map(objectKeys(obj),function(k){var ks=encodeURIComponent(stringifyPrimitive(k))+eq;if(isArray(obj[k])){return map(obj[k],function(v){return ks+encodeURIComponent(stringifyPrimitive(v))}).join(sep)}else{return ks+encodeURIComponent(stringifyPrimitive(obj[k]))}}).join(sep)}if(!name)return"";return encodeURIComponent(stringifyPrimitive(name))+eq+encodeURIComponent(stringifyPrimitive(obj))};var isArray=Array.isArray||function(xs){return Object.prototype.toString.call(xs)==="[object Array]"};function map(xs,f){if(xs.map)return xs.map(f);var res=[];for(var i=0;i<xs.length;i++){res.push(f(xs[i],i))}return res}var objectKeys=Object.keys||function(obj){var res=[];for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))res.push(key)}return res}},{}],10:[function(require,module,exports){"use strict";exports.decode=exports.parse=require("./decode");exports.encode=exports.stringify=require("./encode")},{"./decode":8,"./encode":9}]},{},[1]);
