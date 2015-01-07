#Use [Sortable](https://github.com/RubaXa/Sortable) insetad of TouchDragNSort

## Demo;
===================================
*[Demo in jsdo.it ( http://jsdo.it/erik/uArR)](http://jsdo.it/erik/uArR ).*

## Dependency:
[Hammer.js](http://eightmedia.github.io/hammer.js/)

## Usage
DragNsort only needs to follow a simple pattern. Here is an example:

```html
<div id='container'>
	<div>your contents</div>
	<div>your contents</div>
	<div>your contents</div>
</div>

<script type="text/javascript">
	(function(){
		var mysortable = DragNSort.horizontally("contianer",function(data){
		    console.log("callback.data",data.elements);
		});
	})();
</script>

```

## options:
You can change the default settings by adding an second argument with options
*  childClassName : "e-grid"
*  draggingClassName : "dragging"
*  translateSpeed: 300  // in millisecond
*  collideOffsetPx: -60 // in px
*  margins: [0,10, 10, 0] // TOP RIGHT BOTTOM LEFT
*  onDragTransform: "scale(1.1)"
*  dragTimeout: 300 //in millisecond
*  onTap: undefine // function(event){...}
*  onDragEnd: undefine // as well as callback: function(data){...}

Example:
```javascript
var mysortable = DragNSort.horizontally(
	"contianer",
	{
		margins:[0,10,10,0]	
	}, function(data){
	console.log("callback.data",data.elements);
});
```

## Instance methods:
```javascript
	//update the positions of the grids for changing dimension of the container.
	mysortable.update();
```
