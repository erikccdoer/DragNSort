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

        var browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function(temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
                return false;
            })(document.createElement('swipe'))
        };


        var childClassName = "e-grid",
            draggingClass = "dragging",
            translateSpeed = 300,
            collideOffsetPx = -60,
            doc = document,
            container = doc.getElementById(elem),
            childNodes = container.children,
            containerRect = container.getBoundingClientRect(),
            _pageL = new Array(childNodes.length),
            _pageW = new Array(childNodes.length),
            _map = new Array(childNodes.length),
            target, dragging,
            collideNodeIndex = -1,
            index = -1,
            mapIndex = -1,
            swappingIndex = -1,
            dragRect;



        function init(){
            var _rect;
            container.style.position = "relative";

            for(var i=0; i<childNodes.length; i++){
//                childNodes[i].className += childClassName;
                addClass(childNodes[i],childClassName);
                _rect = childNodes[i].getBoundingClientRect();
                _pageL[i] = _rect.left - containerRect.left;
                _pageW[i] = _rect.right -  _rect.left;
                _map[i] = i;

                initStyle(childNodes[i],_rect);
            }
            var hammer = Hammer(container,{ drag_lock_to_axis: true })
                .on("touch dragleft dragright release", handleHammer);

            console.log("_pageL",_pageL);
            console.log("_pageW",_pageW);
        }

        function initStyle(ele,rect){
//            ele.style.left = (rect.left - containerRect.left) +"px";
//            ele.style.top = (rect.top - containerRect.top) +"px";

            translate(ele, rect.left - containerRect.left);
            setTimeout(function(){
                ele.style.position = "absolute";
            },100)
        }

        function getChildIndex(node){
            console.log("node in childrens", node in childNodes);
        }

        function hasClass(ele,cls){
            return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        }

        function removeClass(ele,cls) {
            if (hasClass(ele,cls)) {
                var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                ele.className=ele.className.replace(reg,' ');
            }
        }

        function addClass(ele,cls) {
            if (!hasClass(ele,cls)) ele.className += " "+cls;
        }

        function toChildNode(ele){
            if(hasClass(ele, childClassName)){
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

        function setCssSpeed(style, speed){
            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                    style.msTransitionDuration =
                        style.OTransitionDuration =
                            style.transitionDuration = speed + 'ms';
        }


        function scale(child, _scale, speed){
//            var child = childNodes[_index];
            var style = child && child.style;

            if (!style){return;}

            setCssSpeed(style, speed);

            style.webkitTransform = 'scale(' + _scale + ', '+ _scale +')';
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'scale(' + _scale + ', '+ _scale +')';
        }

        function translate(child, dist, speed) {

//            var child = childNodes[_index];
            var style = child && child.style;

            if (!style){return;}

            setCssSpeed(style, speed);

            style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'translateX(' + dist + 'px)';

        }

        function intersectRect(l1, r1, l2, r2) {
            return l1 <= r2+l2 && l2 <= r1+l1;
        }



        function getCollideNodeIndex(nodeIndex, relativeLeft){
            var _collidePropIndex = -1;
            var _collideIndex = -1;
            var _propIndex = _map[nodeIndex];

            var _rect = childNodes[nodeIndex].getBoundingClientRect();

            for(var i=0; i<childNodes.length; i++){

//                if( intersectRect(_pageL[_propIndex]+deltaX, _pageW[_propIndex] + collideOffsetPx, _pageL[i], _pageW[i] + collideOffsetPx) && i != _propIndex){
                if( intersectRect(relativeLeft, _pageW[_propIndex] + collideOffsetPx, _pageL[i], _pageW[i] + collideOffsetPx) && i != _propIndex){
                    _collidePropIndex = i;
                }
            }
            for(var i=0; i<_map.length; i++){

                if(_map[i] === _collidePropIndex){
                    _collideIndex = i;
                }
            }

//            console.log("pros[",_propIndex,"]");
//            return _propIndex > -1 ? _map[_propIndex] : _propIndex;
            return _collideIndex;
        }

//        function mapPropsIndex(_index) {
//            var _i = -1;
//            for(var i=0; i<_map.length; i++){
//                if(_index == _map[i]){
//                    _i = i;
//                }
//            }
//            return _i;
//        }

        function swapMapping(node1, node2){

            if(node1<0 || node2<0){return;}

            var temp = _map[node1];
                _map[node1] =  _map[node2];
            _map[node2] = temp;

//            restoreAll();
        }

        function restoreAll(){
            target.style.zIndex = 1;
//            translate(target, _pageL[index], 300);
            for(var i=0; i<= childNodes.length; i++){
                if(target != childNodes[i] || !dragging)
                {
                    translate(childNodes[i], _pageL[_map[i]] ,300);
                }
            }

            if(typeof(callback) === "function" && !dragging){
                var elements = [];
                for(var i=0; i<_map.length; i++){
                    elements.push(childNodes[_map[i]]);
                }
                callback.call(this, { elements: elements });
            }

        }

        function handleHammer(evt) {

            if(evt.target == container){
                console.log("only child nodes will response");
                return;
            }


            if(!dragging){
                target = toChildNode(evt.target);
                addClass(target, draggingClass);
                index = indexOfChild(target);
                mapIndex = _map[index];
                dragRect = childNodes[index].getBoundingClientRect();
            }
            target.style.zIndex = 9999;

            switch (evt.type)
            {
                case "touch":
//                    console.log("hammerEvent", evt);

                    break;

                case 'dragright':
                case 'dragleft':
                    evt.gesture.preventDefault();

                    dragging = true;
//                    console.log("drag.event", evt);
//                    console.log(_pageL[index], evt.gesture.deltaX);
                    translate(target, dragRect.left - containerRect.left + evt.gesture.deltaX, 0);
                    collideNodeIndex = getCollideNodeIndex(index, dragRect.left - containerRect.left + evt.gesture.deltaX);

                    if(collideNodeIndex > -1 && swappingIndex!= collideNodeIndex){
//                        console.log("collideNodeIndex", collideNodeIndex);
//                        console.log("swap", index, collideNodeIndex);
//                        translate(childNodes[collideNodeIndex], _pageL[mapIndex], 300);
                        swapMapping(index, collideNodeIndex);
                        swappingIndex = collideNodeIndex;
                        restoreAll();
                        setTimeout(function(){
                            swappingIndex = -1;
                        },400);
                    }



                    break;

                case "release":
                    dragging = false;
                    swapMapping(index, collideNodeIndex);
                    restoreAll();
                    removeClass(target, draggingClass);
//                    console.log("------------------------------");
//                    console.log("index", index);
//                    console.log("mapIndex", mapIndex);
//                    console.log("collideNodeIndex", collideNodeIndex);
//                    console.log("swap props", mapIndex, collideNodeIndex);
//                    console.log("swapMapping", _map);
//                    console.log("------------------------------");

                    break;
            }
        }


        init();



    }

    window.TouchMovingGrids = TouchMovingGrids;


    TouchMovingGrids("contianer", function(data){
        console.log("this",this);
        console.log("data",data);
    });


})(Hammer,window);