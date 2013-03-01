(function(exports){

///////////////
// MIXIN
///////////////

var Mixin = function(src,dest){
	for(var key in src){
		dest[key] = src[key];
	}
};

///////////////
// EVENT EMITTER
// Make any js object an event emitter
///////////////

var EventEmitter = function(){};
EventEmitter.prototype = {
	
	on: function(event, fn){
		this._events = this._events || {};
		this._events[event] = this._events[event] || [];
		this._events[event].push(fn);
		return this;
	},
	
	once: function(event, fn){
		var me = this;
		me.on(event,function wrapper(){
			me.off(event,wrapper);
			fn.apply(this,arguments);
		});
		return this;
	},

	off: function(event, fn){
		
		this._events = this._events || {};
		if(!this._events[event]) return;
		var handlers = this._events[event];
		var index = handlers.indexOf(fn);
		if(index<0) return;

		handlers.splice(index, 1);

		return this;

	},

	emit: function(event /* , args... */){

		this._events = this._events || {};

		if(!this._events[event]) return;
		var handlers = this._events[event];
		var args = Array.prototype.slice.call(arguments, 1);

		for(var i=0; i<handlers.length; i++){
			handlers[i].apply(this,args);
		}

		return this;

	}

};


///////////////
// TOOLBOX
///////////////

var Toolbox = {
	id: -1,
	open: function(src){
		return new App(src);
	},
	tellParent: function(){}
};

Mixin(EventEmitter.prototype,Toolbox);

window.addEventListener("message",function(event){

	var fromID = event.data.from;
	var toID = event.data.to;
	var command = event.data.command;
	var params = event.data.params;

	var target = _apps[fromID];
	target = target ? target : Toolbox;
	target.emit(command,params);

	// Only for Initialize
	if(command==="initialize"){
		Toolbox.id = params.id;
		Toolbox.tellParent = function(command,params){
			event.source.postMessage({
				from: toID,
				to: fromID,
				command: command,
				params: params
			},"*");
		};
	}

},false);



///////////////
// APPS
///////////////

var _UID = 0;
var _apps = {};
var App = function(src){

	// App registered
	var app = new EventEmitter();
	var id = _UID++;
	_apps[id] = app;
	
	// Source iframe
	var iframe = document.createElement("iframe");
	iframe.onload = function(){
		app.message( "initialize", { id:id } );
	};
	iframe.style.display = "none";
	iframe.src = src;
	document.body.appendChild(iframe);
	app.iframe = iframe;

	// App Message
	app.message = function(command,params){
		iframe.contentWindow.postMessage({
			from: Toolbox.id,
			to: id,
			command: command,
			params: params
		},"*");
		return app;
	};

	// Data I/O;
	app.open = function(data,callback){

		// Popup
		Mixin({
			
			width:"100%", height:"100%",
			display: "block",

			position:"fixed",
			top:0, left:0,

			border:0
			
		},iframe.style);

		// Input
		app.message("input",data);

		// Output
		app.once("output",function(){
			Mixin({ display:"none" },iframe.style);
			callback.apply(this,arguments);
		});

		return app;

	};

	// Return
	return app;

};

///////////////
// EXPORTS
///////////////

exports.Toolbox = Toolbox;

exports.Mixin = Mixin;

exports.EventEmitter = EventEmitter;


})(window);