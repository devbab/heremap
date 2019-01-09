# HEREMAP
A framework to simplify the use of HERE Maps, which a bunch of higher level functions.
In addition, it brings  geocoding and routing functions to Node.js

See examples in the demo directory, starting with demo/demo-basic.html.

Get your credentials at [http://developer.here.com](http://developer.here.com)

## Installation

1/ For use in Node.js, install the package:

npm install --save-dep heremap

To use in a js file

	const hm = require("heremap");

	hm.config({
		app_id: "YOUR APP_ID",
		app_code: "YOUR APP_CODE",
	});

	let res = await hm.geocode("avenue des champs elysees, paris);
	console.log(res.coord);


2/ For use in browser, add these lines in your html file

	<link rel="stylesheet" type="text/css" href="http://www.unpkg.com/heremap@2.0.5/css/heremap.css" />

	<script src="http://www.unpkg.com/heremap@2.0.5/dist/libhere.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="http://www.unpkg.com/heremap@2.0.5/dist/heremap.min.js" type="text/javascript" charset="utf-8"></script>

	<div id="map"></div>

Then in your JS script:

	const hm = window.heremap;

	hm.config({
		app_id: "YOUR APP_ID",
	app_code: "YOUR APP_CODE",
	});

	hm.map("map", {
		zoom:5,
		center: [48.8,2.3],
		click: function(coord,button,key) {console.log("clicked on",coord,"with button",button);}
	});


## Demo

See under directory demo:

- [demo-basic.html](demo/demo-basic.html): how to display a simple map in a web pgae
- [demo-cluster.html](demo/demo-cluster.html): how to cluster thousands of points on a map
- [demo-screenshot.html](demo/demo-screenshot.html): how to do a screenshot of the map
- [demo-asia.html](demo/demo-asia.html): how to display high quality ap in Japan and Korea. (requires special credentials)



## Functions

<dl>
<dt><a href="#hm_bubbleUnique">hm:bubbleUnique(coord, txt)</a></dt>
<dd><p>display a unique bubble. Associated CSS style is .H_ib_body</p>
</dd>
<dt><a href="#hm_bubbleUniqueHide">hm:bubbleUniqueHide()</a></dt>
<dd><p>hide a unique bubble</p>
</dd>
<dt><a href="#hm_buildIcon">hm:buildIcon(opt)</a> ⇒ <code>H.map.Icon</code></dt>
<dd><p>create an icon, to be used for a marker</p>
</dd>
<dt><a href="#hm_circle">hm:circle(opt)</a></dt>
<dd><p>draw a circle</p>
</dd>
<dt><a href="#hm_cluster">hm:cluster(coords, opt, cb)</a> ⇒ <code>H.map.layer.ObjectLayer</code></dt>
<dd><p>creates a cluster of points</p>
</dd>
<dt><a href="#hm_config">hm:config(opt)</a></dt>
<dd><p>To configure app_id, app_code and optionally use CIT and http</p>
</dd>
<dt><a href="#hm_detour">hm:detour(start, stop, waypoints)</a> ⇒ <code>object</code></dt>
<dd><p>Compute the detour for each waypoint provided, compared to normal route from A to B</p>
</dd>
<dt><a href="#hm_geocode">hm:geocode(address)</a> ⇒ <code>Object</code></dt>
<dd><p>geocode an address</p>
</dd>
<dt><a href="#hm_getAvailableMapStyle">hm:getAvailableMapStyle()</a> ⇒ <code>json</code></dt>
<dd><p>list of all available map styles normal.day, night....</p>
</dd>
<dt><a href="#hm_getCenter">hm:getCenter()</a> ⇒ <code>coord</code></dt>
<dd><p>return coordinate of the center of the map</p>
</dd>
<dt><a href="#hm_getViewBB">hm:getViewBB()</a> ⇒ <code>Object</code></dt>
<dd><p>return bounding box of visible part of map</p>
</dd>
<dt><a href="#hm_getZoom">hm:getZoom()</a> ⇒ <code>number</code></dt>
<dd><p>return zoom value</p>
</dd>
<dt><a href="#hm_isoline">hm:isoline(opt)</a> ⇒ <code>object</code></dt>
<dd><p>compute an isoline. <a href="http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer&#39;s%20Guide.pdf">See more info on optional parameters</a></p>
</dd>
<dt><a href="#hm_layerCreate">hm:layerCreate(name, visible)</a></dt>
<dd><p>create a layer</p>
</dd>
<dt><a href="#hm_layerDelete">hm:layerDelete(name)</a></dt>
<dd><p>delete a layer</p>
</dd>
<dt><a href="#hm_layerEmpty">hm:layerEmpty(layer)</a></dt>
<dd><p>Empty a layer, actually deletes it and recreate it</p>
</dd>
<dt><a href="#hm_layerFind">hm:layerFind(name)</a></dt>
<dd><p>find layer by its name or return null</p>
</dd>
<dt><a href="#hm_locateMe">hm:locateMe(callback, opt)</a></dt>
<dd><p>watch position on HTML5 position. requires HTTPS</p>
</dd>
<dt><a href="#hm_map">hm:map(htmlItem, opt)</a></dt>
<dd><p>create a map area within the specified item</p>
</dd>
<dt><a href="#hm_marker">hm:marker(opt)</a></dt>
<dd><p>add a marker in a layer
svg files can be created with <a href="https://editor.method.ac/">https://editor.method.ac/</a></p>
</dd>
<dt><a href="#hm_matrix">hm:matrix(source, dest, opt)</a> ⇒ <code>object</code></dt>
<dd><p>compute a matrix. <a href="http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer&#39;s%20Guide.pdf">See more info on optional parameters</a></p>
<p>Matrix size is limited to 1x100, 100x1 or 15xN</p>
</dd>
<dt><a href="#hm_polygon">hm:polygon(opt)</a></dt>
<dd><p>Draw a polygon</p>
</dd>
<dt><a href="#hm_polyline">hm:polyline(opt)</a></dt>
<dd><p>Draw a polyline.</p>
</dd>
<dt><a href="#hm_reverseGeocode">hm:reverseGeocode(coord)</a> ⇒ <code>object</code></dt>
<dd><p>reverse geocode a coordinate</p>
</dd>
<dt><a href="#hm_route">hm:route(source, dest, opt)</a> ⇒ <code>object</code></dt>
<dd><p>compute a route with optional waypooints. <a href="http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer&#39;s%20Guide.pdf">See more info on optional parameters</a></p>
</dd>
<dt><a href="#hm_screenshot">hm:screenshot(opt, opt)</a> ⇒ <code>data</code></dt>
<dd><p>perform a screenshot of the map and returns a promise with the data</p>
</dd>
<dt><a href="#hm_setCenter">hm:setCenter(coord)</a></dt>
<dd><p>set center of the map</p>
</dd>
<dt><a href="#hm_setScheme">hm:setScheme(scheme)</a></dt>
<dd><p>define the scheme. List of scheme can be obtained from {hm.getAvailableMapStyle()}</p>
</dd>
<dt><a href="#hm_setViewBB">hm:setViewBB(opt)</a></dt>
<dd><p>sets bouding box to be displayed</p>
</dd>
<dt><a href="#hm_setZoom">hm:setZoom(zoom)</a></dt>
<dd><p>set zoom level</p>
</dd>
<dt><a href="#hm_touch">hm:touch(onoff, options)</a></dt>
<dd><p>activate touch, allowing hand drawing</p>
</dd>
</dl>

<a name="hm_bubbleUnique"></a>

## hm:bubbleUnique(coord, txt)
display a unique bubble. Associated CSS style is .H_ib_body

**Kind**: global function  
**Params**

- coord <code>Array</code> - of the bubble
- txt <code>String</code> - html text to display

<a name="hm_bubbleUniqueHide"></a>

## hm:bubbleUniqueHide()
hide a unique bubble

**Kind**: global function  
<a name="hm_buildIcon"></a>

## hm:buildIcon(opt) ⇒ <code>H.map.Icon</code>
create an icon, to be used for a marker

**Kind**: global function  
**Returns**: <code>H.map.Icon</code> - the created icon  
**Params**

- opt <code>object</code> - options to specify the icon
    - [.img] <code>string</code> - use a png/jpg image. Specify the url
    - [.svg] <code>string</code> - url a svg. This can be an inline svg, a url, or a svg from heremap
    - [.opt] <code>object</code> - style object
        - [.size] <code>number</code> | <code>string</code> - size of icon, as 24 or 24x32
        - [.ratio] <code>number</code> - for svg files, ratio of size. 0.5 = half
        - [.anchor] <code>number</code> | <code>string</code> - anchor of icon, as 24 or "24x32" or "center". By default, bottom-center
        - [.tag] <code>string</code> - for svg, any tag like{tag}. will be replaced by associated value

**Example**  
```jshm.buildIcon({   img: "http://whatever.com/image.png",   opt: {size:24}});hm.buildIcon({   svg: "http://whatever.com/image.svg",   opt: {      ratio:0.5,      anchor:24x32   }}); hm.buildIcon({   svg: "svg/cluster.svg",   opt: {      size:24,      color:"red"   }});const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"> <ellipse stroke="null" ry="8" rx="7.618896" id="svg_1" cy="8" cx="7.837427" fill="{color}" fill-opacity="0.9"/></svg>`;hm.buildIcon({   svg: svg,   opt: {      size:24,      color:"red"   } }); ```
<a name="hm_circle"></a>

## hm:circle(opt)
draw a circle

**Kind**: global function  
**Params**

- opt <code>\*</code> - option for circle
    - [.layer] <code>String</code> - optional layer to use
    - [.coord] <code>array</code> - center of the circle, as \[48.8,2.3\]
    - [.radius] <code>number</code> - radius in meter
    - [.style] <code>object</code> - optional graphic style
        - [.strokeColor] <code>string</code> - color of perimeter
        - [.lineWidth] <code>number</code> - line width
        - [.fillColor] <code>string</code> - fill color

<a name="hm_cluster"></a>

## hm:cluster(coords, opt, cb) ⇒ <code>H.map.layer.ObjectLayer</code>
creates a cluster of points

**Kind**: global function  
**Returns**: <code>H.map.layer.ObjectLayer</code> - layer created  
**Params**

- coords <code>Array</code> - array of \[lat,lng,payload\]
- opt <code>object</code> - options for cluster
    - [.minZoom] <code>number</code> - min zoom for cluster to be visible
    - [.maxZoom] <code>number</code> - max zoom for cluster to be visible
    - [.noise] <code>array</code> - graphic to represent stand-alone point. format: [url,size]
    - [.clusterIcon] <code>string</code> - url of svg file representing a cluster
    - [.style] <code>object</code> - define for each minium aggregation level the color and size of the icon. See example
- cb <code>function</code> - callback to be called if click on item. Format cb(event, coord, payload, weigth). `coord` is coord of icon`payload` is payload associated to point. `weight` is number of points aggregated, when clicking on a cluster icon, 1 if single point

**Example**  
```jslet pois = [[48.8,2.3,"Hello world"],[48.5,2.4,"How are you"],[45.2,2.93,"Very well"]];hm.cluster(pois);// with more graphic options and callback defined hm.cluster(pois, {          noise: ["mcdo.png", 24],          clusterIcon: '../svg/cluster2.svg',    //  icon for cluster          style: {              200: { color: "#B50015", size: 64 }  // for 200 or more points aggrregated, drag red big icon              75: { color: "#FF6900", size: 58 },  // for 75 or more points aggregated. orange middle size icon              2: { color: "#7BD30A", size: 46 },   // for 2 or more points aggregated. green small icon          }      },          (event, coordinate, data, weight) => {              if (data)                  console.log("click on point ", data);              else                  console.log("click on cluster with weight", weight);          });```
<a name="hm_config"></a>

## hm:config(opt)
To configure app_id, app_code and optionally use CIT and http

**Kind**: global function  
**Params**

- opt <code>Object</code> - `opt` with parameters.
    - [.app_id] <code>string</code> - the app_id from developer.here.com
    - [.app_code] <code>string</code> - the app_code from developer.here.com
    - [.useCIT] <code>boolean</code> <code> = false</code> - true to use CIT environment.
    - [.useHTTP] <code>string</code> <code> = false</code> - true to use HTTP.
    - [.useHTTPS] <code>string</code> <code> = true</code> - true to use HTTPS.

**Example**  
```js hm.config({     app_id: "YOUR APP_ID",     app_code: "YOUR APP_CODE",  }); ```
<a name="hm_detour"></a>

## hm:detour(start, stop, waypoints) ⇒ <code>object</code>
Compute the detour for each waypoint provided, compared to normal route from A to B

**Kind**: global function  
**Returns**: <code>object</code> - returns {reference,waypoints:[ {coord,distA,timeA,distB,timeB}]}  
**Params**

- start <code>coord</code> - starting point for route
- stop <code>coord</code> - destination point of route
- waypoints <code>array</code> - list of watypoints to test

<a name="hm_geocode"></a>

## hm:geocode(address) ⇒ <code>Object</code>
geocode an address

**Kind**: global function  
**Returns**: <code>Object</code> - returns  {coord,body}. coord is geocode as \[lat,lng\]. body is full json answer  
**Params**

- address <code>string</code> - address as string

**Example**  
```jsconst res = await hm.geocode("avenue des chaps elysees, paris");console.log (res.coord);```
<a name="hm_getAvailableMapStyle"></a>

## hm:getAvailableMapStyle() ⇒ <code>json</code>
list of all available map styles normal.day, night....

**Kind**: global function  
**Returns**: <code>json</code> - list of map styles as json  
<a name="hm_getCenter"></a>

## hm:getCenter() ⇒ <code>coord</code>
return coordinate of the center of the map

**Kind**: global function  
**Returns**: <code>coord</code> - coord of the center as \[lat,lng\]  
<a name="hm_getViewBB"></a>

## hm:getViewBB() ⇒ <code>Object</code>
return bounding box of visible part of map

**Kind**: global function  
**Returns**: <code>Object</code> - bouding box of visible part of the map, as \[latm,latM,longm,lngM\]  
<a name="hm_getZoom"></a>

## hm:getZoom() ⇒ <code>number</code>
return zoom value

**Kind**: global function  
**Returns**: <code>number</code> - zoom level  
<a name="hm_isoline"></a>

## hm:isoline(opt) ⇒ <code>object</code>
compute an isoline. [See more info on optional parameters](http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)

**Kind**: global function  
**Returns**: <code>object</code> - returns { poly:array, body:object }. Poly is array of coords, body is full answer  
**Params**

- opt <code>object</code> - option for isoline
    - [.start] <code>coord</code> - coord for starting point of isoline
    - [.destination] <code>coord</code> - coord for destination point of isoline
    - [.rangeType] <code>string</code> <code> = &quot;\&quot;time\&quot;&quot;</code> - time or distance
    - [.range] <code>number</code> - range in seconds or in meters
    - [.mode] <code>String</code> <code> = &quot;fastest;car;traffic:disabled&quot;</code> - routing mode
    - [.linkattributes] <code>String</code> <code> = sh</code> - attributes to be returned

<a name="hm_layerCreate"></a>

## hm:layerCreate(name, visible)
create a layer

**Kind**: global function  
**Params**

- name <code>string</code> - name of layer
- visible <code>boolean</code> - initial status

**Example**  
```jshm.layerCreate("layer1"); ```
<a name="hm_layerDelete"></a>

## hm:layerDelete(name)
delete a layer

**Kind**: global function  
**Params**

- name <code>String</code> - name of layer

<a name="hm_layerEmpty"></a>

## hm:layerEmpty(layer)
Empty a layer, actually deletes it and recreate it

**Kind**: global function  
**Params**

- layer <code>string</code>

<a name="hm_layerFind"></a>

## hm:layerFind(name)
find layer by its name or return null

**Kind**: global function  
**Params**

- name <code>string</code>

<a name="hm_locateMe"></a>

## hm:locateMe(callback, opt)
watch position on HTML5 position. requires HTTPS

**Kind**: global function  
**Params**

- callback <code>function</code> - callback when coord changes. Format: callback(coord,accuracy)
- opt <code>Object</code> - optional graphic options
    - [.position] <code>object</code> - graphic options for center. See buildIcon
        - [.svg] <code>string</code> - svg file
        - [.color] <code>string</code> - color for  {color} tag
        - [.size] <code>number</code> - size of icon
        - [.anchor] <code>number</code> - anchor of icon
    - [.accuracy] <code>object</code> - graphic options for accuracy representation
        - [.strokeColor] <code>String</code> - color of circle line representing accuracy area
        - [.lineWidth] <code>number</code> - width of line of circle
        - [.fillColor] <code>String</code> - fill color of circle representing accuracy area

<a name="hm_map"></a>

## hm:map(htmlItem, opt)
create a map area within the specified item

**Kind**: global function  
**Params**

- htmlItem <code>string</code> - identifier of html div item on which to insert map
- opt <code>object</code> - options
    - [.zoom] <code>number</code> <code> = 10</code> - zoom factor
    - [.center] <code>Coord</code> <code> = [48.86, 2.3]</code> - Coord of the center
    - [.scheme] <code>string</code> <code> = &quot;normal.day.grey&quot;</code> - any scheme defined by HERE, plus "japan", "korea", "black", "white", "transparent". For japan/korea, one needs special credentials as APP_[ID|CODE]_JAPAN APP_[ID|CODE]_KOREA
    - [.click] <code>function</code> <code> = </code> - callback on mouse click: callback(coord,button,key)
    - [.dbClick] <code>function</code> <code> = </code> - callback on mouse double click: callback(coord,button,key)
    - [.clickLeft] <code>function</code> <code> = </code> - callback on mouse click left: callback(coord,button,key)
    - [.clickRight] <code>function</code> <code> = </code> - callback on mouse click right.: callback(coord,button,key)
    - [.keyDown] <code>function</code> <code> = </code> - callback on key down : callback(key)
    - [.viewChange] <code>function</code> <code> = </code> - callback if map is panned or zoomed : callback(zoom,coordCenter)
    - [.loadTile] <code>function</code> <code> = </code> - callback when a tile is loaded : callback(z,x,y,url)

**Example**  
```jsconst hm = window.heremap;hm.config({   app_id: "YOUR APP_ID",   app_code: "YOUR APP_CODE",});hm.map("map", {   zoom:5,   center: [48.8,2.3],   click: function(coord,button,key) {console.log("clicked on",coord,"with button",button);}}); ```
<a name="hm_marker"></a>

## hm:marker(opt)
add a marker in a layersvg files can be created with https://editor.method.ac/

**Kind**: global function  
**Params**

- opt <code>object</code> - options to create the marker
    - [.layer] <code>string</code> - layer name
    - [.coord] <code>coord</code> - coord of the marker as \[lat,lng\]
    - [.icon] <code>string</code> - created from hm.buildIcon
    - [.svg] <code>string</code> - see hm.buildIcon
    - [.opt] <code>Object</code> - see hm.buildIcon
    - .pointerenter <code>function</code> - if enter, callback(target,coord,ev)
    - .pointerClick <code>function</code> - if click, callback(target,coord,ev)
    - .data <code>string</code> - optional data
    - .bubble <code>boolean</code> - if true, show buble on click with data
    - .draggable <code>boolean</code> - draggable marker
    - .dragged <code>function</code> - if dragged, callback(target,coord)

**Example**  
```jshm.marker({   coord: [48.8,2.3],});hm.marker({  svg: "svg/marker.svg",  color:"red",  ratio:0.5});hm.marker({   img: "http://whatever.com/image.png",   coord: [48.8,2.3]});hm.marker({   coord: [48.8,2.3],   data:"Hello world",   bubble: true});hm.marker({   coord: [48.8,2.3],   draggable:true,   dragged: function(target,coord) {console.log("dragged to",coord);}}); ```
<a name="hm_matrix"></a>

## hm:matrix(source, dest, opt) ⇒ <code>object</code>
compute a matrix. [See more info on optional parameters](http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)Matrix size is limited to 1x100, 100x1 or 15xN

**Kind**: global function  
**Returns**: <code>object</code> - { entries: object, body:object }. entries is the array of {start,stop} information. body is full json answer  
**Params**

- source <code>object</code> - source as \[lat,lng\]. Can be array of \[lat,lng\]
- dest <code>object</code> - dest as \[lat,lng\]. Can be array of \[lat,lng\]
- opt <code>object</code> - additional optional parameters like  mode, summaryAttributes
    - [.mode] <code>string</code> <code> = &quot;\&quot;fastest;car;traffic:enabled\&quot;&quot;</code> - routing mode to compute matrix
    - [.summaryAttributes] <code>string</code> <code> = &quot;\&quot;tt,di\&quot;&quot;</code> - attributes in the answer

**Example**  
```jsconst res = await hm.matrix({     source:[48.8,2.3]     dest:[[48.7,2.5],[48.1,2.0],[44.2,2.3]]});console.log (res.entries); ```
<a name="hm_polygon"></a>

## hm:polygon(opt)
Draw a polygon

**Kind**: global function  
**Params**

- opt <code>Object</code> - options to draw a polygon. Same options as hm.polyline

<a name="hm_polyline"></a>

## hm:polyline(opt)
Draw a polyline.

**Kind**: global function  
**Params**

- opt <code>object</code> - options to draw polyline
    - [.layer] <code>String</code> - optional layer to use
    - [.coords] <code>array</code> - array of coords, as \[\[48.8,2.3\],\[48.85,2.4\],... \]
    - [.style] <code>object</code> - optional graphic style
    - [.lineWidth] <code>number</code> <code> = 4</code> - line width
        - [.strokeColor] <code>string</code> <code> = &quot;rgba(0, 128, 255, 0.7)&quot;</code> - line color
    - [.arrows] <code>object</code> - optional arrow
    - [.data] <code>String</code> - optional user data
    - [.pointerClick] <code>function</code> - optional callback if click on line. format callback(target,coord,event)
    - [.pointerenter] <code>function</code> - optional callback if mouse enters on line. format callback(target,coord,event)
    - [.pointerLeave] <code>function</code> - optional callback if mouse leaves the line. format callback(target,coord,event)
    - [.z] <code>number</code> - optional z level```jshm.polyline({   coords: [[48.8,2.3],[48.85,2.4],[48.9,2.6]],   layer:"layer1"});hm.polyline({   coords: coords,   style: {       lineWidth: 4,       strokeColor: "red"   },});hm.polyline({   coords: coords,   data:"Hello World",}); ```

<a name="hm_reverseGeocode"></a>

## hm:reverseGeocode(coord) ⇒ <code>object</code>
reverse geocode a coordinate

**Kind**: global function  
**Returns**: <code>object</code> - returns { location:object, address:object, body:object}.  
**Params**

- coord <code>Coord</code> - coord \[lat,lng\] to reverse geocode

<a name="hm_route"></a>

## hm:route(source, dest, opt) ⇒ <code>object</code>
compute a route with optional waypooints. [See more info on optional parameters](http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)

**Kind**: global function  
**Returns**: <code>object</code> - returns { summary: object, coords:array,route: object, body:object}. coords is array of coord, to be used with hm.polyline.  
**Params**

- source <code>object</code> - source as \[lat,lng\]. Can be array of \[lat,lng\] to define waypoints
- dest <code>object</code> - dest as \[lat,lng\]. Can be array of \[lat,lng\] to define waypoints
- opt <code>object</code> - route options
    - [.mode] <code>string</code> <code> = &quot;fastest;car;traffic:disabled&quot;</code> - routing mode
    - [.routeattributes] <code>string</code> <code> = &quot;waypoints,summary,shape&quot;</code> - route attributes
    - [.maneuverattributes] <code>string</code> <code> = &quot;direction,action&quot;</code> - manoeuver attributes

**Example**  
```jsconst res = await hm.route([48.8,2.3],[48.7,2.5]);console.log (res.summary);const res = await hm.route([[48.8,2.3],[48.9,2.7]], [49.3,2.5]);console.log (res.route); const res = await hm.route([48.8,2.3], [[48.9,2.7], [49.3,2.5]]);console.log (res.summary); ```
<a name="hm_screenshot"></a>

## hm:screenshot(opt, opt) ⇒ <code>data</code>
perform a screenshot of the map and returns a promise with the data

**Kind**: global function  
**Returns**: <code>data</code> - binary data of image  
**Params**

- opt <code>object</code> - options for screenshot
    - [.name] <code>string</code> - filename for download
    - [.ui] <code>boolean</code> - true to ui (scale, etc..) in screenshot
- opt <code>object</code> - options for screenshot

<a name="hm_setCenter"></a>

## hm:setCenter(coord)
set center of the map

**Kind**: global function  
**Params**

- coord <code>Array</code> - coord as [lat,lng]* @example```jshm.setCenter([48.8,2.3]); ```

<a name="hm_setScheme"></a>

## hm:setScheme(scheme)
define the scheme. List of scheme can be obtained from {hm.getAvailableMapStyle()}

**Kind**: global function  
**Params**

- scheme <code>string</code> - scheme name

<a name="hm_setViewBB"></a>

## hm:setViewBB(opt)
sets bouding box to be displayed

**Kind**: global function  
**Params**

- opt <code>Object</code> | <code>string</code> - either an object specifying how to set bounding box, or  a String being the name of a layer
    - [.layer] <code>string</code> - bouding box aroud all objects of the layer
    - [.pois] <code>array</code> - bouding box aroud all coords defined as \[coord,coord...\]

**Example**  
```jshm.setViewBB("layer1");hm.setViewBB({   pois: coords}); ```
<a name="hm_setZoom"></a>

## hm:setZoom(zoom)
set zoom level

**Kind**: global function  
**Params**

- zoom <code>number</code>

<a name="hm_touch"></a>

## hm:touch(onoff, options)
activate touch, allowing hand drawing

**Kind**: global function  
**Params**

- onoff <code>boolean</code> - activate or deactivate
- options <code>object</code> - options  to control the touch behaviour
    - [.callback] <code>function</code> - calling callback(coords) when touch ends
    - [.layer] <code>string</code> - layer where to put the drawing
    - [.style] <code>object</code> - drawing style
    - [.arrow] <code>object</code> - arrow style
    - [.tolerance] <code>number</code> <code> = 4</code> - tolerance for simplification
    - [.keep] <code>boolean</code> <code> = false</code> - keep graphic or not when calling callback


* * *

&copy; 2018-2019 devbab