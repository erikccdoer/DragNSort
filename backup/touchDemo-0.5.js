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
    function TouchMovingGrids(elem, callback){

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
                collideOffsetPx: -60,
                margins: [0,10]
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
            containerRect = container.getBoundingClientRect(),
            totalChild = childNodes.length,
            rgProp = new Array(totalChild),
            hammer, draggingTarget, draggingTrgtIndex, dragging, draggingTrgtXPos;

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

        function init(){

            var nodeRect;
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
            }
//            container.style = Hammer.utils.extend(container.style, containerStyle);
            if(childNodes[i]){
                for(var key in container){
                    childNodes[i].style[key] = container[key];
                }
            }

            hammer = Hammer(container,
                            {
                                drag_lock_to_axis: true
                            })
                            .on("touch dragleft dragright release", handleHammer);

            container.addEventListener('webkitTransitionEnd', transitionEevent, false);
            container.addEventListener('msTransitionEnd', transitionEevent, false);
            container.addEventListener('oTransitionEnd', transitionEevent, false);
            container.addEventListener('otransitionend', transitionEevent, false);
            container.addEventListener('transitionend', transitionEevent, false);


        }

        function transitionEnd(evt){
            if(dragging || evt.propertyName.search("transform")<0)
            {
                return;
            }
            else if(draggingTarget != evt.target){
                return;
            }

            draggingTarget = draggingTrgtIndex = false;

//            if(draggingTarget === evt.target || dragging){return;}
            console.log("transitionEnd", evt.propertyName);

            var temp;
            for(var i=0; i<totalChild; i++){
                  for(var j=i+1; j<totalChild; j++){
                      if(rgProp[i].x > rgProp[j].x){

                          temp = childNodes[j];
                          childNodes[j] = childNodes[i];
                          childNodes[i] = temp;

                          temp = rgProp[j];
                          rgProp[j] = rgProp[i];
                          rgProp[i] = temp;
                      }
                  }
            }
            callback.call(this, { elements: childNodes });
        }

        function translateTo(_index, xPos, _speed){
            var child = childNodes[_index];
            var style = child && child.style;

            if (!style){return;}

            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                    style.msTransitionDuration =
                        style.OTransitionDuration =
                            style.transitionDuration = ( _speed ? _speed :  _speed === 0 ? 0 : options.translateSpeed) + 'ms';

            style.webkitTransform = 'translate(' + xPos + 'px,0)' + 'translateZ(0)';
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'translateX(' + xPos + 'px)';
        }

        function translateByIndex(_index, _speed) {
            translateTo(_index, rgProp[_index].x ,_speed);
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


        function intersectRect(l1, w1, l2, w2) {
            return l1 <= w2+l2 && l2 <= w1+l1;
        }

        function getIndexCollideDraggingTarget(_draggingTargetIndex, _currentXPos){
            for(var i=0; i<totalChild; i++){
                if(_draggingTargetIndex != i && intersectRect(_currentXPos, rgProp[_draggingTargetIndex].width + options.collideOffsetPx, rgProp[i].x, rgProp[i].width + options.collideOffsetPx )){
                    return i;
                }
            }
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
                console.log("only child nodes will response");
                return;
            }

            switch (evt.type)
            {
                case "touch":
                    console.log("onTouch");
                    dragging = true;
//                    if(!dragging)
                    {
                        draggingTarget = toChildNode(evt.target);
                        addClass(draggingTarget, options.draggingClassName);
                        draggingTrgtIndex = indexOfChild(draggingTarget);
                        draggingTrgtXPos = rgProp[draggingTrgtIndex].x;
                    }
                    break;

                case 'dragright':
                case 'dragleft':
                    if(!dragging){return;}
                    evt.gesture.preventDefault();

                    var currentXPos = draggingTrgtXPos + evt.gesture.deltaX;
                    translateTo(draggingTrgtIndex, currentXPos, 0);

                    var _collideIndex = getIndexCollideDraggingTarget(draggingTrgtIndex, currentXPos);

                    if(_collideIndex > -1){
                        swapPosition(draggingTrgtIndex, _collideIndex);
                        translateByIndex(_collideIndex);
                    }
                    break;

                case "release":
                    console.log("onRelease");
                    removeClass(draggingTarget, options.draggingClassName);
                    translateByIndex(draggingTrgtIndex);
                    dragging = false;
                    break;
            }
        }


        init();



    }
    window.TouchMovingGrids = TouchMovingGrids;

    TouchMovingGrids("contianer", function(data){
        console.log("callback.data",data.elements);
    });


})(Hammer,window);