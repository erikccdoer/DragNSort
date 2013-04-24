## Dependency:
    [Hammer.js](http://eightmedia.github.io/hammer.js/)

## Usage
    DragNsort only needs to follow a simple pattern. Here is an example:
    
    ``` html
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
    -- childClassName : "e-grid"
    -- draggingClassName : "dragging"
    -- translateSpeed: 300  // in millisecond
    -- collideOffsetPx: -60 // in px
    -- margins: [0,10, 10, 0] // TOP RIGHT BOTTOM LEFT

Example:
    var mysortable = DragNSort.horizontally("contianer",{margins:[0,10,10,0]}, function(data){
        console.log("callback.data",data.elements);
    });
