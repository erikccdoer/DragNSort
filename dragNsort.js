;(function( Hammer, window, undefine){
    "use strict";

    /*
     var doc = document,
     body = doc.body;


     var touchArea = doc.createElement("div");
     var grid = touchArea.cloneNode(0);
     var target, index;

     //    body.appendChild(touchArea);
     //    touchArea.appendChild(grid)
     touchArea.id = "touchArea";
     grid.className = "grid";
     grid.style.left = "0px";


     //    var hammertime = Hammer(touchArea)
     //                        .on("drag", function(evt) {
     //                                // this = dom
     //                                console.log("evt",evt);
     //                                target = evt.target;
     //                                if(target===grid){
     //                                    evt.gesture.preventDefault();
     //                                    if(!x){
     //                                        x = parseInt(target.style.left);
     //                                    }
     //                                    target.style.left = (x + evt.gesture.deltaX) + "px";
     //                                    console.log(x,target.style.left, evt.gesture.deltaX);
     //                                }
     //
     //
     //                        }).on("touch", function(evt){
     //                                console.log("evt",evt);
     //
     //                        }).on("release", function(evt){
     //                            console.log("evt",evt.type);
     //                            x = 0;
     //
     //                        });

     */

    var DragNSort = {

        horizontally: function(elem, param1, param2)
        {

            if(typeof(param1) === "function"){

                return TouchMovingGrids(elem, {onDragEnd: param1});
            }
            else{
                param1.onDragEnd = param2;
                return TouchMovingGrids(elem,param1);
            }

        }

    }


    function TouchMovingGrids(elem, _options){

        var TOP = 0,
            RIGHT = 1,
            BOTTOM = 2,
            LEFT = 3;

        var gridStyle = {
                position : "absolute"
            },
            containerStyle = {
                position : "relative"
            },
            options = {
                childClassName : "e-grid",
                draggingClassName : "dragging",
                translateSpeed: 300,
                collideOffsetPx: -0,
                margins: [0,0, 0, 0],
                onTap: undefine,
                onDragTransform: "scale(1.1)",
                minPxTriggerSwap: 80,
                onDragEnd: undefine,
                dragTimeout: 300
            },
            doc = document,
            container = doc.getElementById(elem),
            childNodesObj = container.children,
            childNodes = (function(){
                var temp = [];
                for(var i=0; i<childNodesObj.length; i++){
                    temp.push(childNodesObj[i]);
                }
                return temp;
            })(),
            containerRect,
            totalChild = childNodes.length,
            rgProp = new Array(totalChild),
            hammer, draggingTarget, draggingTrgtIndex, dragging, draggingTrgtXPos, draggingTrgtYPos, lastSwapIndex, lastDragType;

        var transitionEevent = {
            handleEvent: function(event) {

                switch (event.type) {
                    case 'webkitTransitionEnd':
                    case 'msTransitionEnd':
                    case 'oTransitionEnd':
                    case 'otransitionend':
                    case 'transitionend': transitionEnd(event); break;
                }

                if (options.stopPropagation) event.stopPropagation();

            }
        };

        for(var key in _options){
            options[key] = _options[key];
        }

        function init(){

            /*var nodeRect;
             for(var i=0; i<totalChild; i++){
             nodeRect = childNodes[i].getBoundingClientRect();
             rgProp[i] = {
             x: !i ? options.margins[0] : rgProp[i-1].x + rgProp[i-1].width + options.margins[0] + options.margins[1],
             width: nodeRect.right - nodeRect.left
             };

             //                childNodes[i].style = Hammer.utils.extend(childNodes[i].style, gridStyle);
             if(childNodes[i]){
             for(var key in gridStyle){
             childNodes[i].style[key] = gridStyle[key];
             }
             }

             addClass(childNodes[i], options.childClassName);
             translateByIndex(i, 0);
             }*/

            for(var i=0; i<totalChild; i++){
                rgProp[i] = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                }

                if(childNodes[i]){
                    for(var key in gridStyle){
                        childNodes[i].style[key] = gridStyle[key];
                    }
                }
                addClass(childNodes[i], options.childClassName);
            }
            update();
            sortChilds();

            if(container){
                for(var key in containerStyle){
                    container.style[key] = containerStyle[key];
                }
            }

            hammer = Hammer(container,
                {
                    drag_lock_to_axis: true,
                    hold_timeout: options.dragTimeout
                })
                .on("touch dragleft dragright release hold tap", handleHammer)
//                .on("hold", handleOnHold)
                ;

            container.addEventListener('webkitTransitionEnd', transitionEevent, false);
            container.addEventListener('msTransitionEnd', transitionEevent, false);
            container.addEventListener('oTransitionEnd', transitionEevent, false);
            container.addEventListener('otransitionend', transitionEevent, false);
            container.addEventListener('transitionend', transitionEevent, false);
        }

        function update(){

            containerRect = container.getBoundingClientRect();
            var nodeRect,
                maxHeight = 0,
                containerWidth = containerRect.right - containerRect.left,
                childWidth = 0,
                tempX,
                tempY = options.margins[TOP];

            for(var i=0; i<totalChild; i++){

                nodeRect = childNodes[i].getBoundingClientRect();
                childWidth = nodeRect.right - nodeRect.left;
                tempX = !i ? options.margins[LEFT] : rgProp[i-1].x + rgProp[i-1].width + options.margins[LEFT] + options.margins[RIGHT];

                rgProp[i].width = childWidth;
                rgProp[i].height = nodeRect.bottom - nodeRect.top;

                maxHeight = (maxHeight >= rgProp[i].height) ? maxHeight : rgProp[i].height;

                if(childWidth + tempX > containerWidth){
                    tempX = options.margins[LEFT];
                    tempY += maxHeight + options.margins[TOP] + options.margins[BOTTOM];
                }
                rgProp[i].x = tempX;
                rgProp[i].y = tempY;

                rgProp[i].animating = false;

                translateByIndex(i, 1);
            }

            container.style.height = (rgProp[totalChild-1].y + maxHeight + options.margins[BOTTOM]) +"px";


//            console.log("rgProp",rgProp);
        }


        function transitionEnd(evt){

            var movedIndex = indexOfChild(evt.target);
            if(movedIndex > -1){
                rgProp[movedIndex].animating = false;
            }

            if(dragging || evt.propertyName.search("transform")<0)
            {
                return;
            }
            else if(draggingTarget != evt.target){
                return;
            }

//            removeAddiontionalStyle(draggingTrgtIndex);

            draggingTarget = draggingTrgtIndex = false;



//            if(draggingTarget === evt.target || dragging){return;}
//            console.log("transitionEnd", evt.propertyName);

            sortChilds();

            if(options.onDragEnd){
                options.onDragEnd.call(container, { elements: childNodes });
            }

        }

//        function removeAddiontionalStyle(_index){
//
//        }

        function sortChilds(){
            var temp;
            for(var i=0; i<totalChild; i++){
                for(var j=i+1; j<totalChild; j++){

                    if(rgProp[i].x > rgProp[j].x || rgProp[i].y > rgProp[j].y){

                        temp = childNodes[j];
                        childNodes[j] = childNodes[i];
                        childNodes[i] = temp;

                        temp = rgProp[j];
                        rgProp[j] = rgProp[i];
                        rgProp[i] = temp;
                    }

                }
            }
        }

        function translateTo(_index, xPos ,_speed, yPos){
            var child = childNodes[_index];
            var style = child && child.style;

//            if (!style || rgProp[_index].animating){return;}
            if (!style){return;}

            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                    style.msTransitionDuration =
                        style.OTransitionDuration =
                            style.transitionDuration = ( _speed ? _speed :  _speed === 0 ? 0 : options.translateSpeed) + 'ms';

            style.webkitTransform = 'translate(' + xPos + 'px, '+yPos+'px) ' + /*'translateZ(0) ' +*/ (dragging && draggingTrgtIndex === _index ? options.onDragTransform : "" );
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'translateX(' + xPos + 'px) translateY('+yPos+'px) ' + (dragging && draggingTrgtIndex === _index ? options.onDragTransform : "" );
        }

        function translateByIndex(_index, _speed) {
            translateTo(_index, rgProp[_index].x,_speed, rgProp[_index].y);
        }

        function hasClass(ele,cls){
            return ele.className && ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        }

        function removeClass(ele,cls) {
            if (hasClass(ele,cls)) {
                var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                ele.className=ele.className.replace(reg,'');
            }
        }

        function addClass(ele,cls) {
            if (!hasClass(ele,cls)) ele.className += " "+cls;
        }

        function toChildNode(ele){
            if(hasClass(ele, options.childClassName)){
                return ele;
            }
            else if(ele.parentNode && ele.parentNode != container){
                return toChildNode(ele.parentNode);
            }
        }

        function indexOfChild(ele){
            var _index = -1;
            for(var i=0; i<childNodes.length; i++){
                if(childNodes[i] == ele){
                    _index = i;
                }
            }
            return _index;
        }


        function intersectRect(aX, aY, aW, aH, bX, bY, bW, bH) {
            return (Math.abs(aX - bX) * 2 < (aW + bW)) && (Math.abs(aY - bY) * 2 < (aH + bH));
        }

        function getIndexCollideDraggingTarget(_draggingTargetIndex, _currentXPos){
//            var offsetFactor = .45;
            var x1,x2, y1, y2, w1, w2, h1, h2;

            var minDis = 1e9;
            var minDisIndex = -1;
            var t;
            for(var i=0; i<totalChild; i++){
                if(_draggingTargetIndex != i){

                    x1 = (rgProp[i].x + rgProp[i].width *.5);
                    x2 = _currentXPos;
                    y1 = (rgProp[i].y + rgProp[i].height *.5);
                    y2 = (rgProp[_draggingTargetIndex].y + rgProp[_draggingTargetIndex].height *.5);

                    t = Math.sqrt( (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) );
                    if ( t < minDis){
                        minDis = t;
                        minDisIndex = i;
                    }
                }
            }
            if(minDis<options.minPxTriggerSwap && !rgProp[minDisIndex].animating){
                return minDisIndex;
            }
            console.log("minDisIndex",minDisIndex);
//            return minDisIndex;
/*

            for(var i=0; i<totalChild; i++)
            {

                console.log("i",i);
                x1 = _currentXPos - options.margins[LEFT];
                y1 = rgProp[_draggingTargetIndex].y - options.margins[TOP];
                w1 = rgProp[_draggingTargetIndex].width  + options.collideOffsetPx;
                h1 = rgProp[_draggingTargetIndex].height ;
                x2 = rgProp[i].x - options.margins[LEFT];
                y2 = rgProp[i].y - options.margins[TOP];
                w2 = rgProp[i].width + options.collideOffsetPx;
                h2 = rgProp[i].height ;

                if(_draggingTargetIndex != i && intersectRect(x1, y1, w1, h1, x2, y2, w2, h2))
                {
//                    console.log(x1, y1, w1, h1, x2, y2, w2, h2);
                    return i;
                }
            }
*/

            return -1;
        }

        function swapPosition(_draggingTrgtIndex, _swapIndex){

            var draggingX = rgProp[_draggingTrgtIndex].x;
            var swapX = rgProp[_swapIndex].x;

            if(draggingX < swapX){
                rgProp[_swapIndex].x = draggingX;
                rgProp[_draggingTrgtIndex].x += rgProp[_swapIndex].width + options.margins[1];
            }
            else{
                rgProp[_draggingTrgtIndex].x = swapX;
                rgProp[_swapIndex].x += rgProp[_draggingTrgtIndex].width + options.margins[1];
            }

        }


        function handleHammer(evt) {

            if(evt.target == container){
//                console.log("only child nodes will response");
                return;
            }

            switch (evt.type)
            {
                case "tap":
                        if(dragging){
                            evt.gesture.preventDefault();
                            evt.gesture.stopPropagation();
                            return;
                        }
                        if(options.onTap){
                            options.onTap.call(toChildNode(evt.target),evt);
                        }
                    break;
                case "hold":
//                case "touch":
                    dragging = true;
//                    if(!dragging)
                        {

                            draggingTarget = toChildNode(evt.target);
                            addClass(draggingTarget, options.draggingClassName);
                            draggingTrgtIndex = indexOfChild(draggingTarget);
                            draggingTrgtXPos = rgProp[draggingTrgtIndex].x;
                            draggingTrgtYPos = rgProp[draggingTrgtIndex].y;
                            translateByIndex(draggingTrgtIndex);

                        }

                    if(evt.gesture.touches.length>1){alert(2)}

                    break;

                case 'dragright':
                case 'dragleft':
                    console.log("evt",evt);
                    if(!dragging){return;}

                    evt.gesture.preventDefault();
                    evt.gesture.stopPropagation();

                    var currentXPos = draggingTrgtXPos + evt.gesture.deltaX;
                    translateTo(draggingTrgtIndex, currentXPos, 0, draggingTrgtYPos);

                    var _collideIndex = getIndexCollideDraggingTarget(draggingTrgtIndex, currentXPos + rgProp[draggingTrgtIndex].width *.5);

                    if(_collideIndex > -1 ){
//                        console.log("childs[",_collideIndex,"].animating", rgProp[_collideIndex].animating);

//                        if(_collideIndex === lastSwapIndex && lastDragType === evt.type){return;}
//                        if(rgProp[_collideIndex].animating){return;}

                        swapPosition(draggingTrgtIndex, _collideIndex);

                        translateByIndex(_collideIndex);
                        rgProp[_collideIndex].animating = true;

//                        lastSwapIndex = _collideIndex;
//                        lastDragType = evt.type;

                    }
                    break;

                case "release":
//                    console.log("onRelease");
                    if(!dragging){return;}
                    dragging = false;
                    removeClass(draggingTarget, options.draggingClassName);
                    translateByIndex(draggingTrgtIndex);

                    break;
            }
        }

        init();

        return {
            update : update
        }

    }
    window.DragNSort = DragNSort;

//    TouchMovingGrids("contianer", function(data){
//        console.log("callback.data",data.elements);
//    });


})(Hammer,window);

