var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var idpoint = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1	, 0, 2 * Math.PI);
        ctx.stroke();
    };
    var addPolygonToCanvas = function (points) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        ctx.lineTo(points[1].x,points[1].y);
        ctx.lineTo(points[2].x,points[2].y);
        ctx.lineTo(points[3].x,points[3].y);
        ctx.stroke();
    };
    var clear = function () {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (idpoint) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        // subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+idpoint, function (eventbody) {
            
           var point = JSON.parse(eventbody.body);
           
           var pt=new Point(point["x"],point["y"]);
           addPointToCanvas(pt);
            
                
            });
            stompClient.subscribe('/topic/newpolygon.'+idpoint, function (eventbody) {
                
                var points = JSON.parse(eventbody.body);
                
                // var pt=new Point(point["x"],point["y"]);
                addPolygonToCanvas(points);
                 
                     
                 });
        });
        
    };
    
    

    return {

        init: function (idpoint) {
            var can = document.getElementById("canvas");
            app.idpoint=idpoint;
            
            // websocket connection
            connectAndSubscribe(idpoint);
            can.addEventListener('click',app.clicpoint);
        },

        publishPoint: function(px,py,idpoint){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            // publicar el evento
            
            stompClient.send("/app/newpoint."+ app.idpoint, {}, JSON.stringify(pt)); 
            
        },
        clicpoint: function(event){
        	var canvas=document.getElementById("canvas");
        	var delta=canvas.getBoundingClientRect();
        	
        	publishPoint(event.pageX-delta.left,event.pageY-delta.top);
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },
        errase:function(){
        	clear();
        }
    };

})();