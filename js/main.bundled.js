!function t(n,e,r){function i(a,u){if(!e[a]){if(!n[a]){var s="function"==typeof require&&require;if(!u&&s)return s(a,!0);if(o)return o(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var l=e[a]={exports:{}};n[a][0].call(l.exports,function(t){var e=n[a][1][t];return i(e?e:t)},l,l.exports,t,n,e,r)}return e[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(t,n){n.exports={debug:!1,windx:0,windy:0,trunkangle:90,trunkheight:1,color:"black",bgcolor:"none",depth:6,arm:65,arv:5,co:!1,ce:!1,bat:!1,bld:3,showbranches:!0,circleradius:1,margin:0,aspectratio:void 0,sizingmethod:"contain"}},{}],2:[function(t){var n=t("./tree");self.onmessage=function(t){if("inputs"===t.data.event){var e=new n(t.data);e.start(function(t,n,e){self.postMessage({event:"svg",width:n,height:e,value:t})})}}},{"./tree":5}],3:[function(t,n){function e(t){return"undefined"!=typeof t&&(this.d=t),this}function r(t,n,e){this.width=n||0,this.height=e||0,this.container=t,this.paths=[],this.xmlns="http://www.w3.org/2000/svg",this.version="1.1",this.viewBox=null}function i(t,n,e){return new r(t,n,e)}var o=t("underscore");e.prototype.attr=function(t){var n=this;return 2==arguments.length?n[arguments[0]]=arguments[1]:o.keys(t).forEach(function(e){n[e]=t[e]}),n},e.prototype.toString=function(){var t=this,n=o.map(o.keys(t),function(n){return n+'="'+t[n]+'"'}).join(" "),e=t.tag||"path",r="<"+e+" "+n+"/>";return r},r.prototype.path=function(t,n){n=n||{};var r=new e(t);return n.top?this.paths.push(r):n.bottom?this.paths.unshift(r):this.paths.push(r),r},r.prototype.circle=function(t,n,r){var i=(new e).attr({tag:"circle",cx:t,cy:n,r:r});return this.paths.push(i),i},r.prototype.rect=function(t,n,r,i){var o=(new e).attr({tag:"rect",x:t,y:n,width:r,height:i});return this.paths.push(o),o},r.prototype.setSize=function(t,n){return this.width=t,this.height=n,this},r.prototype.toString=function(){var t=this.viewBox?'viewBox="'+this.viewBox+'"':"",n='<svg version="'+this.version+'" xmlns="'+this.xmlns+'" width="'+this.width+'" height="'+this.height+'" '+t+' preserveAspectRatio="xMidYMax meet">';return n+="<defs>",n+='  <style type="text/css"><![CDATA[',n+="     path {",n+="       stroke-width:0.5px",n+="     }",n+="  ]]></style>",n+="</defs>",n+=o.map(this.paths,function(t){return t.toString()}).join("\n"),n+="</svg>"},r.prototype.getBoundingBoxSize=function(){var t=0,n=0;return o.each(this.container.children[0].children,function(e){var r=e.getBBox();n=o.max([n,r.x+r.width]),t=o.max([t,r.y+r.height])}),{height:t,width:n}},r.prototype.setViewBox=function(t,n,e,r){this.viewBox=t+" "+n+" "+e+" "+r},n.exports=i},{underscore:9}],4:[function(t,n){n.exports.shouldForceAspectRatio=function(){return!1},n.exports.calculateViewBox=function(t){var n=t.treeWidth+2*t.margin,e=t.treeHeight+t.margin,r={x:t.treeMinX-t.margin,y:t.treeMinY-t.margin,width:n,height:e};if(t.screenWidth===t.clientWidth){var i=t.screenHeight/t.screenWidth,o=e/n;if(i>1)if(self.postMessage({event:"log",msg:"Screen aspect ratio > 1. Resizing."}),"contain"===t.sizingmethod){if(o>i){var a=e/t.screenHeight*t.screenWidth-n;r.x=r.x-a/2,r.width=r.width+a,self.postMessage({event:"log",msg:"Extra width needed: "+a.toFixed(2)})}else if(i>o){var u=n/t.screenWidth*t.screenHeight-e;r.y=r.y-u,r.height=r.height+u,self.postMessage({event:"log",msg:"Extra height needed: "+u.toFixed(2)})}}else"cover"===t.sizingmethod&&self.postMessage({event:"log",msg:'"cover" sizingmethod not implemented!'})}return r}},{}],5:[function(t,n){var e=t("box-muller"),r=t("seed-random"),i=t("querystring"),o=t("./utils"),a=t("./raphael-lite"),u=t("underscore"),s=t("./default-tree-options"),c=t("./tree-sizing");console.log("[literal-trees] this is Literal Trees version 1.30.0");var l=function(t){var n=this;n.userOptions=t,n.options={},u.defaults(n.options,t),u.defaults(n.options,s);var e=n.options.debug;e&&(console.log("[literal-trees] user options",n.userOptions),console.log("[literal-trees] tree options",n.options)),n.PERSISTANT_LINK,n.TREE_MIN_X=1/0,n.TREE_MAX_X=0,n.TREE_MIN_Y=1/0,n.TREE_MAX_Y=0,n.paper=a("#paper",n.options.paperWidth,n.options.paperHeight),n.userOptions.seed||(n.userOptions.seed=Math.random().toString(35).substr(2,16)),n.seed=n.userOptions.seed,self.postMessage({event:"seed",value:n.seed}),r(n.seed,{global:!0})};l.prototype.branch=function(t){for(var n=this,r=t.maxDepth,i=[{x:t.x,y:t.y,depth:0,referenceAngle:t.referenceAngle,previousLength:30}];i.length;){var a=i.shift();if(a.depth!==r){var u=.5;if(0===a.depth){var s=n.options.paperHeight*n.options.trunkheight;a.y+s<n.TREE_MIN_Y&&(n.TREE_MIN_Y=a.y+s),a.y+s>n.TREE_MAX_Y&&(n.TREE_MAX_Y=a.y+s),n.options.showbranches&&n.paper.path(o.path("M",a.x,a.y,"L",a.x,s)).attr({stroke:n.options.color,"stroke-width":.5}),n.options.co&&n.paper.circle(a.x,s,n.options.circleradius).attr({stroke:"none",fill:n.options.color}),n.options.ce&&n.paper.circle(a.x,a.y,n.options.circleradius).attr({stroke:"none",fill:n.options.color})}for(var c=e()*n.options.arv+n.options.arm,l=Math.floor(.5*e()+o.LinearTransform([0,r],[4,8],a.depth)),f=[],p=1/0,h=0;l>h;h++)g=5*e()-c/2+h*c/(l-1),Math.abs(g)<Math.abs(p)&&(p=g),f.push(g);for(h=0;l>h;h++){var g=f[h],d=a.referenceAngle+g,v=10*e()+o.LinearTransform([0,r],[75,0],a.depth);if(!(0>=v)){var y={x:a.x,y:a.y};if(!n.options.bat&&g!=p){var m=o.LinearTransform([0,1],[0,a.previousLength/n.options.bld],Math.random()),x=m*Math.cos(o.rad(a.referenceAngle)),_=m*Math.sin(o.rad(a.referenceAngle));y.x=a.x-x,y.y=a.y+_}n.options.co&&n.paper.circle(y.x,y.y,n.options.circleradius).attr({stroke:"none",fill:n.options.color});var w=v*Math.cos(o.rad(d)),b=-v*Math.sin(o.rad(d));y.x+w<n.TREE_MIN_X&&(n.TREE_MIN_X=y.x+w),y.x+w>n.TREE_MAX_X&&(n.TREE_MAX_X=y.x+w),y.y+b<n.TREE_MIN_Y&&(n.TREE_MIN_Y=y.y+b),y.y+b>n.TREE_MAX_Y&&(n.TREE_MAX_Y=y.y+b),n.options.showbranches&&n.paper.path(o.path("M",y.x,y.y,"l",w,b)).attr({stroke:n.options.color,"stroke-width":u}),n.options.ce&&n.paper.circle(y.x+w,y.y+b,n.options.circleradius).attr({stroke:"none",fill:n.options.color}),i.push({x:y.x+w,y:y.y+b,depth:a.depth+1,referenceAngle:a.referenceAngle+g,previousLength:v})}}}}},l.prototype.start=function(t){var n=Date.now(),e=this;e.branch({x:0,y:0,maxDepth:e.options.depth,referenceAngle:e.options.trunkangle});var r=Date.now()-n;e.userOptions.tr=r,e.userOptions.seed=e.seed,e.userOptions.version="1.30.0",self.postMessage({event:"metrics",value:i.stringify(e.userOptions)});var o=e.TREE_MAX_Y-e.TREE_MIN_Y,a=e.TREE_MAX_X-e.TREE_MIN_X,u=c.calculateViewBox({aspectratio:e.options.aspectratio,treeWidth:a,treeHeight:o,margin:e.options.margin,treeMinX:e.TREE_MIN_X,treeMinY:e.TREE_MIN_Y,clientWidth:e.options.clientWidth,clientHeight:e.options.clientHeight,screenWidth:e.options.screenWidth,screenHeight:e.options.screenHeight,sizingmethod:e.options.sizingmethod}),s=e.options.paperHeight/o,l=e.options.paperWidth/a;Math.min(s,l),e.paper.setSize("100%","100%"),e.paper.setViewBox(u.x,u.y,u.width,u.height),e.options.debug&&(e.paper.rect(u.x,u.y,u.width,u.height).attr({fill:"none",strokeWidth:2,stroke:"red"}),e.paper.rect(e.TREE_MIN_X-e.options.margin,e.TREE_MIN_Y-e.options.margin,a+2*e.options.margin,o+2*e.options.margin).attr({fill:"none",strokeWidth:2,stroke:"red"}),e.paper.rect(e.TREE_MIN_X,e.TREE_MIN_Y,a,o).attr({fill:"none",strokeWidth:2,stroke:"blue"})),"function"==typeof t&&t(e.paper.toString(),u.width,u.height)},n.exports=l},{"./default-tree-options":1,"./raphael-lite":3,"./tree-sizing":4,"./utils":6,"box-muller":7,querystring:12,"seed-random":8,underscore:9}],6:[function(t,n){n.exports.LinearTransform=function(t,n,e){var r=(n[1]-n[0])/(t[1]-t[0]),i=n[0]-r*t[0];return"number"==typeof e?r*e+i:function(t){return r*t+i}},n.exports.rad=function(t){return Math.PI*t/180},n.exports.path=function(){var t=!1,n="";return Array.prototype.slice.call(arguments,0).forEach(function(e){"number"==typeof e&&t&&(n+=","),n+=e,t="number"==typeof e}),n},n.exports.decimal2hex=function(t){var n=(10>t?"0":"")+t.toString(16);return 1===n.length?"0"+n:n},n.exports.rgb2hex=function(t,e,r){return"#"+n.exports.decimal2hex(t)+n.exports.decimal2hex(e)+n.exports.decimal2hex(r)},n.exports.applyStyles=function(t,n,e){e=e||{},Object.keys(n).forEach(function(r){t.style[r]=n[r],e.prefix&&("object"!=typeof e.prefix&&(e.prefix=["webkit","moz"]),e.prefix.forEach(function(e){t.style["-"+e+"-"+r]=n[r]}))})}},{}],7:[function(t,n){function e(){var t,n,e,r;if(1==a)r=i*Math.sqrt(-2*Math.log(o)/o);else{do t=Math.random(),n=Math.random(),e=2*t-1,i=2*n-1,o=e*e+i*i;while(o>=1||0==o);r=e*Math.sqrt(-2*Math.log(o)/o)}return a=1-a,r}function r(){var t=Math.random(),n=Math.random();return Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*n)}n.exports=e,n.exports.basic=r;var i,o,a=0},{}],8:[function(t,n){(function(t){"use strict";function e(t){var n,e=t.length,r=this,i=0,o=r.i=r.j=0,a=r.S=[];for(e||(t=[e++]);u>i;)a[i]=i++;for(i=0;u>i;i++)a[i]=a[o=d&o+t[i%e]+(n=a[i])],a[o]=n;(r.g=function(t){for(var n,e=0,i=r.i,o=r.j,a=r.S;t--;)n=a[i=d&i+1],e=e*u+a[d&(a[i]=a[o=d&o+n])+(a[o]=n)];return r.i=i,r.j=o,e})(u)}function r(t,n){var e,i=[],o=(typeof t)[0];if(n&&"o"==o)for(e in t)try{i.push(r(t[e],n-1))}catch(a){}return i.length?i:"s"==o?t:t+"\x00"}function i(t,n){for(var e,r=t+"",i=0;i<r.length;)n[d&i]=d&(e^=19*n[d&i])+r.charCodeAt(i++);return a(n)}function o(t){try{return f.crypto.getRandomValues(t=new Uint8Array(u)),a(t)}catch(n){return[+new Date,f,f.navigator&&f.navigator.plugins,f.screen,a(l)]}}function a(t){return String.fromCharCode.apply(0,t)}var u=256,s=6,c=52,l=[],f="undefined"==typeof t?window:t,p=Math.pow(u,s),h=Math.pow(2,c),g=2*h,d=u-1,v=Math.random;n.exports=function(t,c){if(c&&c.global===!0)return c.global=!1,Math.random=n.exports(t,c),c.global=!0,Math.random;var f=c&&c.entropy||!1,d=[],v=(i(r(f?[t,a(l)]:0 in arguments?t:o(),3),d),new e(d));return i(a(v.S),l),function(){for(var t=v.g(s),n=p,e=0;h>t;)t=(t+e)*u,n*=u,e=v.g(1);for(;t>=g;)t/=2,n/=2,e>>>=1;return(t+e)/n}},n.exports.resetGlobal=function(){Math.random=v},i(Math.random(),l)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],9:[function(t,n,e){(function(){var t=this,r=t._,i=Array.prototype,o=Object.prototype,a=Function.prototype,u=i.push,s=i.slice,c=i.concat,l=o.toString,f=o.hasOwnProperty,p=Array.isArray,h=Object.keys,g=a.bind,d=function(t){return t instanceof d?t:this instanceof d?void(this._wrapped=t):new d(t)};"undefined"!=typeof e?("undefined"!=typeof n&&n.exports&&(e=n.exports=d),e._=d):t._=d,d.VERSION="1.7.0";var v=function(t,n,e){if(void 0===n)return t;switch(null==e?3:e){case 1:return function(e){return t.call(n,e)};case 2:return function(e,r){return t.call(n,e,r)};case 3:return function(e,r,i){return t.call(n,e,r,i)};case 4:return function(e,r,i,o){return t.call(n,e,r,i,o)}}return function(){return t.apply(n,arguments)}};d.iteratee=function(t,n,e){return null==t?d.identity:d.isFunction(t)?v(t,n,e):d.isObject(t)?d.matches(t):d.property(t)},d.each=d.forEach=function(t,n,e){if(null==t)return t;n=v(n,e);var r,i=t.length;if(i===+i)for(r=0;i>r;r++)n(t[r],r,t);else{var o=d.keys(t);for(r=0,i=o.length;i>r;r++)n(t[o[r]],o[r],t)}return t},d.map=d.collect=function(t,n,e){if(null==t)return[];n=d.iteratee(n,e);for(var r,i=t.length!==+t.length&&d.keys(t),o=(i||t).length,a=Array(o),u=0;o>u;u++)r=i?i[u]:u,a[u]=n(t[r],r,t);return a};var y="Reduce of empty array with no initial value";d.reduce=d.foldl=d.inject=function(t,n,e,r){null==t&&(t=[]),n=v(n,r,4);var i,o=t.length!==+t.length&&d.keys(t),a=(o||t).length,u=0;if(arguments.length<3){if(!a)throw new TypeError(y);e=t[o?o[u++]:u++]}for(;a>u;u++)i=o?o[u]:u,e=n(e,t[i],i,t);return e},d.reduceRight=d.foldr=function(t,n,e,r){null==t&&(t=[]),n=v(n,r,4);var i,o=t.length!==+t.length&&d.keys(t),a=(o||t).length;if(arguments.length<3){if(!a)throw new TypeError(y);e=t[o?o[--a]:--a]}for(;a--;)i=o?o[a]:a,e=n(e,t[i],i,t);return e},d.find=d.detect=function(t,n,e){var r;return n=d.iteratee(n,e),d.some(t,function(t,e,i){return n(t,e,i)?(r=t,!0):void 0}),r},d.filter=d.select=function(t,n,e){var r=[];return null==t?r:(n=d.iteratee(n,e),d.each(t,function(t,e,i){n(t,e,i)&&r.push(t)}),r)},d.reject=function(t,n,e){return d.filter(t,d.negate(d.iteratee(n)),e)},d.every=d.all=function(t,n,e){if(null==t)return!0;n=d.iteratee(n,e);var r,i,o=t.length!==+t.length&&d.keys(t),a=(o||t).length;for(r=0;a>r;r++)if(i=o?o[r]:r,!n(t[i],i,t))return!1;return!0},d.some=d.any=function(t,n,e){if(null==t)return!1;n=d.iteratee(n,e);var r,i,o=t.length!==+t.length&&d.keys(t),a=(o||t).length;for(r=0;a>r;r++)if(i=o?o[r]:r,n(t[i],i,t))return!0;return!1},d.contains=d.include=function(t,n){return null==t?!1:(t.length!==+t.length&&(t=d.values(t)),d.indexOf(t,n)>=0)},d.invoke=function(t,n){var e=s.call(arguments,2),r=d.isFunction(n);return d.map(t,function(t){return(r?n:t[n]).apply(t,e)})},d.pluck=function(t,n){return d.map(t,d.property(n))},d.where=function(t,n){return d.filter(t,d.matches(n))},d.findWhere=function(t,n){return d.find(t,d.matches(n))},d.max=function(t,n,e){var r,i,o=-1/0,a=-1/0;if(null==n&&null!=t){t=t.length===+t.length?t:d.values(t);for(var u=0,s=t.length;s>u;u++)r=t[u],r>o&&(o=r)}else n=d.iteratee(n,e),d.each(t,function(t,e,r){i=n(t,e,r),(i>a||i===-1/0&&o===-1/0)&&(o=t,a=i)});return o},d.min=function(t,n,e){var r,i,o=1/0,a=1/0;if(null==n&&null!=t){t=t.length===+t.length?t:d.values(t);for(var u=0,s=t.length;s>u;u++)r=t[u],o>r&&(o=r)}else n=d.iteratee(n,e),d.each(t,function(t,e,r){i=n(t,e,r),(a>i||1/0===i&&1/0===o)&&(o=t,a=i)});return o},d.shuffle=function(t){for(var n,e=t&&t.length===+t.length?t:d.values(t),r=e.length,i=Array(r),o=0;r>o;o++)n=d.random(0,o),n!==o&&(i[o]=i[n]),i[n]=e[o];return i},d.sample=function(t,n,e){return null==n||e?(t.length!==+t.length&&(t=d.values(t)),t[d.random(t.length-1)]):d.shuffle(t).slice(0,Math.max(0,n))},d.sortBy=function(t,n,e){return n=d.iteratee(n,e),d.pluck(d.map(t,function(t,e,r){return{value:t,index:e,criteria:n(t,e,r)}}).sort(function(t,n){var e=t.criteria,r=n.criteria;if(e!==r){if(e>r||void 0===e)return 1;if(r>e||void 0===r)return-1}return t.index-n.index}),"value")};var m=function(t){return function(n,e,r){var i={};return e=d.iteratee(e,r),d.each(n,function(r,o){var a=e(r,o,n);t(i,r,a)}),i}};d.groupBy=m(function(t,n,e){d.has(t,e)?t[e].push(n):t[e]=[n]}),d.indexBy=m(function(t,n,e){t[e]=n}),d.countBy=m(function(t,n,e){d.has(t,e)?t[e]++:t[e]=1}),d.sortedIndex=function(t,n,e,r){e=d.iteratee(e,r,1);for(var i=e(n),o=0,a=t.length;a>o;){var u=o+a>>>1;e(t[u])<i?o=u+1:a=u}return o},d.toArray=function(t){return t?d.isArray(t)?s.call(t):t.length===+t.length?d.map(t,d.identity):d.values(t):[]},d.size=function(t){return null==t?0:t.length===+t.length?t.length:d.keys(t).length},d.partition=function(t,n,e){n=d.iteratee(n,e);var r=[],i=[];return d.each(t,function(t,e,o){(n(t,e,o)?r:i).push(t)}),[r,i]},d.first=d.head=d.take=function(t,n,e){return null==t?void 0:null==n||e?t[0]:0>n?[]:s.call(t,0,n)},d.initial=function(t,n,e){return s.call(t,0,Math.max(0,t.length-(null==n||e?1:n)))},d.last=function(t,n,e){return null==t?void 0:null==n||e?t[t.length-1]:s.call(t,Math.max(t.length-n,0))},d.rest=d.tail=d.drop=function(t,n,e){return s.call(t,null==n||e?1:n)},d.compact=function(t){return d.filter(t,d.identity)};var x=function(t,n,e,r){if(n&&d.every(t,d.isArray))return c.apply(r,t);for(var i=0,o=t.length;o>i;i++){var a=t[i];d.isArray(a)||d.isArguments(a)?n?u.apply(r,a):x(a,n,e,r):e||r.push(a)}return r};d.flatten=function(t,n){return x(t,n,!1,[])},d.without=function(t){return d.difference(t,s.call(arguments,1))},d.uniq=d.unique=function(t,n,e,r){if(null==t)return[];d.isBoolean(n)||(r=e,e=n,n=!1),null!=e&&(e=d.iteratee(e,r));for(var i=[],o=[],a=0,u=t.length;u>a;a++){var s=t[a];if(n)a&&o===s||i.push(s),o=s;else if(e){var c=e(s,a,t);d.indexOf(o,c)<0&&(o.push(c),i.push(s))}else d.indexOf(i,s)<0&&i.push(s)}return i},d.union=function(){return d.uniq(x(arguments,!0,!0,[]))},d.intersection=function(t){if(null==t)return[];for(var n=[],e=arguments.length,r=0,i=t.length;i>r;r++){var o=t[r];if(!d.contains(n,o)){for(var a=1;e>a&&d.contains(arguments[a],o);a++);a===e&&n.push(o)}}return n},d.difference=function(t){var n=x(s.call(arguments,1),!0,!0,[]);return d.filter(t,function(t){return!d.contains(n,t)})},d.zip=function(t){if(null==t)return[];for(var n=d.max(arguments,"length").length,e=Array(n),r=0;n>r;r++)e[r]=d.pluck(arguments,r);return e},d.object=function(t,n){if(null==t)return{};for(var e={},r=0,i=t.length;i>r;r++)n?e[t[r]]=n[r]:e[t[r][0]]=t[r][1];return e},d.indexOf=function(t,n,e){if(null==t)return-1;var r=0,i=t.length;if(e){if("number"!=typeof e)return r=d.sortedIndex(t,n),t[r]===n?r:-1;r=0>e?Math.max(0,i+e):e}for(;i>r;r++)if(t[r]===n)return r;return-1},d.lastIndexOf=function(t,n,e){if(null==t)return-1;var r=t.length;for("number"==typeof e&&(r=0>e?r+e+1:Math.min(r,e+1));--r>=0;)if(t[r]===n)return r;return-1},d.range=function(t,n,e){arguments.length<=1&&(n=t||0,t=0),e=e||1;for(var r=Math.max(Math.ceil((n-t)/e),0),i=Array(r),o=0;r>o;o++,t+=e)i[o]=t;return i};var _=function(){};d.bind=function(t,n){var e,r;if(g&&t.bind===g)return g.apply(t,s.call(arguments,1));if(!d.isFunction(t))throw new TypeError("Bind must be called on a function");return e=s.call(arguments,2),r=function(){if(!(this instanceof r))return t.apply(n,e.concat(s.call(arguments)));_.prototype=t.prototype;var i=new _;_.prototype=null;var o=t.apply(i,e.concat(s.call(arguments)));return d.isObject(o)?o:i}},d.partial=function(t){var n=s.call(arguments,1);return function(){for(var e=0,r=n.slice(),i=0,o=r.length;o>i;i++)r[i]===d&&(r[i]=arguments[e++]);for(;e<arguments.length;)r.push(arguments[e++]);return t.apply(this,r)}},d.bindAll=function(t){var n,e,r=arguments.length;if(1>=r)throw new Error("bindAll must be passed function names");for(n=1;r>n;n++)e=arguments[n],t[e]=d.bind(t[e],t);return t},d.memoize=function(t,n){var e=function(r){var i=e.cache,o=n?n.apply(this,arguments):r;return d.has(i,o)||(i[o]=t.apply(this,arguments)),i[o]};return e.cache={},e},d.delay=function(t,n){var e=s.call(arguments,2);return setTimeout(function(){return t.apply(null,e)},n)},d.defer=function(t){return d.delay.apply(d,[t,1].concat(s.call(arguments,1)))},d.throttle=function(t,n,e){var r,i,o,a=null,u=0;e||(e={});var s=function(){u=e.leading===!1?0:d.now(),a=null,o=t.apply(r,i),a||(r=i=null)};return function(){var c=d.now();u||e.leading!==!1||(u=c);var l=n-(c-u);return r=this,i=arguments,0>=l||l>n?(clearTimeout(a),a=null,u=c,o=t.apply(r,i),a||(r=i=null)):a||e.trailing===!1||(a=setTimeout(s,l)),o}},d.debounce=function(t,n,e){var r,i,o,a,u,s=function(){var c=d.now()-a;n>c&&c>0?r=setTimeout(s,n-c):(r=null,e||(u=t.apply(o,i),r||(o=i=null)))};return function(){o=this,i=arguments,a=d.now();var c=e&&!r;return r||(r=setTimeout(s,n)),c&&(u=t.apply(o,i),o=i=null),u}},d.wrap=function(t,n){return d.partial(n,t)},d.negate=function(t){return function(){return!t.apply(this,arguments)}},d.compose=function(){var t=arguments,n=t.length-1;return function(){for(var e=n,r=t[n].apply(this,arguments);e--;)r=t[e].call(this,r);return r}},d.after=function(t,n){return function(){return--t<1?n.apply(this,arguments):void 0}},d.before=function(t,n){var e;return function(){return--t>0?e=n.apply(this,arguments):n=null,e}},d.once=d.partial(d.before,2),d.keys=function(t){if(!d.isObject(t))return[];if(h)return h(t);var n=[];for(var e in t)d.has(t,e)&&n.push(e);return n},d.values=function(t){for(var n=d.keys(t),e=n.length,r=Array(e),i=0;e>i;i++)r[i]=t[n[i]];return r},d.pairs=function(t){for(var n=d.keys(t),e=n.length,r=Array(e),i=0;e>i;i++)r[i]=[n[i],t[n[i]]];return r},d.invert=function(t){for(var n={},e=d.keys(t),r=0,i=e.length;i>r;r++)n[t[e[r]]]=e[r];return n},d.functions=d.methods=function(t){var n=[];for(var e in t)d.isFunction(t[e])&&n.push(e);return n.sort()},d.extend=function(t){if(!d.isObject(t))return t;for(var n,e,r=1,i=arguments.length;i>r;r++){n=arguments[r];for(e in n)f.call(n,e)&&(t[e]=n[e])}return t},d.pick=function(t,n,e){var r,i={};if(null==t)return i;if(d.isFunction(n)){n=v(n,e);for(r in t){var o=t[r];n(o,r,t)&&(i[r]=o)}}else{var a=c.apply([],s.call(arguments,1));t=new Object(t);for(var u=0,l=a.length;l>u;u++)r=a[u],r in t&&(i[r]=t[r])}return i},d.omit=function(t,n,e){if(d.isFunction(n))n=d.negate(n);else{var r=d.map(c.apply([],s.call(arguments,1)),String);n=function(t,n){return!d.contains(r,n)}}return d.pick(t,n,e)},d.defaults=function(t){if(!d.isObject(t))return t;for(var n=1,e=arguments.length;e>n;n++){var r=arguments[n];for(var i in r)void 0===t[i]&&(t[i]=r[i])}return t},d.clone=function(t){return d.isObject(t)?d.isArray(t)?t.slice():d.extend({},t):t},d.tap=function(t,n){return n(t),t};var w=function(t,n,e,r){if(t===n)return 0!==t||1/t===1/n;if(null==t||null==n)return t===n;t instanceof d&&(t=t._wrapped),n instanceof d&&(n=n._wrapped);var i=l.call(t);if(i!==l.call(n))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+t==""+n;case"[object Number]":return+t!==+t?+n!==+n:0===+t?1/+t===1/n:+t===+n;case"[object Date]":case"[object Boolean]":return+t===+n}if("object"!=typeof t||"object"!=typeof n)return!1;for(var o=e.length;o--;)if(e[o]===t)return r[o]===n;var a=t.constructor,u=n.constructor;if(a!==u&&"constructor"in t&&"constructor"in n&&!(d.isFunction(a)&&a instanceof a&&d.isFunction(u)&&u instanceof u))return!1;e.push(t),r.push(n);var s,c;if("[object Array]"===i){if(s=t.length,c=s===n.length)for(;s--&&(c=w(t[s],n[s],e,r)););}else{var f,p=d.keys(t);if(s=p.length,c=d.keys(n).length===s)for(;s--&&(f=p[s],c=d.has(n,f)&&w(t[f],n[f],e,r)););}return e.pop(),r.pop(),c};d.isEqual=function(t,n){return w(t,n,[],[])},d.isEmpty=function(t){if(null==t)return!0;if(d.isArray(t)||d.isString(t)||d.isArguments(t))return 0===t.length;for(var n in t)if(d.has(t,n))return!1;return!0},d.isElement=function(t){return!(!t||1!==t.nodeType)},d.isArray=p||function(t){return"[object Array]"===l.call(t)},d.isObject=function(t){var n=typeof t;return"function"===n||"object"===n&&!!t},d.each(["Arguments","Function","String","Number","Date","RegExp"],function(t){d["is"+t]=function(n){return l.call(n)==="[object "+t+"]"}}),d.isArguments(arguments)||(d.isArguments=function(t){return d.has(t,"callee")}),"function"!=typeof/./&&(d.isFunction=function(t){return"function"==typeof t||!1}),d.isFinite=function(t){return isFinite(t)&&!isNaN(parseFloat(t))},d.isNaN=function(t){return d.isNumber(t)&&t!==+t},d.isBoolean=function(t){return t===!0||t===!1||"[object Boolean]"===l.call(t)},d.isNull=function(t){return null===t},d.isUndefined=function(t){return void 0===t},d.has=function(t,n){return null!=t&&f.call(t,n)},d.noConflict=function(){return t._=r,this},d.identity=function(t){return t},d.constant=function(t){return function(){return t}},d.noop=function(){},d.property=function(t){return function(n){return n[t]}},d.matches=function(t){var n=d.pairs(t),e=n.length;return function(t){if(null==t)return!e;t=new Object(t);for(var r=0;e>r;r++){var i=n[r],o=i[0];if(i[1]!==t[o]||!(o in t))return!1}return!0}},d.times=function(t,n,e){var r=Array(Math.max(0,t));n=v(n,e,1);for(var i=0;t>i;i++)r[i]=n(i);return r},d.random=function(t,n){return null==n&&(n=t,t=0),t+Math.floor(Math.random()*(n-t+1))},d.now=Date.now||function(){return(new Date).getTime()};var b={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},E=d.invert(b),M=function(t){var n=function(n){return t[n]},e="(?:"+d.keys(t).join("|")+")",r=RegExp(e),i=RegExp(e,"g");return function(t){return t=null==t?"":""+t,r.test(t)?t.replace(i,n):t}};d.escape=M(b),d.unescape=M(E),d.result=function(t,n){if(null==t)return void 0;var e=t[n];return d.isFunction(e)?t[n]():e};var A=0;d.uniqueId=function(t){var n=++A+"";return t?t+n:n},d.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var j=/(.)^/,R={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},T=/\\|'|\r|\n|\u2028|\u2029/g,k=function(t){return"\\"+R[t]};d.template=function(t,n,e){!n&&e&&(n=e),n=d.defaults({},n,d.templateSettings);var r=RegExp([(n.escape||j).source,(n.interpolate||j).source,(n.evaluate||j).source].join("|")+"|$","g"),i=0,o="__p+='";t.replace(r,function(n,e,r,a,u){return o+=t.slice(i,u).replace(T,k),i=u+n.length,e?o+="'+\n((__t=("+e+"))==null?'':_.escape(__t))+\n'":r?o+="'+\n((__t=("+r+"))==null?'':__t)+\n'":a&&(o+="';\n"+a+"\n__p+='"),n}),o+="';\n",n.variable||(o="with(obj||{}){\n"+o+"}\n"),o="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+o+"return __p;\n";try{var a=new Function(n.variable||"obj","_",o)}catch(u){throw u.source=o,u}var s=function(t){return a.call(this,t,d)},c=n.variable||"obj";return s.source="function("+c+"){\n"+o+"}",s},d.chain=function(t){var n=d(t);return n._chain=!0,n};var O=function(t){return this._chain?d(t).chain():t};d.mixin=function(t){d.each(d.functions(t),function(n){var e=d[n]=t[n];d.prototype[n]=function(){var t=[this._wrapped];return u.apply(t,arguments),O.call(this,e.apply(d,t))}})},d.mixin(d),d.each(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var n=i[t];d.prototype[t]=function(){var e=this._wrapped;return n.apply(e,arguments),"shift"!==t&&"splice"!==t||0!==e.length||delete e[0],O.call(this,e)}}),d.each(["concat","join","slice"],function(t){var n=i[t];d.prototype[t]=function(){return O.call(this,n.apply(this._wrapped,arguments))}}),d.prototype.value=function(){return this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return d})}).call(this)},{}],10:[function(t,n){"use strict";function e(t,n){return Object.prototype.hasOwnProperty.call(t,n)}n.exports=function(t,n,i,o){n=n||"&",i=i||"=";var a={};if("string"!=typeof t||0===t.length)return a;var u=/\+/g;t=t.split(n);var s=1e3;o&&"number"==typeof o.maxKeys&&(s=o.maxKeys);var c=t.length;s>0&&c>s&&(c=s);for(var l=0;c>l;++l){var f,p,h,g,d=t[l].replace(u,"%20"),v=d.indexOf(i);v>=0?(f=d.substr(0,v),p=d.substr(v+1)):(f=d,p=""),h=decodeURIComponent(f),g=decodeURIComponent(p),e(a,h)?r(a[h])?a[h].push(g):a[h]=[a[h],g]:a[h]=g}return a};var r=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},{}],11:[function(t,n){"use strict";function e(t,n){if(t.map)return t.map(n);for(var e=[],r=0;r<t.length;r++)e.push(n(t[r],r));return e}var r=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};n.exports=function(t,n,a,u){return n=n||"&",a=a||"=",null===t&&(t=void 0),"object"==typeof t?e(o(t),function(o){var u=encodeURIComponent(r(o))+a;return i(t[o])?e(t[o],function(t){return u+encodeURIComponent(r(t))}).join(n):u+encodeURIComponent(r(t[o]))}).join(n):u?encodeURIComponent(r(u))+a+encodeURIComponent(r(t)):""};var i=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},o=Object.keys||function(t){var n=[];for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.push(e);return n}},{}],12:[function(t,n,e){"use strict";e.decode=e.parse=t("./decode"),e.encode=e.stringify=t("./encode")},{"./decode":10,"./encode":11}]},{},[2]);
