//platform bootstrapper facade
if(typeof global==='undefined'){
    global=window;
}
global.Platform = global.Platform || {};
global.logFlags = global.logFlags || {};

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

if (typeof WeakMap === 'undefined') {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;

    var WeakMap = function() {
      this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
    };

    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key)
          entry[1] = value;
        else
          defineProperty(key, this.name, {value: [key, value], writable: true});
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ?
            entry[1] : undefined;
      },
      delete: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        var hasValue = entry[0] === key;
        entry[0] = entry[1] = undefined;
        return hasValue;
      },
      has: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };

    window.WeakMap = WeakMap;
  })();
}

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * PointerGestureEvent is the constructor for all PointerGesture events.
 *
 * @module PointerGestures
 * @class PointerGestureEvent
 * @extends UIEvent
 * @constructor
 * @param {String} inType Event type
 * @param {Object} [inDict] Dictionary of properties to initialize on the event
 */

function PointerGestureEvent(inType, inDict) {
  var dict = inDict || {};
  var e = document.createEvent('Event');
  var props = {
    bubbles: Boolean(dict.bubbles) === dict.bubbles || true,
    cancelable: Boolean(dict.cancelable) === dict.cancelable || true
  };

  e.initEvent(inType, props.bubbles, props.cancelable);

  var keys = Object.keys(dict), k;
  for (var i = 0; i < keys.length; i++) {
    k = keys[i];
    e[k] = dict[k];
  }

  e.preventTap = this.preventTap;

  return e;
}

/**
 * Allows for any gesture to prevent the tap gesture.
 *
 * @method preventTap
 */
PointerGestureEvent.prototype.preventTap = function() {
  this.tapPrevented = true;
};


/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  /**
   * This class contains the gesture recognizers that create the PointerGesture
   * events.
   *
   * @class PointerGestures
   * @static
   */
  scope = scope || {};
  scope.utils = {
    LCA: {
      // Determines the lowest node in the ancestor chain of a and b
      find: function(a, b) {
        if (a === b) {
          return a;
        }
        // fast case, a is a direct descendant of b or vice versa
        if (a.contains) {
          if (a.contains(b)) {
            return a;
          }
          if (b.contains(a)) {
            return b;
          }
        }
        var adepth = this.depth(a);
        var bdepth = this.depth(b);
        var d = adepth - bdepth;
        if (d > 0) {
          a = this.walk(a, d);
        } else {
          b = this.walk(b, -d);
        }
        while(a && b && a !== b) {
          a = this.walk(a, 1);
          b = this.walk(b, 1);
        }
        return a;
      },
      walk: function(n, u) {
        for (var i = 0; i < u; i++) {
          n = n.parentNode;
        }
        return n;
      },
      depth: function(n) {
        var d = 0;
        while(n) {
          d++;
          n = n.parentNode;
        }
        return d;
      }
    }
  };
  scope.findLCA = function(a, b) {
    return scope.utils.LCA.find(a, b);
  }
  window.PointerGestures = scope;
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module implements an map of pointer states
 */
(function(scope) {
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var POINTERS_FN = function(){ return this.size; };
  function PointerMap() {
    if (USE_MAP) {
      var m = new Map();
      m.pointers = POINTERS_FN;
      return m;
    } else {
      this.keys = [];
      this.values = [];
    }
  }

  PointerMap.prototype = {
    set: function(inId, inEvent) {
      var i = this.keys.indexOf(inId);
      if (i > -1) {
        this.values[i] = inEvent;
      } else {
        this.keys.push(inId);
        this.values.push(inEvent);
      }
    },
    has: function(inId) {
      return this.keys.indexOf(inId) > -1;
    },
    'delete': function(inId) {
      var i = this.keys.indexOf(inId);
      if (i > -1) {
        this.keys.splice(i, 1);
        this.values.splice(i, 1);
      }
    },
    get: function(inId) {
      var i = this.keys.indexOf(inId);
      return this.values[i];
    },
    clear: function() {
      this.keys.length = 0;
      this.values.length = 0;
    },
    // return value, key, map
    forEach: function(callback, thisArg) {
      this.values.forEach(function(v, i) {
        callback.call(thisArg, v, this.keys[i], this);
      }, this);
    },
    pointers: function() {
      return this.keys.length;
    }
  };

  scope.PointerMap = PointerMap;
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var CLONE_PROPS = [
    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    // DOM Level 3
    'buttons',
    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',
    // event instance
    'type',
    'target',
    'currentTarget',
    'screenX',
    'screenY',
    'pageX',
    'pageY',
    'tapPrevented'
  ];

  var CLONE_DEFAULTS = [
    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    // DOM Level 3
    0,
    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,
    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var dispatcher = {
    handledEvents: new WeakMap(),
    targets: new WeakMap(),
    handlers: {},
    recognizers: {},
    events: {},
    // Add a new gesture recognizer to the event listeners.
    // Recognizer needs an `events` property.
    registerRecognizer: function(inName, inRecognizer) {
      var r = inRecognizer;
      this.recognizers[inName] = r;
      r.events.forEach(function(e) {
        if (r[e]) {
          this.events[e] = true;
          var f = r[e].bind(r);
          this.addHandler(e, f);
        }
      }, this);
    },
    addHandler: function(inEvent, inFn) {
      var e = inEvent;
      if (!this.handlers[e]) {
        this.handlers[e] = [];
      }
      this.handlers[e].push(inFn);
    },
    // add event listeners for inTarget
    registerTarget: function(inTarget) {
      this.listen(Object.keys(this.events), inTarget);
    },
    // remove event listeners for inTarget
    unregisterTarget: function(inTarget) {
      this.unlisten(Object.keys(this.events), inTarget);
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      if (this.handledEvents.get(inEvent)) {
        return;
      }
      var type = inEvent.type, fns = this.handlers[type];
      if (fns) {
        this.makeQueue(fns, inEvent);
      }
      this.handledEvents.set(inEvent, true);
    },
    // queue event for async dispatch
    makeQueue: function(inHandlerFns, inEvent) {
      // must clone events to keep the (possibly shadowed) target correct for
      // async dispatching
      var e = this.cloneEvent(inEvent);
      requestAnimationFrame(this.runQueue.bind(this, inHandlerFns, e));
    },
    // Dispatch the queued events
    runQueue: function(inHandlers, inEvent) {
      this.currentPointerId = inEvent.pointerId;
      for (var i = 0, f, l = inHandlers.length; (i < l) && (f = inHandlers[i]); i++) {
        f(inEvent);
      }
      this.currentPointerId = 0;
    },
    // set up event listeners
    listen: function(inEvents, inTarget) {
      inEvents.forEach(function(e) {
        this.addEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    // remove event listeners
    unlisten: function(inEvents) {
      inEvents.forEach(function(e) {
        this.removeEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    addEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.addEventListener(inEventName, inEventHandler, inCapture);
    },
    removeEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.removeEventListener(inEventName, inEventHandler, inCapture);
    },
    // EVENT CREATION AND TRACKING
    // Creates a new Event of type `inType`, based on the information in
    // `inEvent`.
    makeEvent: function(inType, inDict) {
      return new PointerGestureEvent(inType, inDict);
    },
    /*
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @method cloneEvent
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = {}, p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];
      }
      return eventCopy;
    },
    // Dispatches the event to its target.
    dispatchEvent: function(inEvent, inTarget) {
      var t = inTarget || this.targets.get(inEvent);
      if (t) {
        t.dispatchEvent(inEvent);
        if (inEvent.tapPrevented) {
          this.preventTap(this.currentPointerId);
        }
      }
    },
    asyncDispatchEvent: function(inEvent, inTarget) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent, inTarget));
    },
    preventTap: function(inPointerId) {
      var t = this.recognizers.tap;
      if (t){
        t.preventTap(inPointerId);
      }
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  // recognizers call into the dispatcher and load later
  // solve the chicken and egg problem by having registerScopes module run last
  dispatcher.registerQueue = [];
  dispatcher.immediateRegister = false;
  scope.dispatcher = dispatcher;
  /**
   * Enable gesture events for a given scope, typically
   * [ShadowRoots](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#shadow-root-object).
   *
   * @for PointerGestures
   * @method register
   * @param {ShadowRoot} scope A top level scope to enable gesture
   * support on.
   */
  scope.register = function(inScope) {
    if (dispatcher.immediateRegister) {
      var pe = window.PointerEventsPolyfill;
      if (pe) {
        pe.register(inScope);
      }
      scope.dispatcher.registerTarget(inScope);
    } else {
      dispatcher.registerQueue.push(inScope);
    }
  };
  scope.register(document);
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event is fired when a pointer is held down for 200ms.
 *
 * @module PointerGestures
 * @submodule Events
 * @class hold
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * Screen X axis position of the held pointer
 * @type Number
 * @property clientX
 */
/**
 * Screen Y axis position of the held pointer
 * @type Number
 * @property clientY
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * This event is fired every 200ms while a pointer is held down.
 *
 * @class holdpulse
 * @extends hold
 */
/**
 * Milliseconds pointer has been held down.
 * @type Number
 * @property holdTime
 */
/**
 * This event is fired when a held pointer is released or moved.
 *
 * @class released
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var hold = {
    // wait at least HOLD_DELAY ms between hold and pulse events
    HOLD_DELAY: 200,
    // pointer can move WIGGLE_THRESHOLD pixels before not counting as a hold
    WIGGLE_THRESHOLD: 16,
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    heldPointer: null,
    holdJob: null,
    pulse: function() {
      var hold = Date.now() - this.heldPointer.timeStamp;
      var type = this.held ? 'holdpulse' : 'hold';
      this.fireHold(type, hold);
      this.held = true;
    },
    cancel: function() {
      clearInterval(this.holdJob);
      if (this.held) {
        this.fireHold('release');
      }
      this.held = false;
      this.heldPointer = null;
      this.target = null;
      this.holdJob = null;
    },
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary && !this.heldPointer) {
        this.heldPointer = inEvent;
        this.target = inEvent.target;
        this.holdJob = setInterval(this.pulse.bind(this), this.HOLD_DELAY);
      }
    },
    pointerup: function(inEvent) {
      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
        this.cancel();
      }
    },
    pointercancel: function(inEvent) {
      this.cancel();
    },
    pointermove: function(inEvent) {
      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
        var x = inEvent.clientX - this.heldPointer.clientX;
        var y = inEvent.clientY - this.heldPointer.clientY;
        if ((x * x + y * y) > this.WIGGLE_THRESHOLD) {
          this.cancel();
        }
      }
    },
    fireHold: function(inType, inHoldTime) {
      var p = {
        pointerType: this.heldPointer.pointerType,
        clientX: this.heldPointer.clientX,
        clientY: this.heldPointer.clientY,
        pointerId: this.heldPointer.pointerId
      };
      if (inHoldTime) {
        p.holdTime = inHoldTime;
      }
      var e = dispatcher.makeEvent(inType, p);
      dispatcher.dispatchEvent(e, this.target);
      if (e.tapPrevented) {
        dispatcher.preventTap(this.heldPointer.pointerId);
      }
    }
  };
  dispatcher.registerRecognizer('hold', hold);
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event denotes the beginning of a series of tracking events.
 *
 * @module PointerGestures
 * @submodule Events
 * @class trackstart
 */
/**
 * Pixels moved in the x direction since trackstart.
 * @type Number
 * @property dx
 */
/**
 * Pixes moved in the y direction since trackstart.
 * @type Number
 * @property dy
 */
/**
 * Pixels moved in the x direction since the last track.
 * @type Number
 * @property ddx
 */
/**
 * Pixles moved in the y direction since the last track.
 * @type Number
 * @property ddy
 */
/**
 * The clientX position of the track gesture.
 * @type Number
 * @property clientX
 */
/**
 * The clientY position of the track gesture.
 * @type Number
 * @property clientY
 */
/**
 * The pageX position of the track gesture.
 * @type Number
 * @property pageX
 */
/**
 * The pageY position of the track gesture.
 * @type Number
 * @property pageY
 */
/**
 * The screenX position of the track gesture.
 * @type Number
 * @property screenX
 */
/**
 * The screenY position of the track gesture.
 * @type Number
 * @property screenY
 */
/**
 * The last x axis direction of the pointer.
 * @type Number
 * @property xDirection
 */
/**
 * The last y axis direction of the pointer.
 * @type Number
 * @property yDirection
 */
/**
 * A shared object between all tracking events.
 * @type Object
 * @property trackInfo
 */
/**
 * The element currently under the pointer.
 * @type Element
 * @property relatedTarget
 */
/**
 * The type of pointer that make the track gesture.
 * @type String
 * @property pointerType
 */
/**
 *
 * This event fires for all pointer movement being tracked.
 *
 * @class track
 * @extends trackstart
 */
/**
 * This event fires when the pointer is no longer being tracked.
 *
 * @class trackend
 * @extends trackstart
 */

 (function(scope) {
   var dispatcher = scope.dispatcher;
   var pointermap = new scope.PointerMap();
   var track = {
     events: [
       'pointerdown',
       'pointermove',
       'pointerup',
       'pointercancel'
     ],
     WIGGLE_THRESHOLD: 4,
     clampDir: function(inDelta) {
       return inDelta > 0 ? 1 : -1;
     },
     calcPositionDelta: function(inA, inB) {
       var x = 0, y = 0;
       if (inA && inB) {
         x = inB.pageX - inA.pageX;
         y = inB.pageY - inA.pageY;
       }
       return {x: x, y: y};
     },
     fireTrack: function(inType, inEvent, inTrackingData) {
       var t = inTrackingData;
       var d = this.calcPositionDelta(t.downEvent, inEvent);
       var dd = this.calcPositionDelta(t.lastMoveEvent, inEvent);
       if (dd.x) {
         t.xDirection = this.clampDir(dd.x);
       }
       if (dd.y) {
         t.yDirection = this.clampDir(dd.y);
       }
       var trackData = {
         dx: d.x,
         dy: d.y,
         ddx: dd.x,
         ddy: dd.y,
         clientX: inEvent.clientX,
         clientY: inEvent.clientY,
         pageX: inEvent.pageX,
         pageY: inEvent.pageY,
         screenX: inEvent.screenX,
         screenY: inEvent.screenY,
         xDirection: t.xDirection,
         yDirection: t.yDirection,
         trackInfo: t.trackInfo,
         relatedTarget: inEvent.target,
         pointerType: inEvent.pointerType,
         pointerId: inEvent.pointerId
       };
       var e = dispatcher.makeEvent(inType, trackData);
       t.lastMoveEvent = inEvent;
       dispatcher.dispatchEvent(e, t.downTarget);
     },
     pointerdown: function(inEvent) {
       if (inEvent.isPrimary && (inEvent.pointerType === 'mouse' ? inEvent.buttons === 1 : true)) {
         var p = {
           downEvent: inEvent,
           downTarget: inEvent.target,
           trackInfo: {},
           lastMoveEvent: null,
           xDirection: 0,
           yDirection: 0,
           tracking: false
         };
         pointermap.set(inEvent.pointerId, p);
       }
     },
     pointermove: function(inEvent) {
       var p = pointermap.get(inEvent.pointerId);
       if (p) {
         if (!p.tracking) {
           var d = this.calcPositionDelta(p.downEvent, inEvent);
           var move = d.x * d.x + d.y * d.y;
           // start tracking only if finger moves more than WIGGLE_THRESHOLD
           if (move > this.WIGGLE_THRESHOLD) {
             p.tracking = true;
             this.fireTrack('trackstart', p.downEvent, p);
             this.fireTrack('track', inEvent, p);
           }
         } else {
           this.fireTrack('track', inEvent, p);
         }
       }
     },
     pointerup: function(inEvent) {
       var p = pointermap.get(inEvent.pointerId);
       if (p) {
         if (p.tracking) {
           this.fireTrack('trackend', inEvent, p);
         }
         pointermap.delete(inEvent.pointerId);
       }
     },
     pointercancel: function(inEvent) {
       this.pointerup(inEvent);
     }
   };
   dispatcher.registerRecognizer('track', track);
 })(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event denotes a rapid down/move/up sequence from a pointer.
 *
 * The event is sent to the first element the pointer went down on.
 *
 * @module PointerGestures
 * @submodule Events
 * @class flick
 */
/**
 * Signed velocity of the flick in the x direction.
 * @property xVelocity
 * @type Number
 */
/**
 * Signed velocity of the flick in the y direction.
 * @type Number
 * @property yVelocity
 */
/**
 * Unsigned total velocity of the flick.
 * @type Number
 * @property velocity
 */
/**
 * Angle of the flick in degrees, with 0 along the
 * positive x axis.
 * @type Number
 * @property angle
 */
/**
 * Axis with the greatest absolute velocity. Denoted
 * with 'x' or 'y'.
 * @type String
 * @property majorAxis
 */
/**
 * Type of the pointer that made the flick.
 * @type String
 * @property pointerType
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var flick = {
    // TODO(dfreedman): value should be low enough for low speed flicks, but
    // high enough to remove accidental flicks
    MIN_VELOCITY: 0.5 /* px/ms */,
    MAX_QUEUE: 4,
    moveQueue: [],
    target: null,
    pointerId: null,
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary && !this.pointerId) {
        this.pointerId = inEvent.pointerId;
        this.target = inEvent.target;
        this.addMove(inEvent);
      }
    },
    pointermove: function(inEvent) {
      if (inEvent.pointerId === this.pointerId) {
        this.addMove(inEvent);
      }
    },
    pointerup: function(inEvent) {
      if (inEvent.pointerId === this.pointerId) {
        this.fireFlick(inEvent);
      }
      this.cleanup();
    },
    pointercancel: function(inEvent) {
      this.cleanup();
    },
    cleanup: function() {
      this.moveQueue = [];
      this.target = null;
      this.pointerId = null;
    },
    addMove: function(inEvent) {
      if (this.moveQueue.length >= this.MAX_QUEUE) {
        this.moveQueue.shift();
      }
      this.moveQueue.push(inEvent);
    },
    fireFlick: function(inEvent) {
      var e = inEvent;
      var l = this.moveQueue.length;
      var dt, dx, dy, tx, ty, tv, x = 0, y = 0, v = 0;
      // flick based off the fastest segment of movement
      for (var i = 0, m; i < l && (m = this.moveQueue[i]); i++) {
        dt = e.timeStamp - m.timeStamp;
        dx = e.clientX - m.clientX, dy = e.clientY - m.clientY;
        tx = dx / dt, ty = dy / dt, tv = Math.sqrt(tx * tx + ty * ty);
        if (tv > v) {
          x = tx, y = ty, v = tv;
        }
      }
      var ma = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      var a = this.calcAngle(x, y);
      if (Math.abs(v) >= this.MIN_VELOCITY) {
        var ev = dispatcher.makeEvent('flick', {
          xVelocity: x,
          yVelocity: y,
          velocity: v,
          angle: a,
          majorAxis: ma,
          pointerType: inEvent.pointerType,
          pointerId: inEvent.pointerId
        });
        dispatcher.dispatchEvent(ev, this.target);
      }
    },
    calcAngle: function(inX, inY) {
      return (Math.atan2(inY, inX) * 180 / Math.PI);
    }
  };
  dispatcher.registerRecognizer('flick', flick);
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/*
 * Basic strategy: find the farthest apart points, use as diameter of circle
 * react to size change and rotation of the chord
 */

/**
 * @module PointerGestures
 * @submodule Events
 * @class pinch
 */
/**
 * Scale of the pinch zoom gesture
 * @property scale
 * @type Number
 */
/**
 * Center X position of pointers causing pinch
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing pinch
 * @property centerY
 * @type Number
 */

/**
 * @module PointerGestures
 * @submodule Events
 * @class rotate
 */
/**
 * Angle (in degrees) of rotation. Measured from starting positions of pointers.
 * @property angle
 * @type Number
 */
/**
 * Center X position of pointers causing rotation
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing rotation
 * @property centerY
 * @type Number
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = new scope.PointerMap();
  var RAD_TO_DEG = 180 / Math.PI;
  var pinch = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    reference: {},
    pointerdown: function(ev) {
      pointermap.set(ev.pointerId, ev);
      if (pointermap.pointers() == 2) {
        var points = this.calcChord();
        var angle = this.calcAngle(points);
        this.reference = {
          angle: angle,
          diameter: points.diameter,
          target: scope.findLCA(points.a.target, points.b.target)
        };
      }
    },
    pointerup: function(ev) {
      pointermap.delete(ev.pointerId);
    },
    pointermove: function(ev) {
      if (pointermap.has(ev.pointerId)) {
        pointermap.set(ev.pointerId, ev);
        if (pointermap.pointers() > 1) {
          this.calcPinchRotate();
        }
      }
    },
    pointercancel: function(ev) {
      this.pointerup(ev);
    },
    dispatchPinch: function(diameter, points) {
      var zoom = diameter / this.reference.diameter;
      var ev = dispatcher.makeEvent('pinch', {
        scale: zoom,
        centerX: points.center.x,
        centerY: points.center.y
      });
      dispatcher.dispatchEvent(ev, this.reference.target);
    },
    dispatchRotate: function(angle, points) {
      var diff = Math.round((angle - this.reference.angle) % 360);
      var ev = dispatcher.makeEvent('rotate', {
        angle: diff,
        centerX: points.center.x,
        centerY: points.center.y
      });
      dispatcher.dispatchEvent(ev, this.reference.target);
    },
    calcPinchRotate: function() {
      var points = this.calcChord();
      var diameter = points.diameter;
      var angle = this.calcAngle(points);
      if (diameter != this.reference.diameter) {
        this.dispatchPinch(diameter, points);
      }
      if (angle != this.reference.angle) {
        this.dispatchRotate(angle, points);
      }
    },
    calcChord: function() {
      var pointers = [];
      pointermap.forEach(function(p) {
        pointers.push(p);
      });
      var dist = 0;
      // start with at least two pointers
      var points = {a: pointers[0], b: pointers[1]};
      var x, y, d;
      for (var i = 0; i < pointers.length; i++) {
        var a = pointers[i];
        for (var j = i + 1; j < pointers.length; j++) {
          var b = pointers[j];
          x = Math.abs(a.clientX - b.clientX);
          y = Math.abs(a.clientY - b.clientY);
          d = x + y;
          if (d > dist) {
            dist = d;
            points = {a: a, b: b};
          }
        }
      }
      x = Math.abs(points.a.clientX + points.b.clientX) / 2;
      y = Math.abs(points.a.clientY + points.b.clientY) / 2;
      points.center = { x: x, y: y };
      points.diameter = dist;
      return points;
    },
    calcAngle: function(points) {
      var x = points.a.clientX - points.b.clientX;
      var y = points.a.clientY - points.b.clientY;
      return (360 + Math.atan2(y, x) * RAD_TO_DEG) % 360;
    },
  };
  dispatcher.registerRecognizer('pinch', pinch);
})(window.PointerGestures);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This event is fired when a pointer quickly goes down and up, and is used to
 * denote activation.
 *
 * Any gesture event can prevent the tap event from being created by calling
 * `event.preventTap`.
 *
 * Any pointer event can prevent the tap by setting the `tapPrevented` property
 * on itself.
 *
 * @module PointerGestures
 * @submodule Events
 * @class tap
 */
/**
 * X axis position of the tap.
 * @property x
 * @type Number
 */
/**
 * Y axis position of the tap.
 * @property y
 * @type Number
 */
/**
 * Type of the pointer that made the tap.
 * @property pointerType
 * @type String
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = new scope.PointerMap();
  var tap = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',
      'keyup'
    ],
    pointerdown: function(inEvent) {
      if (inEvent.isPrimary && !inEvent.tapPrevented) {
        pointermap.set(inEvent.pointerId, {
          target: inEvent.target,
          buttons: inEvent.buttons,
          x: inEvent.clientX,
          y: inEvent.clientY
        });
      }
    },
    pointermove: function(inEvent) {
      if (inEvent.isPrimary) {
        var start = pointermap.get(inEvent.pointerId);
        if (start) {
          if (inEvent.tapPrevented) {
            pointermap.delete(inEvent.pointerId);
          }
        }
      }
    },
    shouldTap: function(e, downState) {
      if (!e.tapPrevented) {
        if (e.pointerType === 'mouse') {
          // only allow left click to tap for mouse
          return downState.buttons === 1;
        } else {
          return true;
        }
      }
    },
    pointerup: function(inEvent) {
      var start = pointermap.get(inEvent.pointerId);
      if (start && this.shouldTap(inEvent, start)) {
        var t = scope.findLCA(start.target, inEvent.target);
        if (t) {
          var e = dispatcher.makeEvent('tap', {
            x: inEvent.clientX,
            y: inEvent.clientY,
            detail: inEvent.detail,
            pointerType: inEvent.pointerType,
            pointerId: inEvent.pointerId
          });
          dispatcher.dispatchEvent(e, t);
        }
      }
      pointermap.delete(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      pointermap.delete(inEvent.pointerId);
    },
    keyup: function(inEvent) {
      var code = inEvent.keyCode;
      // 32 == spacebar
      if (code === 32) {
        var t = inEvent.target;
        if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) {
          dispatcher.dispatchEvent(dispatcher.makeEvent('tap', {
            x: 0,
            y: 0,
            detail: 0,
            pointerType: 'unavailable'
          }), t);
        }
      }
    },
    preventTap: function(inPointerId) {
      pointermap.delete(inPointerId);
    }
  };
  dispatcher.registerRecognizer('tap', tap);
})(window.PointerGestures);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * Because recognizers are loaded after dispatcher, we have to wait to register
 * scopes until after all the recognizers.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  function registerScopes() {
    dispatcher.immediateRegister = true;
    var rq = dispatcher.registerQueue;
    rq.forEach(scope.register);
    rq.length = 0;
  }
  if (document.readyState === 'complete') {
    registerScopes();
  } else {
    // register scopes after a steadystate is reached
    // less MutationObserver churn
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') {
        registerScopes();
      }
    });
  }
})(window.PointerGestures);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
window.HTMLImports = window.HTMLImports || {flags:{}};
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */(function(scope) {

var hasNative = ('import' in document.createElement('link'));
var useNative = hasNative;

isIE = /Trident/.test(navigator.userAgent);

// TODO(sorvell): SD polyfill intrusion
var mainDoc = window.ShadowDOMPolyfill ? 
    ShadowDOMPolyfill.wrapIfNeeded(document) : document;

// NOTE: We cannot polyfill document.currentScript because it's not possible
// both to override and maintain the ability to capture the native value;
// therefore we choose to expose _currentScript both when native imports
// and the polyfill are in use.
var currentScriptDescriptor = {
  get: function() {
    return HTMLImports.currentScript || document.currentScript;
  },
  configurable: true
};

Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
Object.defineProperty(mainDoc, '_currentScript', currentScriptDescriptor);

// call a callback when all HTMLImports in the document at call (or at least
//  document ready) time have loaded.
// 1. ensure the document is in a ready state (has dom), then 
// 2. watch for loading of imports and call callback when done
function whenImportsReady(callback, doc) {
  doc = doc || mainDoc;
  // if document is loading, wait and try again
  whenDocumentReady(function() {
    watchImportsLoad(callback, doc);
  }, doc);
}

// call the callback when the document is in a ready state (has dom)
var requiredReadyState = isIE ? 'complete' : 'interactive';
var READY_EVENT = 'readystatechange';
function isDocumentReady(doc) {
  return (doc.readyState === 'complete' ||
      doc.readyState === requiredReadyState);
}

// call <callback> when we ensure the document is in a ready state
function whenDocumentReady(callback, doc) {
  if (!isDocumentReady(doc)) {
    var checkReady = function() {
      if (doc.readyState === 'complete' || 
          doc.readyState === requiredReadyState) {
        doc.removeEventListener(READY_EVENT, checkReady);
        whenDocumentReady(callback, doc);
      }
    }
    doc.addEventListener(READY_EVENT, checkReady);
  } else if (callback) {
    callback();
  }
}

// call <callback> when we ensure all imports have loaded
function watchImportsLoad(callback, doc) {
  var imports = doc.querySelectorAll('link[rel=import]');
  var loaded = 0, l = imports.length;
  function checkDone(d) { 
    if (loaded == l) {
      callback && callback();
    }
  }
  function loadedImport(e) {
    loaded++;
    checkDone();
  }
  if (l) {
    for (var i=0, imp; (i<l) && (imp=imports[i]); i++) {
      if (isImportLoaded(imp)) {
        loadedImport.call(imp);
      } else {
        imp.addEventListener('load', loadedImport);
        imp.addEventListener('error', loadedImport);
      }
    }
  } else {
    checkDone();
  }
}

function isImportLoaded(link) {
  return useNative ? (link.import && (link.import.readyState !== 'loading')) || link.__loaded :
      link.__importParsed;
}

// TODO(sorvell): install a mutation observer to see if HTMLImports have loaded
// this is a workaround for https://www.w3.org/Bugs/Public/show_bug.cgi?id=25007
// and should be removed when this bug is addressed.
if (useNative) {
  new MutationObserver(function(mxns) {
    for (var i=0, l=mxns.length, m; (i < l) && (m=mxns[i]); i++) {
      if (m.addedNodes) {
        handleImports(m.addedNodes);
      }
    }
  }).observe(document.head, {childList: true});

  function handleImports(nodes) {
    for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
      if (isImport(n)) {
        handleImport(n);  
      }
    }
  }

  function isImport(element) {
    return element.localName === 'link' && element.rel === 'import';
  }

  function handleImport(element) {
    var loaded = element.import;
    if (loaded) {
      markTargetLoaded({target: element});
    } else {
      element.addEventListener('load', markTargetLoaded);
      element.addEventListener('error', markTargetLoaded);
    }
  }

  function markTargetLoaded(event) {
    event.target.__loaded = true;
  }

}

// Fire the 'HTMLImportsLoaded' event when imports in document at load time 
// have loaded. This event is required to simulate the script blocking 
// behavior of native imports. A main document script that needs to be sure
// imports have loaded should wait for this event.
whenImportsReady(function() {
  HTMLImports.ready = true;
  HTMLImports.readyTime = new Date().getTime();
  mainDoc.dispatchEvent(
    new CustomEvent('HTMLImportsLoaded', {bubbles: true})
  );
});

// exports
scope.useNative = useNative;
scope.isImportLoaded = isImportLoaded;
scope.whenReady = whenImportsReady;
scope.isIE = isIE;

// deprecated
scope.whenImportsReady = whenImportsReady;

})(window.HTMLImports);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(scope) {

  // imports
  var path = scope.path;
  var xhr = scope.xhr;
  var flags = scope.flags;

  // TODO(sorvell): this loader supports a dynamic list of urls
  // and an oncomplete callback that is called when the loader is done.
  // The polyfill currently does *not* need this dynamism or the onComplete
  // concept. Because of this, the loader could be simplified quite a bit.
  var Loader = function(onLoad, onComplete) {
    this.cache = {};
    this.onload = onLoad;
    this.oncomplete = onComplete;
    this.inflight = 0;
    this.pending = {};
  };

  Loader.prototype = {
    addNodes: function(nodes) {
      // number of transactions to complete
      this.inflight += nodes.length;
      // commence transactions
      for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
        this.require(n);
      }
      // anything to do?
      this.checkDone();
    },
    addNode: function(node) {
      // number of transactions to complete
      this.inflight++;
      // commence transactions
      this.require(node);
      // anything to do?
      this.checkDone();
    },
    require: function(elt) {
      var url = elt.src || elt.href;
      // ensure we have a standard url that can be used
      // reliably for deduping.
      // TODO(sjmiles): ad-hoc
      elt.__nodeUrl = url;
      // deduplication
      if (!this.dedupe(url, elt)) {
        // fetch this resource
        this.fetch(url, elt);
      }
    },
    dedupe: function(url, elt) {
      if (this.pending[url]) {
        // add to list of nodes waiting for inUrl
        this.pending[url].push(elt);
        // don't need fetch
        return true;
      }
      var resource;
      if (this.cache[url]) {
        this.onload(url, elt, this.cache[url]);
        // finished this transaction
        this.tail();
        // don't need fetch
        return true;
      }
      // first node waiting for inUrl
      this.pending[url] = [elt];
      // need fetch (not a dupe)
      return false;
    },
    fetch: function(url, elt) {
      flags.load && console.log('fetch', url, elt);
      if (url.match(/^data:/)) {
        // Handle Data URI Scheme
        var pieces = url.split(',');
        var header = pieces[0];
        var body = pieces[1];
        if(header.indexOf(';base64') > -1) {
          body = atob(body);
        } else {
          body = decodeURIComponent(body);
        }
        setTimeout(function() {
            this.receive(url, elt, null, body);
        }.bind(this), 0);
      } else {
        var receiveXhr = function(err, resource, redirectedUrl) {
          this.receive(url, elt, err, resource, redirectedUrl);
        }.bind(this);
        xhr.load(url, receiveXhr);
        // TODO(sorvell): blocked on)
        // https://code.google.com/p/chromium/issues/detail?id=257221
        // xhr'ing for a document makes scripts in imports runnable; otherwise
        // they are not; however, it requires that we have doctype=html in
        // the import which is unacceptable. This is only needed on Chrome
        // to avoid the bug above.
        /*
        if (isDocumentLink(elt)) {
          xhr.loadDocument(url, receiveXhr);
        } else {
          xhr.load(url, receiveXhr);
        }
        */
      }
    },
    receive: function(url, elt, err, resource, redirectedUrl) {
      this.cache[url] = resource;
      var $p = this.pending[url];
      if ( redirectedUrl && redirectedUrl !== url ) {
        this.cache[redirectedUrl] = resource;
        $p = $p.concat(this.pending[redirectedUrl]);
      }
      for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
        //if (!err) {
          // If url was redirected, use the redirected location so paths are
          // calculated relative to that.
          this.onload(redirectedUrl || url, p, resource, err);
        //}
        this.tail();
      }
      this.pending[url] = null;
      if ( redirectedUrl && redirectedUrl !== url ) {
        this.pending[redirectedUrl] = null;
      }
    },
    tail: function() {
      --this.inflight;
      this.checkDone();
    },
    checkDone: function() {
      if (!this.inflight) {
        this.oncomplete();
      }
    }
  };

  xhr = xhr || {
    async: true,
    ok: function(request) {
      return (request.status >= 200 && request.status < 300)
          || (request.status === 304)
          || (request.status === 0);
    },
    load: function(url, next, nextContext) {
      var request = new XMLHttpRequest();
      if (scope.flags.debug || scope.flags.bust) {
        url += '?' + Math.random();
      }
      request.open('GET', url, xhr.async);
      request.addEventListener('readystatechange', function(e) {
        if (request.readyState === 4) {
          // Servers redirecting an import can add a Location header to help us
          // polyfill correctly.
          var locationHeader = request.getResponseHeader("Location");
          var redirectedUrl = null;
          if (locationHeader) {
            var redirectedUrl = (locationHeader.substr( 0, 1 ) === "/")
              ? location.origin + locationHeader  // Location is a relative path
              : redirectedUrl;                    // Full path
          }
          next.call(nextContext, !xhr.ok(request) && request,
              request.response || request.responseText, redirectedUrl);
        }
      });
      request.send();
      return request;
    },
    loadDocument: function(url, next, nextContext) {
      this.load(url, next, nextContext).responseType = 'document';
    }
  };

  // exports
  scope.xhr = xhr;
  scope.Loader = Loader;

})(window.HTMLImports);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(scope) {

var IMPORT_LINK_TYPE = 'import';
var flags = scope.flags;
var isIE = scope.isIE;
// TODO(sorvell): SD polyfill intrusion
var mainDoc = window.ShadowDOMPolyfill ? 
    window.ShadowDOMPolyfill.wrapIfNeeded(document) : document;

// importParser
// highlander object to manage parsing of imports
// parses import related elements
// and ensures proper parse order
// parse order is enforced by crawling the tree and monitoring which elements
// have been parsed; async parsing is also supported.

// highlander object for parsing a document tree
var importParser = {
  // parse selectors for main document elements
  documentSelectors: 'link[rel=' + IMPORT_LINK_TYPE + ']',
  // parse selectors for import document elements
  importsSelectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']',
    'link[rel=stylesheet]',
    'style',
    'script:not([type])',
    'script[type="text/javascript"]'
  ].join(','),
  map: {
    link: 'parseLink',
    script: 'parseScript',
    style: 'parseStyle'
  },
  // try to parse the next import in the tree
  parseNext: function() {
    var next = this.nextToParse();
    if (next) {
      this.parse(next);
    }
  },
  parse: function(elt) {
    if (this.isParsed(elt)) {
      flags.parse && console.log('[%s] is already parsed', elt.localName);
      return;
    }
    var fn = this[this.map[elt.localName]];
    if (fn) {
      this.markParsing(elt);
      fn.call(this, elt);
    }
  },
  // only 1 element may be parsed at a time; parsing is async so each
  // parsing implementation must inform the system that parsing is complete
  // via markParsingComplete.
  // To prompt the system to parse the next element, parseNext should then be
  // called.
  // Note, parseNext used to be included at the end of markParsingComplete, but
  // we must not do this so that, for example, we can (1) mark parsing complete 
  // then (2) fire an import load event, and then (3) parse the next resource.
  markParsing: function(elt) {
    flags.parse && console.log('parsing', elt);
    this.parsingElement = elt;
  },
  markParsingComplete: function(elt) {
    elt.__importParsed = true;
    if (elt.__importElement) {
      elt.__importElement.__importParsed = true;
    }
    this.parsingElement = null;
    flags.parse && console.log('completed', elt);
  },
  invalidateParse: function(doc) {
    if (doc && doc.__importLink) {
      doc.__importParsed = doc.__importLink.__importParsed = false;
      this.parseSoon();
    }
  },
  parseSoon: function() {
    if (this._parseSoon) {
      cancelAnimationFrame(this._parseDelay);
    }
    var parser = this;
    this._parseSoon = requestAnimationFrame(function() {
      parser.parseNext();
    });
  },
  parseImport: function(elt) {
    // TODO(sorvell): consider if there's a better way to do this;
    // expose an imports parsing hook; this is needed, for example, by the
    // CustomElements polyfill.
    if (HTMLImports.__importsParsingHook) {
      HTMLImports.__importsParsingHook(elt);
    }
    if (elt.import) {
      elt.import.__importParsed = true;
    }
    this.markParsingComplete(elt);
    // fire load event
    if (elt.__resource && !elt.__error) {
      elt.dispatchEvent(new CustomEvent('load', {bubbles: false}));    
    } else {
      elt.dispatchEvent(new CustomEvent('error', {bubbles: false}));
    }
    // TODO(sorvell): workaround for Safari addEventListener not working
    // for elements not in the main document.
    if (elt.__pending) {
      var fn;
      while (elt.__pending.length) {
        fn = elt.__pending.shift();
        if (fn) {
          fn({target: elt});
        }
      }
    }
    this.parseNext();
  },
  parseLink: function(linkElt) {
    if (nodeIsImport(linkElt)) {
      this.parseImport(linkElt);
    } else {
      // make href absolute
      linkElt.href = linkElt.href;
      this.parseGeneric(linkElt);
    }
  },
  parseStyle: function(elt) {
    // TODO(sorvell): style element load event can just not fire so clone styles
    var src = elt;
    elt = cloneStyle(elt);
    elt.__importElement = src;
    this.parseGeneric(elt);
  },
  parseGeneric: function(elt) {
    this.trackElement(elt);
    this.addElementToDocument(elt);
  },
  rootImportForElement: function(elt) {
    var n = elt;
    while (n.ownerDocument.__importLink) {
      n = n.ownerDocument.__importLink;
    }
    return n;
  },
  addElementToDocument: function(elt) {
    var port = this.rootImportForElement(elt.__importElement || elt);
    var l = port.__insertedElements = port.__insertedElements || 0;
    var refNode = port.nextElementSibling;
    for (var i=0; i < l; i++) {
      refNode = refNode && refNode.nextElementSibling;
    }
    port.parentNode.insertBefore(elt, refNode);
  },
  // tracks when a loadable element has loaded
  trackElement: function(elt, callback) {
    var self = this;
    var done = function(e) {
      if (callback) {
        callback(e);
      }
      self.markParsingComplete(elt);
      self.parseNext();
    };
    elt.addEventListener('load', done);
    elt.addEventListener('error', done);

    // NOTE: IE does not fire "load" event for styles that have already loaded
    // This is in violation of the spec, so we try our hardest to work around it
    if (isIE && elt.localName === 'style') {
      var fakeLoad = false;
      // If there's not @import in the textContent, assume it has loaded
      if (elt.textContent.indexOf('@import') == -1) {
        fakeLoad = true;
      // if we have a sheet, we have been parsed
      } else if (elt.sheet) {
        fakeLoad = true;
        var csr = elt.sheet.cssRules;
        var len = csr ? csr.length : 0;
        // search the rules for @import's
        for (var i = 0, r; (i < len) && (r = csr[i]); i++) {
          if (r.type === CSSRule.IMPORT_RULE) {
            // if every @import has resolved, fake the load
            fakeLoad = fakeLoad && Boolean(r.styleSheet);
          }
        }
      }
      // dispatch a fake load event and continue parsing
      if (fakeLoad) {
        elt.dispatchEvent(new CustomEvent('load', {bubbles: false}));
      }
    }
  },
  // NOTE: execute scripts by injecting them and watching for the load/error
  // event. Inline scripts are handled via dataURL's because browsers tend to
  // provide correct parsing errors in this case. If this has any compatibility
  // issues, we can switch to injecting the inline script with textContent.
  // Scripts with dataURL's do not appear to generate load events and therefore
  // we assume they execute synchronously.
  parseScript: function(scriptElt) {
    var script = document.createElement('script');
    script.__importElement = scriptElt;
    script.src = scriptElt.src ? scriptElt.src : 
        generateScriptDataUrl(scriptElt);
    scope.currentScript = scriptElt;
    this.trackElement(script, function(e) {
      script.parentNode.removeChild(script);
      scope.currentScript = null;  
    });
    this.addElementToDocument(script);
  },
  // determine the next element in the tree which should be parsed
  nextToParse: function() {
    return !this.parsingElement && this.nextToParseInDoc(mainDoc);
  },
  nextToParseInDoc: function(doc, link) {
    if (doc) {
      var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
      for (var i=0, l=nodes.length, p=0, n; (i<l) && (n=nodes[i]); i++) {
        if (!this.isParsed(n)) {
          if (this.hasResource(n)) {
            return nodeIsImport(n) ? this.nextToParseInDoc(n.import, n) : n;
          } else {
            return;
          }
        }
      }
    }
    // all nodes have been parsed, ready to parse import, if any
    return link;
  },
  // return the set of parse selectors relevant for this node.
  parseSelectorsForNode: function(node) {
    var doc = node.ownerDocument || node;
    return doc === mainDoc ? this.documentSelectors : this.importsSelectors;
  },
  isParsed: function(node) {
    return node.__importParsed;
  },
  hasResource: function(node) {
    if (nodeIsImport(node) && (node.import === undefined)) {
      return false;
    }
    return true;
  }
};

function nodeIsImport(elt) {
  return (elt.localName === 'link') && (elt.rel === IMPORT_LINK_TYPE);
}

function generateScriptDataUrl(script) {
  var scriptContent = generateScriptContent(script);
  var b64 = 'data:text/javascript';
  // base64 may be smaller, but does not handle unicode characters
  // attempt base64 first, fall back to escaped text
  try {
    b64 += (';base64,' + btoa(scriptContent));
  } catch(e) {
    b64 += (';charset=utf-8,' + encodeURIComponent(scriptContent));
  }
  return b64;
}

function generateScriptContent(script) {
  return script.textContent + generateSourceMapHint(script);
}

// calculate source map hint
function generateSourceMapHint(script) {
  var moniker = script.__nodeUrl;
  if (!moniker) {
    moniker = script.ownerDocument.baseURI;
    // there could be more than one script this url
    var tag = '[' + Math.floor((Math.random()+1)*1000) + ']';
    // TODO(sjmiles): Polymer hack, should be pluggable if we need to allow 
    // this sort of thing
    var matches = script.textContent.match(/Polymer\(['"]([^'"]*)/);
    tag = matches && matches[1] || tag;
    // tag the moniker
    moniker += '/' + tag + '.js';
  }
  return '\n//# sourceURL=' + moniker + '\n';
}

// style/stylesheet handling

// clone style with proper path resolution for main document
// NOTE: styles are the only elements that require direct path fixup.
function cloneStyle(style) {
  var clone = style.ownerDocument.createElement('style');
  clone.textContent = style.textContent;
  path.resolveUrlsInStyle(clone);
  return clone;
}

// path fixup: style elements in imports must be made relative to the main 
// document. We fixup url's in url() and @import.
var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;

var path = {
  resolveUrlsInStyle: function(style) {
    var doc = style.ownerDocument;
    var resolver = doc.createElement('a');
    style.textContent = this.resolveUrlsInCssText(style.textContent, resolver);
    return style;  
  },
  resolveUrlsInCssText: function(cssText, urlObj) {
    var r = this.replaceUrls(cssText, urlObj, CSS_URL_REGEXP);
    r = this.replaceUrls(r, urlObj, CSS_IMPORT_REGEXP);
    return r;
  },
  replaceUrls: function(text, urlObj, regexp) {
    return text.replace(regexp, function(m, pre, url, post) {
      var urlPath = url.replace(/["']/g, '');
      urlObj.href = urlPath;
      urlPath = urlObj.href;
      return pre + '\'' + urlPath + '\'' + post;
    });    
  }
}

// exports
scope.parser = importParser;
scope.path = path;

})(HTMLImports);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
 (function(scope) {

var useNative = scope.useNative;
var flags = scope.flags;
var IMPORT_LINK_TYPE = 'import';

// TODO(sorvell): SD polyfill intrusion
var mainDoc = window.ShadowDOMPolyfill ? 
    ShadowDOMPolyfill.wrapIfNeeded(document) : document;

if (!useNative) {

  // imports
  var xhr = scope.xhr;
  var Loader = scope.Loader;
  var parser = scope.parser;

  // importer
  // highlander object to manage loading of imports

  // for any document, importer:
  // - loads any linked import documents (with deduping)

  var importer = {
    documents: {},
    // nodes to load in the mian document
    documentPreloadSelectors: 'link[rel=' + IMPORT_LINK_TYPE + ']',
    // nodes to load in imports
    importsPreloadSelectors: [
      'link[rel=' + IMPORT_LINK_TYPE + ']'
    ].join(','),
    loadNode: function(node) {
      importLoader.addNode(node);
    },
    // load all loadable elements within the parent element
    loadSubtree: function(parent) {
      var nodes = this.marshalNodes(parent);
      // add these nodes to loader's queue
      importLoader.addNodes(nodes);
    },
    marshalNodes: function(parent) {
      // all preloadable nodes in inDocument
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));
    },
    // find the proper set of load selectors for a given node
    loadSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === mainDoc ? this.documentPreloadSelectors :
          this.importsPreloadSelectors;
    },
    loaded: function(url, elt, resource, err) {
      flags.load && console.log('loaded', url, elt);
      // store generic resource
      // TODO(sorvell): fails for nodes inside <template>.content
      // see https://code.google.com/p/chromium/issues/detail?id=249381.
      elt.__resource = resource;
      elt.__error = err;
      if (isDocumentLink(elt)) {
        var doc = this.documents[url];
        // if we've never seen a document at this url
        if (doc === undefined) {
          // generate an HTMLDocument from data
          doc = err ? null : makeDocument(resource, url);
          if (doc) {
            doc.__importLink = elt;
            // note, we cannot use MO to detect parsed nodes because
            // SD polyfill does not report these as mutations.
            this.bootDocument(doc);
          }
          // cache document
          this.documents[url] = doc;
        }
        // don't store import record until we're actually loaded
        // store document resource
        elt.import = doc;
      }
      parser.parseNext();
    },
    bootDocument: function(doc) {
      this.loadSubtree(doc);
      this.observe(doc);
      parser.parseNext();
    },
    loadedAll: function() {
      parser.parseNext();
    }
  };

  // loader singleton
  var importLoader = new Loader(importer.loaded.bind(importer), 
      importer.loadedAll.bind(importer));

  function isDocumentLink(elt) {
    return isLinkRel(elt, IMPORT_LINK_TYPE);
  }

  function isLinkRel(elt, rel) {
    return elt.localName === 'link' && elt.getAttribute('rel') === rel;
  }

  function isScript(elt) {
    return elt.localName === 'script';
  }

  function makeDocument(resource, url) {
    // create a new HTML document
    var doc = resource;
    if (!(doc instanceof Document)) {
      doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
    }
    // cache the new document's source url
    doc._URL = url;
    // establish a relative path via <base>
    var base = doc.createElement('base');
    base.setAttribute('href', url);
    // add baseURI support to browsers (IE) that lack it.
    if (!doc.baseURI) {
      doc.baseURI = url;
    }
    // ensure UTF-8 charset
    var meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');

    doc.head.appendChild(meta);
    doc.head.appendChild(base);
    // install HTML last as it may trigger CustomElement upgrades
    // TODO(sjmiles): problem wrt to template boostrapping below,
    // template bootstrapping must (?) come before element upgrade
    // but we cannot bootstrap templates until they are in a document
    // which is too late
    if (!(resource instanceof Document)) {
      // install html
      doc.body.innerHTML = resource;
    }
    // TODO(sorvell): ideally this code is not aware of Template polyfill,
    // but for now the polyfill needs help to bootstrap these templates
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(doc);
    }
    return doc;
  }

  // Polyfill document.baseURI for browsers without it.
  if (!document.baseURI) {
    var baseURIDescriptor = {
      get: function() {
        return window.location.href;
      },
      configurable: true
    };

    Object.defineProperty(document, 'baseURI', baseURIDescriptor);
    Object.defineProperty(mainDoc, 'baseURI', baseURIDescriptor);
  }

  // IE shim for CustomEvent
  if (typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function(inType, dictionary) {
       var e = document.createEvent('HTMLEvents');
       e.initEvent(inType,
          dictionary.bubbles === false ? false : true,
          dictionary.cancelable === false ? false : true,
          dictionary.detail);
       return e;
    };
  }

} else {
  // do nothing if using native imports
  var importer = {};
}

// exports
scope.importer = importer;
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
scope.importLoader = importLoader;


})(window.HTMLImports);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(scope){

var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
var importSelector = 'link[rel=' + IMPORT_LINK_TYPE + ']';
var importer = scope.importer;
var parser = scope.parser;

// we track mutations for addedNodes, looking for imports
function handler(mutations) {
  for (var i=0, l=mutations.length, m; (i<l) && (m=mutations[i]); i++) {
    if (m.type === 'childList' && m.addedNodes.length) {
      addedNodes(m.addedNodes);
    }
  }
}

// find loadable elements and add them to the importer
function addedNodes(nodes) {
  var owner;
  for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
    owner = owner || n.ownerDocument;
    if (shouldLoadNode(n)) {
      importer.loadNode(n);
    }
    if (n.children && n.children.length) {
      addedNodes(n.children);
    }
  }
  // TODO(sorvell): This is not the right approach here. We shouldn't need to
  // invalidate parsing when an element is added. Disabling this code 
  // until a better approach is found.
  /*
  if (owner) {
    parser.invalidateParse(owner);
  }
  */
}

function shouldLoadNode(node) {
  return (node.nodeType === 1) && matches.call(node,
      importer.loadSelectorsForNode(node));
}

// x-plat matches
var matches = HTMLElement.prototype.matches || 
    HTMLElement.prototype.matchesSelector || 
    HTMLElement.prototype.webkitMatchesSelector ||
    HTMLElement.prototype.mozMatchesSelector ||
    HTMLElement.prototype.msMatchesSelector;

var observer = new MutationObserver(handler);

// observe the given root for loadable elements
function observe(root) {
  observer.observe(root, {childList: true, subtree: true});
}

// exports
// TODO(sorvell): factor so can put on scope
scope.observe = observe;
importer.observe = observe;

})(HTMLImports);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(){

// bootstrap

// TODO(sorvell): SD polyfill intrusion
var doc = window.ShadowDOMPolyfill ? 
    window.ShadowDOMPolyfill.wrapIfNeeded(document) : document;

// no need to bootstrap the polyfill when native imports is available.
if (!HTMLImports.useNative) {
  function bootstrap() {
    HTMLImports.importer.bootDocument(doc);
  }
    
  // TODO(sorvell): SD polyfill does *not* generate mutations for nodes added
  // by the parser. For this reason, we must wait until the dom exists to 
  // bootstrap.
  if (document.readyState === 'complete' ||
      (document.readyState === 'interactive' && !window.attachEvent)) {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
}

})();

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
window.CustomElements = window.CustomElements || {flags:{}};
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope){

var logFlags = window.logFlags || {};
var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : 'none';

// walk the subtree rooted at node, applying 'find(element, data)' function
// to each element
// if 'find' returns true for 'element', do not search element's subtree
function findAll(node, find, data) {
  var e = node.firstElementChild;
  if (!e) {
    e = node.firstChild;
    while (e && e.nodeType !== Node.ELEMENT_NODE) {
      e = e.nextSibling;
    }
  }
  while (e) {
    if (find(e, data) !== true) {
      findAll(e, find, data);
    }
    e = e.nextElementSibling;
  }
  return null;
}

// walk all shadowRoots on a given node.
function forRoots(node, cb) {
  var root = node.shadowRoot;
  while(root) {
    forSubtree(root, cb);
    root = root.olderShadowRoot;
  }
}

// walk the subtree rooted at node, including descent into shadow-roots,
// applying 'cb' to each element
function forSubtree(node, cb) {
  //logFlags.dom && node.childNodes && node.childNodes.length && console.group('subTree: ', node);
  findAll(node, function(e) {
    if (cb(e)) {
      return true;
    }
    forRoots(e, cb);
  });
  forRoots(node, cb);
  //logFlags.dom && node.childNodes && node.childNodes.length && console.groupEnd();
}

// manage lifecycle on added node
function added(node) {
  if (upgrade(node)) {
    insertedNode(node);
    return true;
  }
  inserted(node);
}

// manage lifecycle on added node's subtree only
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

// manage lifecycle on added node and it's subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

// upgrade custom elements at node, if applicable
function upgrade(node) {
  if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
    var type = node.getAttribute('is') || node.localName;
    var definition = scope.registry[type];
    if (definition) {
      logFlags.dom && console.group('upgrade:', node.localName);
      scope.upgrade(node);
      logFlags.dom && console.groupEnd();
      return true;
    }
  }
}

function insertedNode(node) {
  inserted(node);
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      inserted(e);
    });
  }
}

// TODO(sorvell): on platforms without MutationObserver, mutations may not be
// reliable and therefore attached/detached are not reliable.
// To make these callbacks less likely to fail, we defer all inserts and removes
// to give a chance for elements to be inserted into dom.
// This ensures attachedCallback fires for elements that are created and
// immediately added to dom.
var hasPolyfillMutations = (!window.MutationObserver ||
    (window.MutationObserver === window.JsMutationObserver));
scope.hasPolyfillMutations = hasPolyfillMutations;

var isPendingMutations = false;
var pendingMutations = [];
function deferMutation(fn) {
  pendingMutations.push(fn);
  if (!isPendingMutations) {
    isPendingMutations = true;
    var async = (window.Platform && window.Platform.endOfMicrotask) ||
        setTimeout;
    async(takeMutations);
  }
}

function takeMutations() {
  isPendingMutations = false;
  var $p = pendingMutations;
  for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
    p();
  }
  pendingMutations = [];
}

function inserted(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _inserted(element);
    });
  } else {
    _inserted(element);
  }
}

// TODO(sjmiles): if there are descents into trees that can never have inDocument(*) true, fix this
function _inserted(element) {
  // TODO(sjmiles): it's possible we were inserted and removed in the space
  // of one microtask, in which case we won't be 'inDocument' here
  // But there are other cases where we are testing for inserted without
  // specific knowledge of mutations, and must test 'inDocument' to determine
  // whether to call inserted
  // If we can factor these cases into separate code paths we can have
  // better diagnostics.
  // TODO(sjmiles): when logging, do work on all custom elements so we can
  // track behavior even when callbacks not defined
  //console.log('inserted: ', element.localName);
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('inserted:', element.localName);
    if (inDocument(element)) {
      element.__inserted = (element.__inserted || 0) + 1;
      // if we are in a 'removed' state, bluntly adjust to an 'inserted' state
      if (element.__inserted < 1) {
        element.__inserted = 1;
      }
      // if we are 'over inserted', squelch the callback
      if (element.__inserted > 1) {
        logFlags.dom && console.warn('inserted:', element.localName,
          'insert/remove count:', element.__inserted)
      } else if (element.attachedCallback) {
        logFlags.dom && console.log('inserted:', element.localName);
        element.attachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

function removedNode(node) {
  removed(node);
  forSubtree(node, function(e) {
    removed(e);
  });
}

function removed(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _removed(element);
    });
  } else {
    _removed(element);
  }
}

function _removed(element) {
  // TODO(sjmiles): temporary: do work on all custom elements so we can track
  // behavior even when callbacks not defined
  if (element.attachedCallback || element.detachedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('removed:', element.localName);
    if (!inDocument(element)) {
      element.__inserted = (element.__inserted || 0) - 1;
      // if we are in a 'inserted' state, bluntly adjust to an 'removed' state
      if (element.__inserted > 0) {
        element.__inserted = 0;
      }
      // if we are 'over removed', squelch the callback
      if (element.__inserted < 0) {
        logFlags.dom && console.warn('removed:', element.localName,
            'insert/remove count:', element.__inserted)
      } else if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

// SD polyfill intrustion due mainly to the fact that 'document'
// is not entirely wrapped
function wrapIfNeeded(node) {
  return window.ShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node)
      : node;
}

function inDocument(element) {
  var p = element;
  var doc = wrapIfNeeded(document);
  while (p) {
    if (p == doc) {
      return true;
    }
    p = p.parentNode || p.host;
  }
}

function watchShadow(node) {
  if (node.shadowRoot && !node.shadowRoot.__watched) {
    logFlags.dom && console.log('watching shadow-root for: ', node.localName);
    // watch all unwatched roots...
    var root = node.shadowRoot;
    while (root) {
      watchRoot(root);
      root = root.olderShadowRoot;
    }
  }
}

function watchRoot(root) {
  if (!root.__watched) {
    observe(root);
    root.__watched = true;
  }
}

function handler(mutations) {
  //
  if (logFlags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  //
  mutations.forEach(function(mx) {
    //logFlags.dom && console.group('mutation');
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        // nodes added may need lifecycle management
        addedNode(n);
      });
      // removed nodes may need lifecycle management
      forEach(mx.removedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (!n.localName) {
          return;
        }
        removedNode(n);
      });
    }
    //logFlags.dom && console.groupEnd();
  });
  logFlags.dom && console.groupEnd();
};

var observer = new MutationObserver(handler);

function takeRecords() {
  // TODO(sjmiles): ask Raf why we have to call handler ourselves
  handler(observer.takeRecords());
  takeMutations();
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function observe(inRoot) {
  observer.observe(inRoot, {childList: true, subtree: true});
}

function observeDocument(doc) {
  observe(doc);
}

function upgradeDocument(doc) {
  logFlags.dom && console.group('upgradeDocument: ', (doc.baseURI).split('/').pop());
  addedNode(doc);
  logFlags.dom && console.groupEnd();
}

function upgradeDocumentTree(doc) {
  doc = wrapIfNeeded(doc);
  //console.log('upgradeDocumentTree: ', (doc.baseURI).split('/').pop());
  // upgrade contained imported documents
  var imports = doc.querySelectorAll('link[rel=' + IMPORT_LINK_TYPE + ']');
  for (var i=0, l=imports.length, n; (i<l) && (n=imports[i]); i++) {
    if (n.import && n.import.__parsed) {
      upgradeDocumentTree(n.import);
    }
  }
  upgradeDocument(doc);
}

// exports
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
scope.watchShadow = watchShadow;
scope.upgradeDocumentTree = upgradeDocumentTree;
scope.upgradeAll = addedNode;
scope.upgradeSubtree = addedSubtree;
scope.insertedNode = insertedNode;

scope.observeDocument = observeDocument;
scope.upgradeDocument = upgradeDocument;

scope.takeRecords = takeRecords;

})(window.CustomElements);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Implements `document.registerElement`
 * @module CustomElements
*/

/**
 * Polyfilled extensions to the `document` object.
 * @class Document
*/

(function(scope) {

// imports

if (!scope) {
  scope = window.CustomElements = {flags:{}};
}
var flags = scope.flags;

// native document.registerElement?

var hasNative = Boolean(document.registerElement);
// For consistent timing, use native custom elements only when not polyfilling
// other key related web components features.
var useNative = !flags.register && hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || HTMLImports.useNative);

if (useNative) {

  // stub
  var nop = function() {};

  // exports
  scope.registry = {};
  scope.upgradeElement = nop;

  scope.watchShadow = nop;
  scope.upgrade = nop;
  scope.upgradeAll = nop;
  scope.upgradeSubtree = nop;
  scope.observeDocument = nop;
  scope.upgradeDocument = nop;
  scope.upgradeDocumentTree = nop;
  scope.takeRecords = nop;
  scope.reservedTagList = [];

} else {

  /**
   * Registers a custom tag name with the document.
   *
   * When a registered element is created, a `readyCallback` method is called
   * in the scope of the element. The `readyCallback` method can be specified on
   * either `options.prototype` or `options.lifecycle` with the latter taking
   * precedence.
   *
   * @method register
   * @param {String} name The tag name to register. Must include a dash ('-'),
   *    for example 'x-component'.
   * @param {Object} options
   *    @param {String} [options.extends]
   *      (_off spec_) Tag name of an element to extend (or blank for a new
   *      element). This parameter is not part of the specification, but instead
   *      is a hint for the polyfill because the extendee is difficult to infer.
   *      Remember that the input prototype must chain to the extended element's
   *      prototype (or HTMLElement.prototype) regardless of the value of
   *      `extends`.
   *    @param {Object} options.prototype The prototype to use for the new
   *      element. The prototype must inherit from HTMLElement.
   *    @param {Object} [options.lifecycle]
   *      Callbacks that fire at important phases in the life of the custom
   *      element.
   *
   * @example
   *      FancyButton = document.registerElement("fancy-button", {
   *        extends: 'button',
   *        prototype: Object.create(HTMLButtonElement.prototype, {
   *          readyCallback: {
   *            value: function() {
   *              console.log("a fancy-button was created",
   *            }
   *          }
   *        })
   *      });
   * @return {Function} Constructor for the newly registered type.
   */
  function register(name, options) {
    //console.warn('document.registerElement("' + name + '", ', options, ')');
    // construct a defintion out of options
    // TODO(sjmiles): probably should clone options instead of mutating it
    var definition = options || {};
    if (!name) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument `name` must not be empty');
    }
    if (name.indexOf('-') < 0) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('document.registerElement: first argument (\'name\') must contain a dash (\'-\'). Argument provided was \'' + String(name) + '\'.');
    }
    // prevent registering reserved names
    if (isReservedTag(name)) {
      throw new Error('Failed to execute \'registerElement\' on \'Document\': Registration failed for type \'' + String(name) + '\'. The type name is invalid.');
    }
    // elements may only be registered once
    if (getRegisteredDefinition(name)) {
      throw new Error('DuplicateDefinitionError: a type with name \'' + String(name) + '\' is already registered');
    }
    // must have a prototype, default to an extension of HTMLElement
    // TODO(sjmiles): probably should throw if no prototype, check spec
    if (!definition.prototype) {
      // TODO(sjmiles): replace with more appropriate error (EricB can probably
      // offer guidance)
      throw new Error('Options missing required prototype property');
    }
    // record name
    definition.__name = name.toLowerCase();
    // ensure a lifecycle object so we don't have to null test it
    definition.lifecycle = definition.lifecycle || {};
    // build a list of ancestral custom elements (for native base detection)
    // TODO(sjmiles): we used to need to store this, but current code only
    // uses it in 'resolveTagName': it should probably be inlined
    definition.ancestry = ancestry(definition.extends);
    // extensions of native specializations of HTMLElement require localName
    // to remain native, and use secondary 'is' specifier for extension type
    resolveTagName(definition);
    // some platforms require modifications to the user-supplied prototype
    // chain
    resolvePrototypeChain(definition);
    // overrides to implement attributeChanged callback
    overrideAttributeApi(definition.prototype);
    // 7.1.5: Register the DEFINITION with DOCUMENT
    registerDefinition(definition.__name, definition);
    // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
    // 7.1.8. Return the output of the previous step.
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    // force our .constructor to be our actual constructor
    definition.prototype.constructor = definition.ctor;
    // if initial parsing is complete
    if (scope.ready) {
      // upgrade any pre-existing nodes of this type
      scope.upgradeDocumentTree(document);
    }
    return definition.ctor;
  }

  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }

  var reservedTagList = [
    'annotation-xml', 'color-profile', 'font-face', 'font-face-src',
    'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'
  ];

  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([extendee]);
    }
    return [];
  }

  function resolveTagName(definition) {
    // if we are explicitly extending something, that thing is our
    // baseTag, unless it represents a custom component
    var baseTag = definition.extends;
    // if our ancestry includes custom components, we only have a
    // baseTag if one of them does
    for (var i=0, a; (a=definition.ancestry[i]); i++) {
      baseTag = a.is && a.tag;
    }
    // our tag is our baseTag, if it exists, and otherwise just our name
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      // if there is a base tag, use secondary 'is' specifier
      definition.is = definition.__name;
    }
  }

  function resolvePrototypeChain(definition) {
    // if we don't support __proto__ we need to locate the native level
    // prototype for precise mixing in
    if (!Object.__proto__) {
      // default prototype
      var nativePrototype = HTMLElement.prototype;
      // work out prototype when using type-extension
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        var expectedPrototype = Object.getPrototypeOf(inst);
        // only set nativePrototype if it will actually appear in the definition's chain
        if (expectedPrototype === definition.prototype) {
          nativePrototype = expectedPrototype;
        }
      }
      // ensure __proto__ reference is installed at each point on the prototype
      // chain.
      // NOTE: On platforms without __proto__, a mixin strategy is used instead
      // of prototype swizzling. In this case, this generated __proto__ provides
      // limited support for prototype traversal.
      var proto = definition.prototype, ancestor;
      while (proto && (proto !== nativePrototype)) {
        ancestor = Object.getPrototypeOf(proto);
        proto.__proto__ = ancestor;
        proto = ancestor;
      }
      // cache this in case of mixin
      definition.native = nativePrototype;
    }
  }

  // SECTION 4

  function instantiate(definition) {
    // 4.a.1. Create a new object that implements PROTOTYPE
    // 4.a.2. Let ELEMENT by this new object
    //
    // the custom element instantiation algorithm must also ensure that the
    // output is a valid DOM element with the proper wrapper in place.
    //
    return upgrade(domCreateElement(definition.tag), definition);
  }

  function upgrade(element, definition) {
    // some definitions specify an 'is' attribute
    if (definition.is) {
      element.setAttribute('is', definition.is);
    }
    // make 'element' implement definition.prototype
    implement(element, definition);
    // flag as upgraded
    element.__upgraded__ = true;
    // lifecycle management
    created(element);
    // attachedCallback fires in tree order, call before recursing
    scope.insertedNode(element);
    // there should never be a shadow root on element at this point
    scope.upgradeSubtree(element);
    // OUTPUT
    return element;
  }

  function implement(element, definition) {
    // prototype swizzling is best
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      // where above we can re-acquire inPrototype via
      // getPrototypeOf(Element), we cannot do so when
      // we use mixin, so we install a magic reference
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }

  function customMixin(inTarget, inSrc, inNative) {
    // TODO(sjmiles): 'used' allows us to only copy the 'youngest' version of
    // any property. This set should be precalculated. We also need to
    // consider this for supporting 'super'.
    var used = {};
    // start with inSrc
    var p = inSrc;
    // The default is HTMLElement.prototype, so we add a test to avoid mixing in
    // native prototypes
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i=0, k; k=keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k,
              Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }

  function created(element) {
    // invoke createdCallback
    if (element.createdCallback) {
      element.createdCallback();
    }
  }

  // attribute watching

  function overrideAttributeApi(prototype) {
    // overrides to implement callbacks
    // TODO(sjmiles): should support access via .attributes NamedNodeMap
    // TODO(sjmiles): preserves user defined overrides, if any
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    }
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    }
    prototype.setAttribute._polyfilled = true;
  }

  // https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/
  // index.html#dfn-attribute-changed-callback
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback
        && (newValue !== oldValue)) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  // element registry (maps tag names to definitions)

  var registry = {};

  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }

  function registerDefinition(name, definition) {
    registry[name] = definition;
  }

  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }

  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  function createElementNS(namespace, tag, typeExtension) {
    // NOTE: we do not support non-HTML elements,
    // just call createElementNS for non HTML Elements
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }

  function createElement(tag, typeExtension) {
    // TODO(sjmiles): ignore 'tag' when using 'typeExtension', we could
    // error check it, or perhaps there should only ever be one argument
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      // Handle empty string for type extension.
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }

    if (typeExtension) {
      var element = createElement(tag);
      element.setAttribute('is', typeExtension);
      return element;
    }
    var element = domCreateElement(tag);
    // Custom tags should be HTMLElements even if not upgraded.
    if (tag.indexOf('-') >= 0) {
      implement(element, HTMLElement);
    }
    return element;
  }

  function upgradeElement(element) {
    if (!element.__upgraded__ && (element.nodeType === Node.ELEMENT_NODE)) {
      var is = element.getAttribute('is');
      var definition = getRegisteredDefinition(is || element.localName);
      if (definition) {
        if (is && definition.tag == element.localName) {
          return upgrade(element, definition);
        } else if (!is && !definition.extends) {
          return upgrade(element, definition);
        }
      }
    }
  }

  function cloneNode(deep) {
    // call original clone
    var n = domCloneNode.call(this, deep);
    // upgrade the element and subtree
    scope.upgradeAll(n);
    // return the clone
    return n;
  }
  // capture native createElement before we override it

  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);

  // capture native cloneNode before we override it

  var domCloneNode = Node.prototype.cloneNode;

  // exports

  document.registerElement = register;
  document.createElement = createElement; // override
  document.createElementNS = createElementNS; // override
  Node.prototype.cloneNode = cloneNode; // override

  scope.registry = registry;

  /**
   * Upgrade an element to a custom element. Upgrading an element
   * causes the custom prototype to be applied, an `is` attribute
   * to be attached (as needed), and invocation of the `readyCallback`.
   * `upgrade` does nothing if the element is already upgraded, or
   * if it matches no registered custom tag name.
   *
   * @method ugprade
   * @param {Element} element The element to upgrade.
   * @return {Element} The upgraded element.
   */
  scope.upgrade = upgradeElement;
}

// Create a custom 'instanceof'. This is necessary when CustomElements
// are implemented via a mixin strategy, as for example on IE10.
var isInstance;
if (!Object.__proto__ && !useNative) {
  isInstance = function(obj, ctor) {
    var p = obj;
    while (p) {
      // NOTE: this is not technically correct since we're not checking if
      // an object is an instance of a constructor; however, this should
      // be good enough for the mixin strategy.
      if (p === ctor.prototype) {
        return true;
      }
      p = p.__proto__;
    }
    return false;
  }
} else {
  isInstance = function(obj, base) {
    return obj instanceof base;
  }
}

// exports
scope.instanceof = isInstance;
scope.reservedTagList = reservedTagList;

// bc
document.register = document.registerElement;

scope.hasNative = hasNative;
scope.useNative = useNative;

})(window.CustomElements);

/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {

// import

var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;

// highlander object for parsing a document tree

var parser = {
  selectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']'
  ],
  map: {
    link: 'parseLink'
  },
  parse: function(inDocument) {
    if (!inDocument.__parsed) {
      // only parse once
      inDocument.__parsed = true;
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(parser.selectors);
      // for each parsable node type, call the mapped parsing method
      forEach(elts, function(e) {
        parser[parser.map[e.localName]](e);
      });
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by observer
      CustomElements.upgradeDocument(inDocument);
      // observe document for dom changes
      CustomElements.observeDocument(inDocument);
    }
  },
  parseLink: function(linkElt) {
    // imports
    if (isDocumentLink(linkElt)) {
      this.parseImport(linkElt);
    }
  },
  parseImport: function(linkElt) {
    if (linkElt.import) {
      parser.parse(linkElt.import);
    }
  }
};

function isDocumentLink(inElt) {
  return (inElt.localName === 'link'
      && inElt.getAttribute('rel') === IMPORT_LINK_TYPE);
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// exports

scope.parser = parser;
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;

})(window.CustomElements);
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(scope){

// bootstrap parsing
function bootstrap() {
  // parse document
  CustomElements.parser.parse(document);
  // one more pass before register is 'live'
  CustomElements.upgradeDocument(document);
  // set internal 'ready' flag, now document.registerElement will trigger 
  // synchronous upgrades
  CustomElements.ready = true;
  // async to ensure *native* custom elements upgrade prior to this
  // DOMContentLoaded can fire before elements upgrade (e.g. when there's
  // an external script)
  setTimeout(function() {
    // capture blunt profiling data
    CustomElements.readyTime = Date.now();
    if (window.HTMLImports) {
      CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
    }
    // notify the system that we are bootstrapped
    document.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );

    // install upgrade hook if HTMLImports are available
    if (window.HTMLImports) {
      HTMLImports.__importsParsingHook = function(elt) {
        CustomElements.parser.parse(elt.import);
      }
    }
  });
}

// CustomEvent shim for IE
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType, params) {
    params = params || {};
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
    return e;
  };
  window.CustomEvent.prototype = window.Event.prototype;
}

// When loading at readyState complete time (or via flag), boot custom elements
// immediately.
// If relevant, HTMLImports must already be loaded.
if (document.readyState === 'complete' || scope.flags.eager) {
  bootstrap();
// When loading at readyState interactive time, bootstrap only if HTMLImports
// are not pending. Also avoid IE as the semantics of this state are unreliable.
} else if (document.readyState === 'interactive' && !window.attachEvent &&
    (!window.HTMLImports || window.HTMLImports.ready)) {
  bootstrap();
// When loading at other readyStates, wait for the appropriate DOM event to 
// bootstrap.
} else {
  var loadEvent = window.HTMLImports && !HTMLImports.ready ?
      'HTMLImportsLoaded' : 'DOMContentLoaded';
  window.addEventListener(loadEvent, bootstrap);
}

})(window.CustomElements);

// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(global) {
  'use strict';

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0;
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = global.Number.isNaN || function(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

  function getPathCharType(char) {
    if (char === undefined)
      return 'eof';

    var code = char.charCodeAt(0);

    switch(code) {
      case 0x5B: // [
      case 0x5D: // ]
      case 0x2E: // .
      case 0x22: // "
      case 0x27: // '
      case 0x30: // 0
        return char;

      case 0x5F: // _
      case 0x24: // $
        return 'ident';

      case 0x20: // Space
      case 0x09: // Tab
      case 0x0A: // Newline
      case 0x0D: // Return
      case 0xA0:  // No-break space
      case 0xFEFF:  // Byte Order Mark
      case 0x2028:  // Line Separator
      case 0x2029:  // Paragraph Separator
        return 'ws';
    }

    // a-z, A-Z
    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
      return 'ident';

    // 1-9
    if (0x31 <= code && code <= 0x39)
      return 'number';

    return 'else';
  }

  var pathStateMachine = {
    'beforePath': {
      'ws': ['beforePath'],
      'ident': ['inIdent', 'append'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'inPath': {
      'ws': ['inPath'],
      '.': ['beforeIdent'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'beforeIdent': {
      'ws': ['beforeIdent'],
      'ident': ['inIdent', 'append']
    },

    'inIdent': {
      'ident': ['inIdent', 'append'],
      '0': ['inIdent', 'append'],
      'number': ['inIdent', 'append'],
      'ws': ['inPath', 'push'],
      '.': ['beforeIdent', 'push'],
      '[': ['beforeElement', 'push'],
      'eof': ['afterPath', 'push']
    },

    'beforeElement': {
      'ws': ['beforeElement'],
      '0': ['afterZero', 'append'],
      'number': ['inIndex', 'append'],
      "'": ['inSingleQuote', 'append', ''],
      '"': ['inDoubleQuote', 'append', '']
    },

    'afterZero': {
      'ws': ['afterElement', 'push'],
      ']': ['inPath', 'push']
    },

    'inIndex': {
      '0': ['inIndex', 'append'],
      'number': ['inIndex', 'append'],
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    },

    'inSingleQuote': {
      "'": ['afterElement'],
      'eof': ['error'],
      'else': ['inSingleQuote', 'append']
    },

    'inDoubleQuote': {
      '"': ['afterElement'],
      'eof': ['error'],
      'else': ['inDoubleQuote', 'append']
    },

    'afterElement': {
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    }
  }

  function noop() {}

  function parsePath(path) {
    var keys = [];
    var index = -1;
    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

    var actions = {
      push: function() {
        if (key === undefined)
          return;

        keys.push(key);
        key = undefined;
      },

      append: function() {
        if (key === undefined)
          key = newChar
        else
          key += newChar;
      }
    };

    function maybeUnescapeQuote() {
      if (index >= path.length)
        return;

      var nextChar = path[index + 1];
      if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
        index++;
        newChar = nextChar;
        actions.append();
        return true;
      }
    }

    while (mode) {
      index++;
      c = path[index];

      if (c == '\\' && maybeUnescapeQuote(mode))
        continue;

      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap['else'] || 'error';

      if (transition == 'error')
        return; // parse error;

      mode = transition[0];
      action = actions[transition[1]] || noop;
      newChar = transition[2] === undefined ? c : transition[2];
      action();

      if (mode === 'afterPath') {
        return keys;
      }
    }

    return; // parse error
  }

  function isIdent(s) {
    return identRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(parts, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    for (var i = 0; i < parts.length; i++) {
      this.push(String(parts[i]));
    }

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null || pathString.length == 0)
      pathString = '';

    if (typeof pathString != 'string') {
      if (isIndex(pathString.length)) {
        // Constructed with array-like (pre-parsed) keys
        return new Path(pathString, constructorIsPrivate);
      }

      pathString = String(pathString);
    }

    var path = pathCache[pathString];
    if (path)
      return path;

    var parts = parsePath(pathString);
    if (!parts)
      return invalidPath;

    var path = new Path(parts, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  function formatAccessor(key) {
    if (isIndex(key)) {
      return '[' + key + ']';
    } else {
      return '["' + key.replace(/"/g, '\\"') + '"]';
    }
  }

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      var pathString = '';
      for (var i = 0; i < this.length; i++) {
        var key = this[i];
        if (isIdent(key)) {
          pathString += i ? '.' + key : key;
        } else {
          pathString += formatAccessor(key);
        }
      }

      return pathString;
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[0]);
      }
    },

    compiledGetValueFromFn: function() {
      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      var key;
      for (; i < (this.length - 1); i++) {
        key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      var key = this[i];
      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (global.testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    var eomObj = { pingPong: true };
    var eomRunScheduled = false;

    Object.observe(eomObj, function() {
      runEOMTasks();
      eomRunScheduled = false;
    });

    return function(fn) {
      eomTasks.push(fn);
      if (!eomRunScheduled) {
        eomRunScheduled = true;
        eomObj.pingPong = !eomObj.pingPong;
      }
    };
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      object: undefined,
      objects: objects,
      open: function(obs, object) {
        if (!rootObj) {
          rootObj = object;
          rootObjProps = {};
        }

        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
      }
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.object !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.object = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  var hasDebugForceFullDelivery = hasObserve && hasEval && (function() {
    try {
      eval('%RunMicrotasks()');
      return true;
    } catch (ex) {
      return false;
    }
  })();

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (hasDebugForceFullDelivery) {
      eval('%RunMicrotasks()');
      return;
    }

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (global.testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    get path() {
      return this.path_;
    },

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue, this]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it's dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

  global.Observer = Observer;
  global.Observer.runEOM_ = runEOM;
  global.Observer.observerSentinel_ = observerSentinel; // for testing.
  global.Observer.hasObjectObserve = hasObserve;
  global.ArrayObserver = ArrayObserver;
  global.ArrayObserver.calculateSplices = function(current, previous) {
    return arraySplice.calculateSplices(current, previous);
  };

  global.ArraySplice = ArraySplice;
  global.ObjectObserver = ObjectObserver;
  global.PathObserver = PathObserver;
  global.CompoundObserver = CompoundObserver;
  global.Path = Path;
  global.ObserverTransform = ObserverTransform;
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

// Copyright 2012 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

window.ShadowDOMPolyfill = {};

(function(scope) {
  'use strict';

  var constructorTable = new WeakMap();
  var nativePrototypeTable = new WeakMap();
  var wrappers = Object.create(null);

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  };

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  function mixin(to, from) {
    var names = getOwnPropertyNames(from);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      defineProperty(to, name, getOwnPropertyDescriptor(from, name));
    }
    return to;
  };

  function mixinStatics(to, from) {
    var names = getOwnPropertyNames(from);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      switch (name) {
        case 'arguments':
        case 'caller':
        case 'length':
        case 'name':
        case 'prototype':
        case 'toString':
          continue;
      }
      defineProperty(to, name, getOwnPropertyDescriptor(from, name));
    }
    return to;
  };

  function oneOf(object, propertyNames) {
    for (var i = 0; i < propertyNames.length; i++) {
      if (propertyNames[i] in object)
        return propertyNames[i];
    }
  }

  var nonEnumerableDataDescriptor = {
    value: undefined,
    configurable: true,
    enumerable: false,
    writable: true
  };

  function defineNonEnumerableDataProperty(object, name, value) {
    nonEnumerableDataDescriptor.value = value;
    defineProperty(object, name, nonEnumerableDataDescriptor);
  }

  // Mozilla's old DOM bindings are bretty busted:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=855844
  // Make sure they are create before we start modifying things.
  getOwnPropertyNames(window);

  function getWrapperConstructor(node) {
    var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);
    var wrapperConstructor = constructorTable.get(nativePrototype);
    if (wrapperConstructor)
      return wrapperConstructor;

    var parentWrapperConstructor = getWrapperConstructor(nativePrototype);

    var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);
    registerInternal(nativePrototype, GeneratedWrapper, node);

    return GeneratedWrapper;
  }

  function addForwardingProperties(nativePrototype, wrapperPrototype) {
    installProperty(nativePrototype, wrapperPrototype, true);
  }

  function registerInstanceProperties(wrapperPrototype, instanceObject) {
    installProperty(instanceObject, wrapperPrototype, false);
  }

  var isFirefox = /Firefox/.test(navigator.userAgent);

  // This is used as a fallback when getting the descriptor fails in
  // installProperty.
  var dummyDescriptor = {
    get: function() {},
    set: function(v) {},
    configurable: true,
    enumerable: true
  };

  function isEventHandlerName(name) {
    return /^on[a-z]+$/.test(name);
  }

  function isIdentifierName(name) {
    return /^\w[a-zA-Z_0-9]*$/.test(name);
  }

  // The name of the implementation property is intentionally hard to
  // remember. Unfortunately, browsers are slower doing obj[expr] than
  // obj.foo so we resort to repeat this ugly name. This ugly name is never
  // used outside of this file though.

  function getGetter(name) {
    return hasEval && isIdentifierName(name) ?
        new Function('return this.__impl4cf1e782hg__.' + name) :
        function() { return this.__impl4cf1e782hg__[name]; };
  }

  function getSetter(name) {
    return hasEval && isIdentifierName(name) ?
        new Function('v', 'this.__impl4cf1e782hg__.' + name + ' = v') :
        function(v) { this.__impl4cf1e782hg__[name] = v; };
  }

  function getMethod(name) {
    return hasEval && isIdentifierName(name) ?
        new Function('return this.__impl4cf1e782hg__.' + name +
                     '.apply(this.__impl4cf1e782hg__, arguments)') :
        function() {
          return this.__impl4cf1e782hg__[name].apply(
              this.__impl4cf1e782hg__, arguments);
        };
  }

  function getDescriptor(source, name) {
    try {
      return Object.getOwnPropertyDescriptor(source, name);
    } catch (ex) {
      // JSC and V8 both use data properties instead of accessors which can
      // cause getting the property desciptor to throw an exception.
      // https://bugs.webkit.org/show_bug.cgi?id=49739
      return dummyDescriptor;
    }
  }

  function installProperty(source, target, allowMethod, opt_blacklist) {
    var names = getOwnPropertyNames(source);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (name === 'polymerBlackList_')
        continue;

      if (name in target)
        continue;

      if (source.polymerBlackList_ && source.polymerBlackList_[name])
        continue;

      if (isFirefox) {
        // Tickle Firefox's old bindings.
        source.__lookupGetter__(name);
      }
      var descriptor = getDescriptor(source, name);
      var getter, setter;
      if (allowMethod && typeof descriptor.value === 'function') {
        target[name] = getMethod(name);
        continue;
      }

      var isEvent = isEventHandlerName(name);
      if (isEvent)
        getter = scope.getEventHandlerGetter(name);
      else
        getter = getGetter(name);

      if (descriptor.writable || descriptor.set) {
        if (isEvent)
          setter = scope.getEventHandlerSetter(name);
        else
          setter = getSetter(name);
      }

      defineProperty(target, name, {
        get: getter,
        set: setter,
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable
      });
    }
  }

  /**
   * @param {Function} nativeConstructor
   * @param {Function} wrapperConstructor
   * @param {Object=} opt_instance If present, this is used to extract
   *     properties from an instance object.
   */
  function register(nativeConstructor, wrapperConstructor, opt_instance) {
    var nativePrototype = nativeConstructor.prototype;
    registerInternal(nativePrototype, wrapperConstructor, opt_instance);
    mixinStatics(wrapperConstructor, nativeConstructor);
  }

  function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {
    var wrapperPrototype = wrapperConstructor.prototype;
    assert(constructorTable.get(nativePrototype) === undefined);

    constructorTable.set(nativePrototype, wrapperConstructor);
    nativePrototypeTable.set(wrapperPrototype, nativePrototype);

    addForwardingProperties(nativePrototype, wrapperPrototype);
    if (opt_instance)
      registerInstanceProperties(wrapperPrototype, opt_instance);

    defineNonEnumerableDataProperty(
        wrapperPrototype, 'constructor', wrapperConstructor);
    // Set it again. Some VMs optimizes objects that are used as prototypes.
    wrapperConstructor.prototype = wrapperPrototype;
  }

  function isWrapperFor(wrapperConstructor, nativeConstructor) {
    return constructorTable.get(nativeConstructor.prototype) ===
        wrapperConstructor;
  }

  /**
   * Creates a generic wrapper constructor based on |object| and its
   * constructor.
   * @param {Node} object
   * @return {Function} The generated constructor.
   */
  function registerObject(object) {
    var nativePrototype = Object.getPrototypeOf(object);

    var superWrapperConstructor = getWrapperConstructor(nativePrototype);
    var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);
    registerInternal(nativePrototype, GeneratedWrapper, object);

    return GeneratedWrapper;
  }

  function createWrapperConstructor(superWrapperConstructor) {
    function GeneratedWrapper(node) {
      superWrapperConstructor.call(this, node);
    }
    var p = Object.create(superWrapperConstructor.prototype);
    p.constructor = GeneratedWrapper;
    GeneratedWrapper.prototype = p;

    return GeneratedWrapper;
  }

  function isWrapper(object) {
    return object && object.__impl4cf1e782hg__;
  }

  function isNative(object) {
    return !isWrapper(object);
  }

  /**
   * Wraps a node in a WrapperNode. If there already exists a wrapper for the
   * |node| that wrapper is returned instead.
   * @param {Node} node
   * @return {WrapperNode}
   */
  function wrap(impl) {
    if (impl === null)
      return null;

    assert(isNative(impl));
    return impl.__wrapper8e3dd93a60__ ||
        (impl.__wrapper8e3dd93a60__ = new (getWrapperConstructor(impl))(impl));
  }

  /**
   * Unwraps a wrapper and returns the node it is wrapping.
   * @param {WrapperNode} wrapper
   * @return {Node}
   */
  function unwrap(wrapper) {
    if (wrapper === null)
      return null;
    assert(isWrapper(wrapper));
    return wrapper.__impl4cf1e782hg__;
  }

  function unsafeUnwrap(wrapper) {
    return wrapper.__impl4cf1e782hg__;
  }

  function setWrapper(impl, wrapper) {
    wrapper.__impl4cf1e782hg__ = impl;
    impl.__wrapper8e3dd93a60__ = wrapper;
  }

  /**
   * Unwraps object if it is a wrapper.
   * @param {Object} object
   * @return {Object} The native implementation object.
   */
  function unwrapIfNeeded(object) {
    return object && isWrapper(object) ? unwrap(object) : object;
  }

  /**
   * Wraps object if it is not a wrapper.
   * @param {Object} object
   * @return {Object} The wrapper for object.
   */
  function wrapIfNeeded(object) {
    return object && !isWrapper(object) ? wrap(object) : object;
  }

  /**
   * Overrides the current wrapper (if any) for node.
   * @param {Node} node
   * @param {WrapperNode=} wrapper If left out the wrapper will be created as
   *     needed next time someone wraps the node.
   */
  function rewrap(node, wrapper) {
    if (wrapper === null)
      return;
    assert(isNative(node));
    assert(wrapper === undefined || isWrapper(wrapper));
    node.__wrapper8e3dd93a60__ = wrapper;
  }

  var getterDescriptor = {
    get: undefined,
    configurable: true,
    enumerable: true
  };

  function defineGetter(constructor, name, getter) {
    getterDescriptor.get = getter;
    defineProperty(constructor.prototype, name, getterDescriptor);
  }

  function defineWrapGetter(constructor, name) {
    defineGetter(constructor, name, function() {
      return wrap(this.__impl4cf1e782hg__[name]);
    });
  }

  /**
   * Forwards existing methods on the native object to the wrapper methods.
   * This does not wrap any of the arguments or the return value since the
   * wrapper implementation already takes care of that.
   * @param {Array.<Function>} constructors
   * @parem {Array.<string>} names
   */
  function forwardMethodsToWrapper(constructors, names) {
    constructors.forEach(function(constructor) {
      names.forEach(function(name) {
        constructor.prototype[name] = function() {
          var w = wrapIfNeeded(this);
          return w[name].apply(w, arguments);
        };
      });
    });
  }

  scope.assert = assert;
  scope.constructorTable = constructorTable;
  scope.defineGetter = defineGetter;
  scope.defineWrapGetter = defineWrapGetter;
  scope.forwardMethodsToWrapper = forwardMethodsToWrapper;
  scope.isWrapper = isWrapper;
  scope.isWrapperFor = isWrapperFor;
  scope.mixin = mixin;
  scope.nativePrototypeTable = nativePrototypeTable;
  scope.oneOf = oneOf;
  scope.registerObject = registerObject;
  scope.registerWrapper = register;
  scope.rewrap = rewrap;
  scope.setWrapper = setWrapper;
  scope.unsafeUnwrap = unsafeUnwrap;
  scope.unwrap = unwrap;
  scope.unwrapIfNeeded = unwrapIfNeeded;
  scope.wrap = wrap;
  scope.wrapIfNeeded = wrapIfNeeded;
  scope.wrappers = wrappers;

})(window.ShadowDOMPolyfill);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(context) {
  'use strict';

  var OriginalMutationObserver = window.MutationObserver;
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function handle() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      (0, copies[i])();
    }
  }

  if (OriginalMutationObserver) {
    var counter = 1;
    var observer = new OriginalMutationObserver(handle);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {characterData: true});

    timerFunc = function() {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };

  } else {
    timerFunc = window.setImmediate || window.setTimeout;
  }

  function setEndOfMicrotask(func) {
    callbacks.push(func);
    if (pending)
      return;
    pending = true;
    timerFunc(handle, 0);
  }

  context.setEndOfMicrotask = setEndOfMicrotask;

})(window.ShadowDOMPolyfill);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var setEndOfMicrotask = scope.setEndOfMicrotask
  var wrapIfNeeded = scope.wrapIfNeeded
  var wrappers = scope.wrappers;

  var registrationsTable = new WeakMap();
  var globalMutationObservers = [];
  var isScheduled = false;

  function scheduleCallback(observer) {
    if (isScheduled)
      return;
    setEndOfMicrotask(notifyObservers);
    isScheduled = true;
  }

  // http://dom.spec.whatwg.org/#mutation-observers
  function notifyObservers() {
    isScheduled = false;

    do {
      var notifyList = globalMutationObservers.slice();
      var anyNonEmpty = false;
      for (var i = 0; i < notifyList.length; i++) {
        var mo = notifyList[i];
        var queue = mo.takeRecords();
        removeTransientObserversFor(mo);
        if (queue.length) {
          mo.callback_(queue, mo);
          anyNonEmpty = true;
        }
      }
    } while (anyNonEmpty);
  }

  /**
   * @param {string} type
   * @param {Node} target
   * @constructor
   */
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = new wrappers.NodeList();
    this.removedNodes = new wrappers.NodeList();
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }

  /**
   * Registers transient observers to ancestor and its ancesors for the node
   * which was removed.
   * @param {!Node} ancestor
   * @param {!Node} node
   */
  function registerTransientObservers(ancestor, node) {
    for (; ancestor; ancestor = ancestor.parentNode) {
      var registrations = registrationsTable.get(ancestor);
      if (!registrations)
        continue;
      for (var i = 0; i < registrations.length; i++) {
        var registration = registrations[i];
        if (registration.options.subtree)
          registration.addTransientObserver(node);
      }
    }
  }

  function removeTransientObserversFor(observer) {
    for (var i = 0; i < observer.nodes_.length; i++) {
      var node = observer.nodes_[i];
      var registrations = registrationsTable.get(node);
      if (!registrations)
        return;
      for (var j = 0; j < registrations.length; j++) {
        var registration = registrations[j];
        if (registration.observer === observer)
          registration.removeTransientObservers();
      }
    }
  }

  // http://dom.spec.whatwg.org/#queue-a-mutation-record
  function enqueueMutation(target, type, data) {
    // 1.
    var interestedObservers = Object.create(null);
    var associatedStrings = Object.create(null);

    // 2.
    for (var node = target; node; node = node.parentNode) {
      // 3.
      var registrations = registrationsTable.get(node);
      if (!registrations)
        continue;
      for (var j = 0; j < registrations.length; j++) {
        var registration = registrations[j];
        var options = registration.options;
        // 1.
        if (node !== target && !options.subtree)
          continue;

        // 2.
        if (type === 'attributes' && !options.attributes)
          continue;

        // 3. If type is "attributes", options's attributeFilter is present, and
        // either options's attributeFilter does not contain name or namespace
        // is non-null, continue.
        if (type === 'attributes' && options.attributeFilter &&
            (data.namespace !== null ||
             options.attributeFilter.indexOf(data.name) === -1)) {
          continue;
        }

        // 4.
        if (type === 'characterData' && !options.characterData)
          continue;

        // 5.
        if (type === 'childList' && !options.childList)
          continue;

        // 6.
        var observer = registration.observer;
        interestedObservers[observer.uid_] = observer;

        // 7. If either type is "attributes" and options's attributeOldValue is
        // true, or type is "characterData" and options's characterDataOldValue
        // is true, set the paired string of registered observer's observer in
        // interested observers to oldValue.
        if (type === 'attributes' && options.attributeOldValue ||
            type === 'characterData' && options.characterDataOldValue) {
          associatedStrings[observer.uid_] = data.oldValue;
        }
      }
    }

    var anyRecordsEnqueued = false;

    // 4.
    for (var uid in interestedObservers) {
      var observer = interestedObservers[uid];
      var record = new MutationRecord(type, target);

      // 2.
      if ('name' in data && 'namespace' in data) {
        record.attributeName = data.name;
        record.attributeNamespace = data.namespace;
      }

      // 3.
      if (data.addedNodes)
        record.addedNodes = data.addedNodes;

      // 4.
      if (data.removedNodes)
        record.removedNodes = data.removedNodes;

      // 5.
      if (data.previousSibling)
        record.previousSibling = data.previousSibling;

      // 6.
      if (data.nextSibling)
        record.nextSibling = data.nextSibling;

      // 7.
      if (associatedStrings[uid] !== undefined)
        record.oldValue = associatedStrings[uid];

      // 8.
      observer.records_.push(record);

      anyRecordsEnqueued = true;
    }

    if (anyRecordsEnqueued)
      scheduleCallback();
  }

  var slice = Array.prototype.slice;

  /**
   * @param {!Object} options
   * @constructor
   */
  function MutationObserverOptions(options) {
    this.childList = !!options.childList;
    this.subtree = !!options.subtree;

    // 1. If either options' attributeOldValue or attributeFilter is present
    // and options' attributes is omitted, set options' attributes to true.
    if (!('attributes' in options) &&
        ('attributeOldValue' in options || 'attributeFilter' in options)) {
      this.attributes = true;
    } else {
      this.attributes = !!options.attributes;
    }

    // 2. If options' characterDataOldValue is present and options'
    // characterData is omitted, set options' characterData to true.
    if ('characterDataOldValue' in options && !('characterData' in options))
      this.characterData = true;
    else
      this.characterData = !!options.characterData;

    // 3. & 4.
    if (!this.attributes &&
        (options.attributeOldValue || 'attributeFilter' in options) ||
        // 5.
        !this.characterData && options.characterDataOldValue) {
      throw new TypeError();
    }

    this.characterData = !!options.characterData;
    this.attributeOldValue = !!options.attributeOldValue;
    this.characterDataOldValue = !!options.characterDataOldValue;
    if ('attributeFilter' in options) {
      if (options.attributeFilter == null ||
          typeof options.attributeFilter !== 'object') {
        throw new TypeError();
      }
      this.attributeFilter = slice.call(options.attributeFilter);
    } else {
      this.attributeFilter = null;
    }
  }

  var uidCounter = 0;

  /**
   * The class that maps to the DOM MutationObserver interface.
   * @param {Function} callback.
   * @constructor
   */
  function MutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;

    // This will leak. There is no way to implement this without WeakRefs :'(
    globalMutationObservers.push(this);
  }

  MutationObserver.prototype = {
    constructor: MutationObserver,

    // http://dom.spec.whatwg.org/#dom-mutationobserver-observe
    observe: function(target, options) {
      target = wrapIfNeeded(target);

      var newOptions = new MutationObserverOptions(options);

      // 6.
      var registration;
      var registrations = registrationsTable.get(target);
      if (!registrations)
        registrationsTable.set(target, registrations = []);

      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          // 6.1.
          registration.removeTransientObservers();
          // 6.2.
          registration.options = newOptions;
        }
      }

      // 7.
      if (!registration) {
        registration = new Registration(this, target, newOptions);
        registrations.push(registration);
        this.nodes_.push(target);
      }
    },

    // http://dom.spec.whatwg.org/#dom-mutationobserver-disconnect
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registrations.splice(i, 1);
            // Each node can only have one registered observer associated with
            // this observer.
            break;
          }
        }
      }, this);
      this.records_ = [];
    },

    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };

  /**
   * Class used to represent a registered observer.
   * @param {MutationObserver} observer
   * @param {Node} target
   * @param {MutationObserverOptions} options
   * @constructor
   */
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }

  Registration.prototype = {
    /**
     * Adds a transient observer on node. The transient observer gets removed
     * next time we deliver the change records.
     * @param {Node} node
     */
    addTransientObserver: function(node) {
      // Don't add transient observers on the target itself. We already have all
      // the required listeners set up on the target.
      if (node === this.target)
        return;

      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations)
        registrationsTable.set(node, registrations = []);

      // We know that registrations does not contain this because we already
      // checked if node === this.target.
      registrations.push(this);
    },

    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];

      for (var i = 0; i < transientObservedNodes.length; i++) {
        var node = transientObservedNodes[i];
        var registrations = registrationsTable.get(node);
        for (var j = 0; j < registrations.length; j++) {
          if (registrations[j] === this) {
            registrations.splice(j, 1);
            // Each node can only have one registered observer associated with
            // this observer.
            break;
          }
        }
      }
    }
  };

  scope.enqueueMutation = enqueueMutation;
  scope.registerTransientObservers = registerTransientObservers;
  scope.wrappers.MutationObserver = MutationObserver;
  scope.wrappers.MutationRecord = MutationRecord;

})(window.ShadowDOMPolyfill);

/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  /**
   * A tree scope represents the root of a tree. All nodes in a tree point to
   * the same TreeScope object. The tree scope of a node get set the first time
   * it is accessed or when a node is added or remove to a tree.
   *
   * The root is a Node that has no parent.
   *
   * The parent is another TreeScope. For ShadowRoots, it is the TreeScope of
   * the host of the ShadowRoot.
   *
   * @param {!Node} root
   * @param {TreeScope} parent
   * @constructor
   */
  function TreeScope(root, parent) {
    /** @type {!Node} */
    this.root = root;

    /** @type {TreeScope} */
    this.parent = parent;
  }

  TreeScope.prototype = {
    get renderer() {
      if (this.root instanceof scope.wrappers.ShadowRoot) {
        return scope.getRendererForHost(this.root.host);
      }
      return null;
    },

    contains: function(treeScope) {
      for (; treeScope; treeScope = treeScope.parent) {
        if (treeScope === this)
          return true;
      }
      return false;
    }
  };

  function setTreeScope(node, treeScope) {
    if (node.treeScope_ !== treeScope) {
      node.treeScope_ = treeScope;
      for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {
        sr.treeScope_.parent = treeScope;
      }
      for (var child = node.firstChild; child; child = child.nextSibling) {
        setTreeScope(child, treeScope);
      }
    }
  }

  function getTreeScope(node) {
    if (node instanceof scope.wrappers.Window) {
      debugger;
    }

    if (node.treeScope_)
      return node.treeScope_;
    var parent = node.parentNode;
    var treeScope;
    if (parent)
      treeScope = getTreeScope(parent);
    else
      treeScope = new TreeScope(node, null);
    return node.treeScope_ = treeScope;
  }

  scope.TreeScope = TreeScope;
  scope.getTreeScope = getTreeScope;
  scope.setTreeScope = setTreeScope;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
  var getTreeScope = scope.getTreeScope;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrappers = scope.wrappers;

  var wrappedFuns = new WeakMap();
  var listenersTable = new WeakMap();
  var handledEventsTable = new WeakMap();
  var currentlyDispatchingEvents = new WeakMap();
  var targetTable = new WeakMap();
  var currentTargetTable = new WeakMap();
  var relatedTargetTable = new WeakMap();
  var eventPhaseTable = new WeakMap();
  var stopPropagationTable = new WeakMap();
  var stopImmediatePropagationTable = new WeakMap();
  var eventHandlersTable = new WeakMap();
  var eventPathTable = new WeakMap();

  function isShadowRoot(node) {
    return node instanceof wrappers.ShadowRoot;
  }

  function rootOfNode(node) {
    return getTreeScope(node).root;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#event-paths
  function getEventPath(node, event) {
    var path = [];
    var current = node;
    path.push(current);
    while (current) {
      // 4.1.
      var destinationInsertionPoints = getDestinationInsertionPoints(current);
      if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {
        // 4.1.1
        for (var i = 0; i < destinationInsertionPoints.length; i++) {
          var insertionPoint = destinationInsertionPoints[i];
          // 4.1.1.1
          if (isShadowInsertionPoint(insertionPoint)) {
            var shadowRoot = rootOfNode(insertionPoint);
            // 4.1.1.1.2
            var olderShadowRoot = shadowRoot.olderShadowRoot;
            if (olderShadowRoot)
              path.push(olderShadowRoot);
          }

          // 4.1.1.2
          path.push(insertionPoint);
        }

        // 4.1.2
        current = destinationInsertionPoints[
            destinationInsertionPoints.length - 1];

      // 4.2
      } else {
        if (isShadowRoot(current)) {
          if (inSameTree(node, current) && eventMustBeStopped(event)) {
            // Stop this algorithm
            break;
          }
          current = current.host;
          path.push(current);

        // 4.2.2
        } else {
          current = current.parentNode;
          if (current)
            path.push(current);
        }
      }
    }

    return path;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#dfn-events-always-stopped
  function eventMustBeStopped(event) {
    if (!event)
      return false;

    switch (event.type) {
      case 'abort':
      case 'error':
      case 'select':
      case 'change':
      case 'load':
      case 'reset':
      case 'resize':
      case 'scroll':
      case 'selectstart':
        return true;
    }
    return false;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#dfn-shadow-insertion-point
  function isShadowInsertionPoint(node) {
    return node instanceof HTMLShadowElement;
    // and make sure that there are no shadow precing this?
    // and that there is no content ancestor?
  }

  function getDestinationInsertionPoints(node) {
    return scope.getDestinationInsertionPoints(node);
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#event-retargeting
  function eventRetargetting(path, currentTarget) {
    if (path.length === 0)
      return currentTarget;

    // The currentTarget might be the window object. Use its document for the
    // purpose of finding the retargetted node.
    if (currentTarget instanceof wrappers.Window)
      currentTarget = currentTarget.document;

    var currentTargetTree = getTreeScope(currentTarget);
    var originalTarget = path[0];
    var originalTargetTree = getTreeScope(originalTarget);
    var relativeTargetTree =
        lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);

    for (var i = 0; i < path.length; i++) {
      var node = path[i];
      if (getTreeScope(node) === relativeTargetTree)
        return node;
    }

    return path[path.length - 1];
  }

  function getTreeScopeAncestors(treeScope) {
    var ancestors = [];
    for (;treeScope; treeScope = treeScope.parent) {
      ancestors.push(treeScope);
    }
    return ancestors;
  }

  function lowestCommonInclusiveAncestor(tsA, tsB) {
    var ancestorsA = getTreeScopeAncestors(tsA);
    var ancestorsB = getTreeScopeAncestors(tsB);

    var result = null;
    while (ancestorsA.length > 0 && ancestorsB.length > 0) {
      var a = ancestorsA.pop();
      var b = ancestorsB.pop();
      if (a === b)
        result = a;
      else
        break;
    }
    return result;
  }

  function getTreeScopeRoot(ts) {
    if (!ts.parent)
      return ts;
    return getTreeScopeRoot(ts.parent);
  }

  function relatedTargetResolution(event, currentTarget, relatedTarget) {
    // In case the current target is a window use its document for the purpose
    // of retargetting the related target.
    if (currentTarget instanceof wrappers.Window)
      currentTarget = currentTarget.document;

    var currentTargetTree = getTreeScope(currentTarget);
    var relatedTargetTree = getTreeScope(relatedTarget);

    var relatedTargetEventPath = getEventPath(relatedTarget, event);

    var lowestCommonAncestorTree;

    // 4
    var lowestCommonAncestorTree =
        lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);

    // 5
    if (!lowestCommonAncestorTree)
      lowestCommonAncestorTree = relatedTargetTree.root;

    // 6
    for (var commonAncestorTree = lowestCommonAncestorTree;
         commonAncestorTree;
         commonAncestorTree = commonAncestorTree.parent) {
      // 6.1
      var adjustedRelatedTarget;
      for (var i = 0; i < relatedTargetEventPath.length; i++) {
        var node = relatedTargetEventPath[i];
        if (getTreeScope(node) === commonAncestorTree)
          return node;
      }
    }

    return null;
  }

  function inSameTree(a, b) {
    return getTreeScope(a) === getTreeScope(b);
  }

  var NONE = 0;
  var CAPTURING_PHASE = 1;
  var AT_TARGET = 2;
  var BUBBLING_PHASE = 3;

  // pendingError is used to rethrow the first error we got during an event
  // dispatch. The browser actually reports all errors but to do that we would
  // need to rethrow the error asynchronously.
  var pendingError;

  function dispatchOriginalEvent(originalEvent) {
    // Make sure this event is only dispatched once.
    if (handledEventsTable.get(originalEvent))
      return;
    handledEventsTable.set(originalEvent, true);
    dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));
    if (pendingError) {
      var err = pendingError;
      pendingError = null;
      throw err;
    }
  }

  function dispatchEvent(event, originalWrapperTarget) {
    if (currentlyDispatchingEvents.get(event))
      throw new Error('InvalidStateError');

    currentlyDispatchingEvents.set(event, true);

    // Render to ensure that the event path is correct.
    scope.renderAllPending();
    var eventPath;

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#events-and-the-window-object
    // All events dispatched on Nodes with a default view, except load events,
    // should propagate to the Window.

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#the-end
    var overrideTarget;
    var win;
    var type = event.type;

    // Should really be not cancelable too but since Firefox has a bug there
    // we skip that check.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=999456
    if (type === 'load' && !event.bubbles) {
      var doc = originalWrapperTarget;
      if (doc instanceof wrappers.Document && (win = doc.defaultView)) {
        overrideTarget = doc;
        eventPath = [];
      }
    }

    if (!eventPath) {
      if (originalWrapperTarget instanceof wrappers.Window) {
        win = originalWrapperTarget;
        eventPath = [];
      } else {
        eventPath = getEventPath(originalWrapperTarget, event);

        if (event.type !== 'load') {
          var doc = eventPath[eventPath.length - 1];
          if (doc instanceof wrappers.Document)
            win = doc.defaultView;
        }
      }
    }

    eventPathTable.set(event, eventPath);

    if (dispatchCapturing(event, eventPath, win, overrideTarget)) {
      if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {
        dispatchBubbling(event, eventPath, win, overrideTarget);
      }
    }

    eventPhaseTable.set(event, NONE);
    currentTargetTable.delete(event, null);
    currentlyDispatchingEvents.delete(event);

    return event.defaultPrevented;
  }

  function dispatchCapturing(event, eventPath, win, overrideTarget) {
    var phase = CAPTURING_PHASE;

    if (win) {
      if (!invoke(win, event, phase, eventPath, overrideTarget))
        return false;
    }

    for (var i = eventPath.length - 1; i > 0; i--) {
      if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget))
        return false;
    }

    return true;
  }

  function dispatchAtTarget(event, eventPath, win, overrideTarget) {
    var phase = AT_TARGET;
    var currentTarget = eventPath[0] || win;
    return invoke(currentTarget, event, phase, eventPath, overrideTarget);
  }

  function dispatchBubbling(event, eventPath, win, overrideTarget) {
    var phase = BUBBLING_PHASE;
    for (var i = 1; i < eventPath.length; i++) {
      if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget))
        return;
    }

    if (win && eventPath.length > 0) {
      invoke(win, event, phase, eventPath, overrideTarget);
    }
  }

  function invoke(currentTarget, event, phase, eventPath, overrideTarget) {
    var listeners = listenersTable.get(currentTarget);
    if (!listeners)
      return true;

    var target = overrideTarget || eventRetargetting(eventPath, currentTarget);

    if (target === currentTarget) {
      if (phase === CAPTURING_PHASE)
        return true;

      if (phase === BUBBLING_PHASE)
         phase = AT_TARGET;

    } else if (phase === BUBBLING_PHASE && !event.bubbles) {
      return true;
    }

    if ('relatedTarget' in event) {
      var originalEvent = unwrap(event);
      var unwrappedRelatedTarget = originalEvent.relatedTarget;

      // X-Tag sets relatedTarget on a CustomEvent. If they do that there is no
      // way to have relatedTarget return the adjusted target but worse is that
      // the originalEvent might not have a relatedTarget so we hit an assert
      // when we try to wrap it.
      if (unwrappedRelatedTarget) {
        // In IE we can get objects that are not EventTargets at this point.
        // Safari does not have an EventTarget interface so revert to checking
        // for addEventListener as an approximation.
        if (unwrappedRelatedTarget instanceof Object &&
            unwrappedRelatedTarget.addEventListener) {
          var relatedTarget = wrap(unwrappedRelatedTarget);

          var adjusted =
              relatedTargetResolution(event, currentTarget, relatedTarget);
          if (adjusted === target)
            return true;
        } else {
          adjusted = null;
        }
        relatedTargetTable.set(event, adjusted);
      }
    }

    eventPhaseTable.set(event, phase);
    var type = event.type;

    var anyRemoved = false;
    // targetTable.set(event, target);
    targetTable.set(event, target);
    currentTargetTable.set(event, currentTarget);

    // Keep track of the invoke depth so that we only clean up the removed
    // listeners if we are in the outermost invoke.
    listeners.depth++;

    for (var i = 0, len = listeners.length; i < len; i++) {
      var listener = listeners[i];
      if (listener.removed) {
        anyRemoved = true;
        continue;
      }

      if (listener.type !== type ||
          !listener.capture && phase === CAPTURING_PHASE ||
          listener.capture && phase === BUBBLING_PHASE) {
        continue;
      }

      try {
        if (typeof listener.handler === 'function')
          listener.handler.call(currentTarget, event);
        else
          listener.handler.handleEvent(event);

        if (stopImmediatePropagationTable.get(event))
          return false;

      } catch (ex) {
        if (!pendingError)
          pendingError = ex;
      }
    }

    listeners.depth--;

    if (anyRemoved && listeners.depth === 0) {
      var copy = listeners.slice();
      listeners.length = 0;
      for (var i = 0; i < copy.length; i++) {
        if (!copy[i].removed)
          listeners.push(copy[i]);
      }
    }

    return !stopPropagationTable.get(event);
  }

  function Listener(type, handler, capture) {
    this.type = type;
    this.handler = handler;
    this.capture = Boolean(capture);
  }
  Listener.prototype = {
    equals: function(that) {
      return this.handler === that.handler && this.type === that.type &&
          this.capture === that.capture;
    },
    get removed() {
      return this.handler === null;
    },
    remove: function() {
      this.handler = null;
    }
  };

  var OriginalEvent = window.Event;
  OriginalEvent.prototype.polymerBlackList_ = {
    returnValue: true,
    // TODO(arv): keyLocation is part of KeyboardEvent but Firefox does not
    // support constructable KeyboardEvent so we keep it here for now.
    keyLocation: true
  };

  /**
   * Creates a new Event wrapper or wraps an existin native Event object.
   * @param {string|Event} type
   * @param {Object=} options
   * @constructor
   */
  function Event(type, options) {
    if (type instanceof OriginalEvent) {
      var impl = type;
      if (!OriginalBeforeUnloadEvent && impl.type === 'beforeunload') {
        return new BeforeUnloadEvent(impl);
      }
      setWrapper(impl, this);
    } else {
      return wrap(constructEvent(OriginalEvent, 'Event', type, options));
    }
  }
  Event.prototype = {
    get target() {
      return targetTable.get(this);
    },
    get currentTarget() {
      return currentTargetTable.get(this);
    },
    get eventPhase() {
      return eventPhaseTable.get(this);
    },
    get path() {
      var eventPath = eventPathTable.get(this);
      if (!eventPath)
        return [];
      // TODO(arv): Event path should contain window.
      return eventPath.slice();
    },
    stopPropagation: function() {
      stopPropagationTable.set(this, true);
    },
    stopImmediatePropagation: function() {
      stopPropagationTable.set(this, true);
      stopImmediatePropagationTable.set(this, true);
    }
  };
  registerWrapper(OriginalEvent, Event, document.createEvent('Event'));

  function unwrapOptions(options) {
    if (!options || !options.relatedTarget)
      return options;
    return Object.create(options, {
      relatedTarget: {value: unwrap(options.relatedTarget)}
    });
  }

  function registerGenericEvent(name, SuperEvent, prototype) {
    var OriginalEvent = window[name];
    var GenericEvent = function(type, options) {
      if (type instanceof OriginalEvent)
        setWrapper(type, this);
      else
        return wrap(constructEvent(OriginalEvent, name, type, options));
    };
    GenericEvent.prototype = Object.create(SuperEvent.prototype);
    if (prototype)
      mixin(GenericEvent.prototype, prototype);
    if (OriginalEvent) {
      // - Old versions of Safari fails on new FocusEvent (and others?).
      // - IE does not support event constructors.
      // - createEvent('FocusEvent') throws in Firefox.
      // => Try the best practice solution first and fallback to the old way
      // if needed.
      try {
        registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent('temp'));
      } catch (ex) {
        registerWrapper(OriginalEvent, GenericEvent,
                        document.createEvent(name));
      }
    }
    return GenericEvent;
  }

  var UIEvent = registerGenericEvent('UIEvent', Event);
  var CustomEvent = registerGenericEvent('CustomEvent', Event);

  var relatedTargetProto = {
    get relatedTarget() {
      var relatedTarget = relatedTargetTable.get(this);
      // relatedTarget can be null.
      if (relatedTarget !== undefined)
        return relatedTarget;
      return wrap(unwrap(this).relatedTarget);
    }
  };

  function getInitFunction(name, relatedTargetIndex) {
    return function() {
      arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);
      var impl = unwrap(this);
      impl[name].apply(impl, arguments);
    };
  }

  var mouseEventProto = mixin({
    initMouseEvent: getInitFunction('initMouseEvent', 14)
  }, relatedTargetProto);

  var focusEventProto = mixin({
    initFocusEvent: getInitFunction('initFocusEvent', 5)
  }, relatedTargetProto);

  var MouseEvent = registerGenericEvent('MouseEvent', UIEvent, mouseEventProto);
  var FocusEvent = registerGenericEvent('FocusEvent', UIEvent, focusEventProto);

  // In case the browser does not support event constructors we polyfill that
  // by calling `createEvent('Foo')` and `initFooEvent` where the arguments to
  // `initFooEvent` are derived from the registered default event init dict.
  var defaultInitDicts = Object.create(null);

  var supportsEventConstructors = (function() {
    try {
      new window.FocusEvent('focus');
    } catch (ex) {
      return false;
    }
    return true;
  })();

  /**
   * Constructs a new native event.
   */
  function constructEvent(OriginalEvent, name, type, options) {
    if (supportsEventConstructors)
      return new OriginalEvent(type, unwrapOptions(options));

    // Create the arguments from the default dictionary.
    var event = unwrap(document.createEvent(name));
    var defaultDict = defaultInitDicts[name];
    var args = [type];
    Object.keys(defaultDict).forEach(function(key) {
      var v = options != null && key in options ?
          options[key] : defaultDict[key];
      if (key === 'relatedTarget')
        v = unwrap(v);
      args.push(v);
    });
    event['init' + name].apply(event, args);
    return event;
  }

  if (!supportsEventConstructors) {
    var configureEventConstructor = function(name, initDict, superName) {
      if (superName) {
        var superDict = defaultInitDicts[superName];
        initDict = mixin(mixin({}, superDict), initDict);
      }

      defaultInitDicts[name] = initDict;
    };

    // The order of the default event init dictionary keys is important, the
    // arguments to initFooEvent is derived from that.
    configureEventConstructor('Event', {bubbles: false, cancelable: false});
    configureEventConstructor('CustomEvent', {detail: null}, 'Event');
    configureEventConstructor('UIEvent', {view: null, detail: 0}, 'Event');
    configureEventConstructor('MouseEvent', {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null
    }, 'UIEvent');
    configureEventConstructor('FocusEvent', {relatedTarget: null}, 'UIEvent');
  }

  // Safari 7 does not yet have BeforeUnloadEvent.
  // https://bugs.webkit.org/show_bug.cgi?id=120849
  var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;

  function BeforeUnloadEvent(impl) {
    Event.call(this, impl);
  }
  BeforeUnloadEvent.prototype = Object.create(Event.prototype);
  mixin(BeforeUnloadEvent.prototype, {
    get returnValue() {
      return unsafeUnwrap(this).returnValue;
    },
    set returnValue(v) {
      unsafeUnwrap(this).returnValue = v;
    }
  });

  if (OriginalBeforeUnloadEvent)
    registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);

  function isValidListener(fun) {
    if (typeof fun === 'function')
      return true;
    return fun && fun.handleEvent;
  }

  function isMutationEvent(type) {
    switch (type) {
      case 'DOMAttrModified':
      case 'DOMAttributeNameChanged':
      case 'DOMCharacterDataModified':
      case 'DOMElementNameChanged':
      case 'DOMNodeInserted':
      case 'DOMNodeInsertedIntoDocument':
      case 'DOMNodeRemoved':
      case 'DOMNodeRemovedFromDocument':
      case 'DOMSubtreeModified':
        return true;
    }
    return false;
  }

  var OriginalEventTarget = window.EventTarget;

  /**
   * This represents a wrapper for an EventTarget.
   * @param {!EventTarget} impl The original event target.
   * @constructor
   */
  function EventTarget(impl) {
    setWrapper(impl, this);
  }

  // Node and Window have different internal type checks in WebKit so we cannot
  // use the same method as the original function.
  var methodNames = [
    'addEventListener',
    'removeEventListener',
    'dispatchEvent'
  ];

  [Node, Window].forEach(function(constructor) {
    var p = constructor.prototype;
    methodNames.forEach(function(name) {
      Object.defineProperty(p, name + '_', {value: p[name]});
    });
  });

  function getTargetToListenAt(wrapper) {
    if (wrapper instanceof wrappers.ShadowRoot)
      wrapper = wrapper.host;
    return unwrap(wrapper);
  }

  EventTarget.prototype = {
    addEventListener: function(type, fun, capture) {
      if (!isValidListener(fun) || isMutationEvent(type))
        return;

      var listener = new Listener(type, fun, capture);
      var listeners = listenersTable.get(this);
      if (!listeners) {
        listeners = [];
        listeners.depth = 0;
        listenersTable.set(this, listeners);
      } else {
        // Might have a duplicate.
        for (var i = 0; i < listeners.length; i++) {
          if (listener.equals(listeners[i]))
            return;
        }
      }

      listeners.push(listener);

      var target = getTargetToListenAt(this);
      target.addEventListener_(type, dispatchOriginalEvent, true);
    },
    removeEventListener: function(type, fun, capture) {
      capture = Boolean(capture);
      var listeners = listenersTable.get(this);
      if (!listeners)
        return;
      var count = 0, found = false;
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].type === type && listeners[i].capture === capture) {
          count++;
          if (listeners[i].handler === fun) {
            found = true;
            listeners[i].remove();
          }
        }
      }

      if (found && count === 1) {
        var target = getTargetToListenAt(this);
        target.removeEventListener_(type, dispatchOriginalEvent, true);
      }
    },
    dispatchEvent: function(event) {
      // We want to use the native dispatchEvent because it triggers the default
      // actions (like checking a checkbox). However, if there are no listeners
      // in the composed tree then there are no events that will trigger and
      // listeners in the non composed tree that are part of the event path are
      // not notified.
      //
      // If we find out that there are no listeners in the composed tree we add
      // a temporary listener to the target which makes us get called back even
      // in that case.

      var nativeEvent = unwrap(event);
      var eventType = nativeEvent.type;

      // Allow dispatching the same event again. This is safe because if user
      // code calls this during an existing dispatch of the same event the
      // native dispatchEvent throws (that is required by the spec).
      handledEventsTable.set(nativeEvent, false);

      // Force rendering since we prefer native dispatch and that works on the
      // composed tree.
      scope.renderAllPending();

      var tempListener;
      if (!hasListenerInAncestors(this, eventType)) {
        tempListener = function() {};
        this.addEventListener(eventType, tempListener, true);
      }

      try {
        return unwrap(this).dispatchEvent_(nativeEvent);
      } finally {
        if (tempListener)
          this.removeEventListener(eventType, tempListener, true);
      }
    }
  };

  function hasListener(node, type) {
    var listeners = listenersTable.get(node);
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        if (!listeners[i].removed && listeners[i].type === type)
          return true;
      }
    }
    return false;
  }

  function hasListenerInAncestors(target, type) {
    for (var node = unwrap(target); node; node = node.parentNode) {
      if (hasListener(wrap(node), type))
        return true;
    }
    return false;
  }

  if (OriginalEventTarget)
    registerWrapper(OriginalEventTarget, EventTarget);

  function wrapEventTargetMethods(constructors) {
    forwardMethodsToWrapper(constructors, methodNames);
  }

  var originalElementFromPoint = document.elementFromPoint;

  function elementFromPoint(self, document, x, y) {
    scope.renderAllPending();

    var element =
        wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));
    if (!element)
      return null;
    var path = getEventPath(element, null);

    // scope the path to this TreeScope
    var idx = path.lastIndexOf(self);
    if (idx == -1)
      return null;
    else
      path = path.slice(0, idx);

    // TODO(dfreedm): pass idx to eventRetargetting to avoid array copy
    return eventRetargetting(path, self);
  }

  /**
   * Returns a function that is to be used as a getter for `onfoo` properties.
   * @param {string} name
   * @return {Function}
   */
  function getEventHandlerGetter(name) {
    return function() {
      var inlineEventHandlers = eventHandlersTable.get(this);
      return inlineEventHandlers && inlineEventHandlers[name] &&
          inlineEventHandlers[name].value || null;
     };
  }

  /**
   * Returns a function that is to be used as a setter for `onfoo` properties.
   * @param {string} name
   * @return {Function}
   */
  function getEventHandlerSetter(name) {
    var eventType = name.slice(2);
    return function(value) {
      var inlineEventHandlers = eventHandlersTable.get(this);
      if (!inlineEventHandlers) {
        inlineEventHandlers = Object.create(null);
        eventHandlersTable.set(this, inlineEventHandlers);
      }

      var old = inlineEventHandlers[name];
      if (old)
        this.removeEventListener(eventType, old.wrapped, false);

      if (typeof value === 'function') {
        var wrapped = function(e) {
          var rv = value.call(this, e);
          if (rv === false)
            e.preventDefault();
          else if (name === 'onbeforeunload' && typeof rv === 'string')
            e.returnValue = rv;
          // mouseover uses true for preventDefault but preventDefault for
          // mouseover is ignored by browsers these day.
        };

        this.addEventListener(eventType, wrapped, false);
        inlineEventHandlers[name] = {
          value: value,
          wrapped: wrapped
        };
      }
    };
  }

  scope.elementFromPoint = elementFromPoint;
  scope.getEventHandlerGetter = getEventHandlerGetter;
  scope.getEventHandlerSetter = getEventHandlerSetter;
  scope.wrapEventTargetMethods = wrapEventTargetMethods;
  scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;
  scope.wrappers.CustomEvent = CustomEvent;
  scope.wrappers.Event = Event;
  scope.wrappers.EventTarget = EventTarget;
  scope.wrappers.FocusEvent = FocusEvent;
  scope.wrappers.MouseEvent = MouseEvent;
  scope.wrappers.UIEvent = UIEvent;

})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var UIEvent = scope.wrappers.UIEvent;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  // TouchEvent is WebKit/Blink only.
  var OriginalTouchEvent = window.TouchEvent;
  if (!OriginalTouchEvent)
    return;

  var nativeEvent;
  try {
    nativeEvent = document.createEvent('TouchEvent');
  } catch (ex) {
    // In Chrome creating a TouchEvent fails if the feature is not turned on
    // which it isn't on desktop Chrome.
    return;
  }

  var nonEnumDescriptor = {enumerable: false};

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, nonEnumDescriptor);
  }

  function Touch(impl) {
    setWrapper(impl, this);
  }

  Touch.prototype = {
    get target() {
      return wrap(unsafeUnwrap(this).target);
    }
  };

  var descr = {
    configurable: true,
    enumerable: true,
    get: null
  };

  [
    'clientX',
    'clientY',
    'screenX',
    'screenY',
    'pageX',
    'pageY',
    'identifier',
    'webkitRadiusX',
    'webkitRadiusY',
    'webkitRotationAngle',
    'webkitForce'
  ].forEach(function(name) {
    descr.get = function() {
      return unsafeUnwrap(this)[name];
    };
    Object.defineProperty(Touch.prototype, name, descr);
  });

  function TouchList() {
    this.length = 0;
    nonEnum(this, 'length');
  }

  TouchList.prototype = {
    item: function(index) {
      return this[index];
    }
  };

  function wrapTouchList(nativeTouchList) {
    var list = new TouchList();
    for (var i = 0; i < nativeTouchList.length; i++) {
      list[i] = new Touch(nativeTouchList[i]);
    }
    list.length = i;
    return list;
  }

  function TouchEvent(impl) {
    UIEvent.call(this, impl);
  }

  TouchEvent.prototype = Object.create(UIEvent.prototype);

  mixin(TouchEvent.prototype, {
    get touches() {
      return wrapTouchList(unsafeUnwrap(this).touches);
    },

    get targetTouches() {
      return wrapTouchList(unsafeUnwrap(this).targetTouches);
    },

    get changedTouches() {
      return wrapTouchList(unsafeUnwrap(this).changedTouches);
    },

    initTouchEvent: function() {
      // The only way to use this is to reuse the TouchList from an existing
      // TouchEvent. Since this is WebKit/Blink proprietary API we will not
      // implement this until someone screams.
      throw new Error('Not implemented');
    }
  });

  registerWrapper(OriginalTouchEvent, TouchEvent, nativeEvent);

  scope.wrappers.Touch = Touch;
  scope.wrappers.TouchEvent = TouchEvent;
  scope.wrappers.TouchList = TouchList;

})(window.ShadowDOMPolyfill);


// Copyright 2012 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var nonEnumDescriptor = {enumerable: false};

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, nonEnumDescriptor);
  }

  function NodeList() {
    this.length = 0;
    nonEnum(this, 'length');
  }
  NodeList.prototype = {
    item: function(index) {
      return this[index];
    }
  };
  nonEnum(NodeList.prototype, 'item');

  function wrapNodeList(list) {
    if (list == null)
      return list;
    var wrapperList = new NodeList();
    for (var i = 0, length = list.length; i < length; i++) {
      wrapperList[i] = wrap(list[i]);
    }
    wrapperList.length = length;
    return wrapperList;
  }

  function addWrapNodeListMethod(wrapperConstructor, name) {
    wrapperConstructor.prototype[name] = function() {
      return wrapNodeList(
          unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));
    };
  }

  scope.wrappers.NodeList = NodeList;
  scope.addWrapNodeListMethod = addWrapNodeListMethod;
  scope.wrapNodeList = wrapNodeList;

})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  // TODO(arv): Implement.

  scope.wrapHTMLCollection = scope.wrapNodeList;
  scope.wrappers.HTMLCollection = scope.wrappers.NodeList;

})(window.ShadowDOMPolyfill);

/**
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var NodeList = scope.wrappers.NodeList;
  var TreeScope = scope.TreeScope;
  var assert = scope.assert;
  var defineWrapGetter = scope.defineWrapGetter;
  var enqueueMutation = scope.enqueueMutation;
  var getTreeScope = scope.getTreeScope;
  var isWrapper = scope.isWrapper;
  var mixin = scope.mixin;
  var registerTransientObservers = scope.registerTransientObservers;
  var registerWrapper = scope.registerWrapper;
  var setTreeScope = scope.setTreeScope;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;
  var wrapIfNeeded = scope.wrapIfNeeded;
  var wrappers = scope.wrappers;

  function assertIsNodeWrapper(node) {
    assert(node instanceof Node);
  }

  function createOneElementNodeList(node) {
    var nodes = new NodeList();
    nodes[0] = node;
    nodes.length = 1;
    return nodes;
  }

  var surpressMutations = false;

  /**
   * Called before node is inserted into a node to enqueue its removal from its
   * old parent.
   * @param {!Node} node The node that is about to be removed.
   * @param {!Node} parent The parent node that the node is being removed from.
   * @param {!NodeList} nodes The collected nodes.
   */
  function enqueueRemovalForInsertedNodes(node, parent, nodes) {
    enqueueMutation(parent, 'childList', {
      removedNodes: nodes,
      previousSibling: node.previousSibling,
      nextSibling: node.nextSibling
    });
  }

  function enqueueRemovalForInsertedDocumentFragment(df, nodes) {
    enqueueMutation(df, 'childList', {
      removedNodes: nodes
    });
  }

  /**
   * Collects nodes from a DocumentFragment or a Node for removal followed
   * by an insertion.
   *
   * This updates the internal pointers for node, previousNode and nextNode.
   */
  function collectNodes(node, parentNode, previousNode, nextNode) {
    if (node instanceof DocumentFragment) {
      var nodes = collectNodesForDocumentFragment(node);

      // The extra loop is to work around bugs with DocumentFragments in IE.
      surpressMutations = true;
      for (var i = nodes.length - 1; i >= 0; i--) {
        node.removeChild(nodes[i]);
        nodes[i].parentNode_ = parentNode;
      }
      surpressMutations = false;

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
        nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
      }

      if (previousNode)
        previousNode.nextSibling_ = nodes[0];
      if (nextNode)
        nextNode.previousSibling_ = nodes[nodes.length - 1];

      return nodes;
    }

    var nodes = createOneElementNodeList(node);
    var oldParent = node.parentNode;
    if (oldParent) {
      // This will enqueue the mutation record for the removal as needed.
      oldParent.removeChild(node);
    }

    node.parentNode_ = parentNode;
    node.previousSibling_ = previousNode;
    node.nextSibling_ = nextNode;
    if (previousNode)
      previousNode.nextSibling_ = node;
    if (nextNode)
      nextNode.previousSibling_ = node;

    return nodes;
  }

  function collectNodesNative(node) {
    if (node instanceof DocumentFragment)
      return collectNodesForDocumentFragment(node);

    var nodes = createOneElementNodeList(node);
    var oldParent = node.parentNode;
    if (oldParent)
      enqueueRemovalForInsertedNodes(node, oldParent, nodes);
    return nodes;
  }

  function collectNodesForDocumentFragment(node) {
    var nodes = new NodeList();
    var i = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      nodes[i++] = child;
    }
    nodes.length = i;
    enqueueRemovalForInsertedDocumentFragment(node, nodes);
    return nodes;
  }

  function snapshotNodeList(nodeList) {
    // NodeLists are not live at the moment so just return the same object.
    return nodeList;
  }

  // http://dom.spec.whatwg.org/#node-is-inserted
  function nodeWasAdded(node, treeScope) {
    setTreeScope(node, treeScope);
    node.nodeIsInserted_();
  }

  function nodesWereAdded(nodes, parent) {
    var treeScope = getTreeScope(parent);
    for (var i = 0; i < nodes.length; i++) {
      nodeWasAdded(nodes[i], treeScope);
    }
  }

  // http://dom.spec.whatwg.org/#node-is-removed
  function nodeWasRemoved(node) {
    setTreeScope(node, new TreeScope(node, null));
  }

  function nodesWereRemoved(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      nodeWasRemoved(nodes[i]);
    }
  }

  function ensureSameOwnerDocument(parent, child) {
    var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ?
        parent : parent.ownerDocument;
    if (ownerDoc !== child.ownerDocument)
      ownerDoc.adoptNode(child);
  }

  function adoptNodesIfNeeded(owner, nodes) {
    if (!nodes.length)
      return;

    var ownerDoc = owner.ownerDocument;

    // All nodes have the same ownerDocument when we get here.
    if (ownerDoc === nodes[0].ownerDocument)
      return;

    for (var i = 0; i < nodes.length; i++) {
      scope.adoptNodeNoRemove(nodes[i], ownerDoc);
    }
  }

  function unwrapNodesForInsertion(owner, nodes) {
    adoptNodesIfNeeded(owner, nodes);
    var length = nodes.length;

    if (length === 1)
      return unwrap(nodes[0]);

    var df = unwrap(owner.ownerDocument.createDocumentFragment());
    for (var i = 0; i < length; i++) {
      df.appendChild(unwrap(nodes[i]));
    }
    return df;
  }

  function clearChildNodes(wrapper) {
    if (wrapper.firstChild_ !== undefined) {
      var child = wrapper.firstChild_;
      while (child) {
        var tmp = child;
        child = child.nextSibling_;
        tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;
      }
    }
    wrapper.firstChild_ = wrapper.lastChild_ = undefined;
  }

  function removeAllChildNodes(wrapper) {
    if (wrapper.invalidateShadowRenderer()) {
      var childWrapper = wrapper.firstChild;
      while (childWrapper) {
        assert(childWrapper.parentNode === wrapper);
        var nextSibling = childWrapper.nextSibling;
        var childNode = unwrap(childWrapper);
        var parentNode = childNode.parentNode;
        if (parentNode)
          originalRemoveChild.call(parentNode, childNode);
        childWrapper.previousSibling_ = childWrapper.nextSibling_ =
            childWrapper.parentNode_ = null;
        childWrapper = nextSibling;
      }
      wrapper.firstChild_ = wrapper.lastChild_ = null;
    } else {
      var node = unwrap(wrapper);
      var child = node.firstChild;
      var nextSibling;
      while (child) {
        nextSibling = child.nextSibling;
        originalRemoveChild.call(node, child);
        child = nextSibling;
      }
    }
  }

  function invalidateParent(node) {
    var p = node.parentNode;
    return p && p.invalidateShadowRenderer();
  }

  function cleanupNodes(nodes) {
    for (var i = 0, n; i < nodes.length; i++) {
      n = nodes[i];
      n.parentNode.removeChild(n);
    }
  }

  var originalImportNode = document.importNode;
  var originalCloneNode = window.Node.prototype.cloneNode;

  function cloneNode(node, deep, opt_doc) {
    var clone;
    if (opt_doc)
      clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false));
    else
      clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));

    if (deep) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        clone.appendChild(cloneNode(child, true, opt_doc));
      }

      if (node instanceof wrappers.HTMLTemplateElement) {
        var cloneContent = clone.content;
        for (var child = node.content.firstChild;
             child;
             child = child.nextSibling) {
         cloneContent.appendChild(cloneNode(child, true, opt_doc));
        }
      }
    }
    // TODO(arv): Some HTML elements also clone other data like value.
    return clone;
  }

  function contains(self, child) {
    if (!child || getTreeScope(self) !== getTreeScope(child))
      return false;

    for (var node = child; node; node = node.parentNode) {
      if (node === self)
        return true;
    }
    return false;
  }

  var OriginalNode = window.Node;

  /**
   * This represents a wrapper of a native DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   * @extends {EventTarget}
   */
  function Node(original) {
    assert(original instanceof OriginalNode);

    EventTarget.call(this, original);

    // These properties are used to override the visual references with the
    // logical ones. If the value is undefined it means that the logical is the
    // same as the visual.

    /**
     * @type {Node|undefined}
     * @private
     */
    this.parentNode_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.firstChild_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.lastChild_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.nextSibling_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.previousSibling_ = undefined;

    this.treeScope_ = undefined;
  }

  var OriginalDocumentFragment = window.DocumentFragment;
  var originalAppendChild = OriginalNode.prototype.appendChild;
  var originalCompareDocumentPosition =
      OriginalNode.prototype.compareDocumentPosition;
  var originalInsertBefore = OriginalNode.prototype.insertBefore;
  var originalRemoveChild = OriginalNode.prototype.removeChild;
  var originalReplaceChild = OriginalNode.prototype.replaceChild;

  var isIe = /Trident/.test(navigator.userAgent);

  var removeChildOriginalHelper = isIe ?
      function(parent, child) {
        try {
          originalRemoveChild.call(parent, child);
        } catch (ex) {
          if (!(parent instanceof OriginalDocumentFragment))
            throw ex;
        }
      } :
      function(parent, child) {
        originalRemoveChild.call(parent, child);
      };

  Node.prototype = Object.create(EventTarget.prototype);
  mixin(Node.prototype, {
    appendChild: function(childWrapper) {
      return this.insertBefore(childWrapper, null);
    },

    insertBefore: function(childWrapper, refWrapper) {
      assertIsNodeWrapper(childWrapper);

      var refNode;
      if (refWrapper) {
        if (isWrapper(refWrapper)) {
          refNode = unwrap(refWrapper);
        } else {
          refNode = refWrapper;
          refWrapper = wrap(refNode);
        }
      } else {
        refWrapper = null;
        refNode = null;
      }

      refWrapper && assert(refWrapper.parentNode === this);

      var nodes;
      var previousNode =
          refWrapper ? refWrapper.previousSibling : this.lastChild;

      var useNative = !this.invalidateShadowRenderer() &&
                      !invalidateParent(childWrapper);

      if (useNative)
        nodes = collectNodesNative(childWrapper);
      else
        nodes = collectNodes(childWrapper, this, previousNode, refWrapper);

      if (useNative) {
        ensureSameOwnerDocument(this, childWrapper);
        clearChildNodes(this);
        originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);
      } else {
        if (!previousNode)
          this.firstChild_ = nodes[0];
        if (!refWrapper) {
          this.lastChild_ = nodes[nodes.length - 1];
          if (this.firstChild_ === undefined)
            this.firstChild_ = this.firstChild;
        }

        var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);

        // insertBefore refWrapper no matter what the parent is?
        if (parentNode) {
          originalInsertBefore.call(parentNode,
              unwrapNodesForInsertion(this, nodes), refNode);
        } else {
          adoptNodesIfNeeded(this, nodes);
        }
      }

      enqueueMutation(this, 'childList', {
        addedNodes: nodes,
        nextSibling: refWrapper,
        previousSibling: previousNode
      });

      nodesWereAdded(nodes, this);

      return childWrapper;
    },

    removeChild: function(childWrapper) {
      assertIsNodeWrapper(childWrapper);
      if (childWrapper.parentNode !== this) {
        // IE has invalid DOM trees at times.
        var found = false;
        var childNodes = this.childNodes;
        for (var ieChild = this.firstChild; ieChild;
             ieChild = ieChild.nextSibling) {
          if (ieChild === childWrapper) {
            found = true;
            break;
          }
        }
        if (!found) {
          // TODO(arv): DOMException
          throw new Error('NotFoundError');
        }
      }

      var childNode = unwrap(childWrapper);
      var childWrapperNextSibling = childWrapper.nextSibling;
      var childWrapperPreviousSibling = childWrapper.previousSibling;

      if (this.invalidateShadowRenderer()) {
        // We need to remove the real node from the DOM before updating the
        // pointers. This is so that that mutation event is dispatched before
        // the pointers have changed.
        var thisFirstChild = this.firstChild;
        var thisLastChild = this.lastChild;

        var parentNode = childNode.parentNode;
        if (parentNode)
          removeChildOriginalHelper(parentNode, childNode);

        if (thisFirstChild === childWrapper)
          this.firstChild_ = childWrapperNextSibling;
        if (thisLastChild === childWrapper)
          this.lastChild_ = childWrapperPreviousSibling;
        if (childWrapperPreviousSibling)
          childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;
        if (childWrapperNextSibling) {
          childWrapperNextSibling.previousSibling_ =
              childWrapperPreviousSibling;
        }

        childWrapper.previousSibling_ = childWrapper.nextSibling_ =
            childWrapper.parentNode_ = undefined;
      } else {
        clearChildNodes(this);
        removeChildOriginalHelper(unsafeUnwrap(this), childNode);
      }

      if (!surpressMutations) {
        enqueueMutation(this, 'childList', {
          removedNodes: createOneElementNodeList(childWrapper),
          nextSibling: childWrapperNextSibling,
          previousSibling: childWrapperPreviousSibling
        });
      }

      registerTransientObservers(this, childWrapper);

      return childWrapper;
    },

    replaceChild: function(newChildWrapper, oldChildWrapper) {
      assertIsNodeWrapper(newChildWrapper);

      var oldChildNode;
      if (isWrapper(oldChildWrapper)) {
        oldChildNode = unwrap(oldChildWrapper);
      } else {
        oldChildNode = oldChildWrapper;
        oldChildWrapper = wrap(oldChildNode);
      }

      if (oldChildWrapper.parentNode !== this) {
        // TODO(arv): DOMException
        throw new Error('NotFoundError');
      }

      var nextNode = oldChildWrapper.nextSibling;
      var previousNode = oldChildWrapper.previousSibling;
      var nodes;

      var useNative = !this.invalidateShadowRenderer() &&
                      !invalidateParent(newChildWrapper);

      if (useNative) {
        nodes = collectNodesNative(newChildWrapper);
      } else {
        if (nextNode === newChildWrapper)
          nextNode = newChildWrapper.nextSibling;
        nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);
      }

      if (!useNative) {
        if (this.firstChild === oldChildWrapper)
          this.firstChild_ = nodes[0];
        if (this.lastChild === oldChildWrapper)
          this.lastChild_ = nodes[nodes.length - 1];

        oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ =
            oldChildWrapper.parentNode_ = undefined;

        // replaceChild no matter what the parent is?
        if (oldChildNode.parentNode) {
          originalReplaceChild.call(
              oldChildNode.parentNode,
              unwrapNodesForInsertion(this, nodes),
              oldChildNode);
        }
      } else {
        ensureSameOwnerDocument(this, newChildWrapper);
        clearChildNodes(this);
        originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper),
                                  oldChildNode);
      }

      enqueueMutation(this, 'childList', {
        addedNodes: nodes,
        removedNodes: createOneElementNodeList(oldChildWrapper),
        nextSibling: nextNode,
        previousSibling: previousNode
      });

      nodeWasRemoved(oldChildWrapper);
      nodesWereAdded(nodes, this);

      return oldChildWrapper;
    },

    /**
     * Called after a node was inserted. Subclasses override this to invalidate
     * the renderer as needed.
     * @private
     */
    nodeIsInserted_: function() {
      for (var child = this.firstChild; child; child = child.nextSibling) {
        child.nodeIsInserted_();
      }
    },

    hasChildNodes: function() {
      return this.firstChild !== null;
    },

    /** @type {Node} */
    get parentNode() {
      // If the parentNode has not been overridden, use the original parentNode.
      return this.parentNode_ !== undefined ?
          this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);
    },

    /** @type {Node} */
    get firstChild() {
      return this.firstChild_ !== undefined ?
          this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);
    },

    /** @type {Node} */
    get lastChild() {
      return this.lastChild_ !== undefined ?
          this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);
    },

    /** @type {Node} */
    get nextSibling() {
      return this.nextSibling_ !== undefined ?
          this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);
    },

    /** @type {Node} */
    get previousSibling() {
      return this.previousSibling_ !== undefined ?
          this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling);
    },

    get parentElement() {
      var p = this.parentNode;
      while (p && p.nodeType !== Node.ELEMENT_NODE) {
        p = p.parentNode;
      }
      return p;
    },

    get textContent() {
      // TODO(arv): This should fallback to unsafeUnwrap(this).textContent if there
      // are no shadow trees below or above the context node.
      var s = '';
      for (var child = this.firstChild; child; child = child.nextSibling) {
        if (child.nodeType != Node.COMMENT_NODE) {
          s += child.textContent;
        }
      }
      return s;
    },
    set textContent(textContent) {
      var removedNodes = snapshotNodeList(this.childNodes);

      if (this.invalidateShadowRenderer()) {
        removeAllChildNodes(this);
        if (textContent !== '') {
          var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);
          this.appendChild(textNode);
        }
      } else {
        clearChildNodes(this);
        unsafeUnwrap(this).textContent = textContent;
      }

      var addedNodes = snapshotNodeList(this.childNodes);

      enqueueMutation(this, 'childList', {
        addedNodes: addedNodes,
        removedNodes: removedNodes
      });

      nodesWereRemoved(removedNodes);
      nodesWereAdded(addedNodes, this);
    },

    get childNodes() {
      var wrapperList = new NodeList();
      var i = 0;
      for (var child = this.firstChild; child; child = child.nextSibling) {
        wrapperList[i++] = child;
      }
      wrapperList.length = i;
      return wrapperList;
    },

    cloneNode: function(deep) {
      return cloneNode(this, deep);
    },

    contains: function(child) {
      return contains(this, wrapIfNeeded(child));
    },

    compareDocumentPosition: function(otherNode) {
      // This only wraps, it therefore only operates on the composed DOM and not
      // the logical DOM.
      return originalCompareDocumentPosition.call(unsafeUnwrap(this),
                                                  unwrapIfNeeded(otherNode));
    },

    normalize: function() {
      var nodes = snapshotNodeList(this.childNodes);
      var remNodes = [];
      var s = '';
      var modNode;

      for (var i = 0, n; i < nodes.length; i++) {
        n = nodes[i];
        if (n.nodeType === Node.TEXT_NODE) {
          if (!modNode && !n.data.length)
            this.removeNode(n);
          else if (!modNode)
            modNode = n;
          else {
            s += n.data;
            remNodes.push(n);
          }
        } else {
          if (modNode && remNodes.length) {
            modNode.data += s;
            cleanupNodes(remNodes);
          }
          remNodes = [];
          s = '';
          modNode = null;
          if (n.childNodes.length)
            n.normalize();
        }
      }

      // handle case where >1 text nodes are the last children
      if (modNode && remNodes.length) {
        modNode.data += s;
        cleanupNodes(remNodes);
      }
    }
  });

  defineWrapGetter(Node, 'ownerDocument');

  // We use a DocumentFragment as a base and then delete the properties of
  // DocumentFragment.prototype from the wrapper Node. Since delete makes
  // objects slow in some JS engines we recreate the prototype object.
  registerWrapper(OriginalNode, Node, document.createDocumentFragment());
  delete Node.prototype.querySelector;
  delete Node.prototype.querySelectorAll;
  Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);

  scope.cloneNode = cloneNode;
  scope.nodeWasAdded = nodeWasAdded;
  scope.nodeWasRemoved = nodeWasRemoved;
  scope.nodesWereAdded = nodesWereAdded;
  scope.nodesWereRemoved = nodesWereRemoved;
  scope.snapshotNodeList = snapshotNodeList;
  scope.wrappers.Node = Node;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLCollection = scope.wrappers.HTMLCollection;
  var NodeList = scope.wrappers.NodeList;
  var getTreeScope = scope.getTreeScope;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var originalDocumentQuerySelector = document.querySelector;
  var originalElementQuerySelector = document.documentElement.querySelector;

  var originalDocumentQuerySelectorAll = document.querySelectorAll;
  var originalElementQuerySelectorAll = document.documentElement.querySelectorAll;

  var originalDocumentGetElementsByTagName = document.getElementsByTagName;
  var originalElementGetElementsByTagName = document.documentElement.getElementsByTagName;

  var originalDocumentGetElementsByTagNameNS = document.getElementsByTagNameNS;
  var originalElementGetElementsByTagNameNS = document.documentElement.getElementsByTagNameNS;

  var OriginalElement = window.Element;
  var OriginalDocument = window.HTMLDocument || window.Document;

  function filterNodeList(list, index, result, deep) {
    var wrappedItem = null;
    var root = null;
    for (var i = 0, length = list.length; i < length; i++) {
      wrappedItem = wrap(list[i]);
      if (!deep && (root = getTreeScope(wrappedItem).root)) {
        if (root instanceof scope.wrappers.ShadowRoot) {
          continue;
        }
      }
      result[index++] = wrappedItem;
    }

    return index;
  }

  function shimSelector(selector) {
    return String(selector).replace(/\/deep\//g, ' ');
  }

  function findOne(node, selector) {
    var m, el = node.firstElementChild;
    while (el) {
      if (el.matches(selector))
        return el;
      m = findOne(el, selector);
      if (m)
        return m;
      el = el.nextElementSibling;
    }
    return null;
  }

  function matchesSelector(el, selector) {
    return el.matches(selector);
  }

  var XHTML_NS = 'http://www.w3.org/1999/xhtml';

  function matchesTagName(el, localName, localNameLowerCase) {
    var ln = el.localName;
    return ln === localName ||
        ln === localNameLowerCase && el.namespaceURI === XHTML_NS;
  }

  function matchesEveryThing() {
    return true;
  }

  function matchesLocalNameOnly(el, ns, localName) {
    return el.localName === localName;
  }

  function matchesNameSpace(el, ns) {
    return el.namespaceURI === ns;
  }

  function matchesLocalNameNS(el, ns, localName) {
    return el.namespaceURI === ns && el.localName === localName;
  }

  function findElements(node, index, result, p, arg0, arg1) {
    var el = node.firstElementChild;
    while (el) {
      if (p(el, arg0, arg1))
        result[index++] = el;
      index = findElements(el, index, result, p, arg0, arg1);
      el = el.nextElementSibling;
    }
    return index;
  }

  // find and findAll will only match Simple Selectors,
  // Structural Pseudo Classes are not guarenteed to be correct
  // http://www.w3.org/TR/css3-selectors/#simple-selectors

  function querySelectorAllFiltered(p, index, result, selector, deep) {
    var target = unsafeUnwrap(this);
    var list;
    var root = getTreeScope(this).root;
    if (root instanceof scope.wrappers.ShadowRoot) {
      // We are in the shadow tree and the logical tree is
      // going to be disconnected so we do a manual tree traversal
      return findElements(this, index, result, p, selector, null);
    } else if (target instanceof OriginalElement) {
      list = originalElementQuerySelectorAll.call(target, selector);
    } else if (target instanceof OriginalDocument) {
      list = originalDocumentQuerySelectorAll.call(target, selector);
    } else {
      // When we get a ShadowRoot the logical tree is going to be disconnected
      // so we do a manual tree traversal
      return findElements(this, index, result, p, selector, null);
    }

    return filterNodeList(list, index, result, deep);
  }

  var SelectorsInterface = {
    querySelector: function(selector) {
      var shimmed = shimSelector(selector);
      var deep = shimmed !== selector;
      selector = shimmed;

      var target = unsafeUnwrap(this);
      var wrappedItem;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        // We are in the shadow tree and the logical tree is
        // going to be disconnected so we do a manual tree traversal
        return findOne(this, selector);
      } else if (target instanceof OriginalElement) {
        wrappedItem = wrap(originalElementQuerySelector.call(target, selector));
      } else if (target instanceof OriginalDocument) {
        wrappedItem = wrap(originalDocumentQuerySelector.call(target, selector));
      } else {
        // When we get a ShadowRoot the logical tree is going to be disconnected
        // so we do a manual tree traversal
        return findOne(this, selector);
      }

      if (!wrappedItem) {
        // When the original query returns nothing
        // we return nothing (to be consistent with the other wrapped calls)
        return wrappedItem;
      } else if (!deep && (root = getTreeScope(wrappedItem).root)) {
        if (root instanceof scope.wrappers.ShadowRoot) {
          // When the original query returns an element in the ShadowDOM
          // we must do a manual tree traversal
          return findOne(this, selector);
        }
      }

      return wrappedItem;
    },
    querySelectorAll: function(selector) {
      var shimmed = shimSelector(selector);
      var deep = shimmed !== selector;
      selector = shimmed;

      var result = new NodeList();

      result.length = querySelectorAllFiltered.call(this,
          matchesSelector,
          0,
          result,
          selector,
          deep);

      return result;
    }
  };

  function getElementsByTagNameFiltered(p, index, result, localName,
                                        lowercase) {
    var target = unsafeUnwrap(this);
    var list;
    var root = getTreeScope(this).root;
    if (root instanceof scope.wrappers.ShadowRoot) {
      // We are in the shadow tree and the logical tree is
      // going to be disconnected so we do a manual tree traversal
      return findElements(this, index, result, p, localName, lowercase);
    } else if (target instanceof OriginalElement) {
      list = originalElementGetElementsByTagName.call(target, localName,
                                                      lowercase);
    } else if (target instanceof OriginalDocument) {
      list = originalDocumentGetElementsByTagName.call(target, localName,
                                                       lowercase);
    } else {
      // When we get a ShadowRoot the logical tree is going to be disconnected
      // so we do a manual tree traversal
      return findElements(this, index, result, p, localName, lowercase);
    }

    return filterNodeList(list, index, result, false);
  }

  function getElementsByTagNameNSFiltered(p, index, result, ns, localName) {
    var target = unsafeUnwrap(this);
    var list;
    var root = getTreeScope(this).root;
    if (root instanceof scope.wrappers.ShadowRoot) {
      // We are in the shadow tree and the logical tree is
      // going to be disconnected so we do a manual tree traversal
      return findElements(this, index, result, p, ns, localName);
    } else if (target instanceof OriginalElement) {
      list = originalElementGetElementsByTagNameNS.call(target, ns, localName);
    } else if (target instanceof OriginalDocument) {
      list = originalDocumentGetElementsByTagNameNS.call(target, ns, localName);
    } else {
      // When we get a ShadowRoot the logical tree is going to be disconnected
      // so we do a manual tree traversal
      return findElements(this, index, result, p, ns, localName);
    }

    return filterNodeList(list, index, result, false);
  }

  var GetElementsByInterface = {
    getElementsByTagName: function(localName) {
      var result = new HTMLCollection();
      var match = localName === '*' ? matchesEveryThing : matchesTagName;

      result.length = getElementsByTagNameFiltered.call(this,
          match,
          0,
          result,
          localName,
          localName.toLowerCase());

      return result;
    },

    getElementsByClassName: function(className) {
      // TODO(arv): Check className?
      return this.querySelectorAll('.' + className);
    },

    getElementsByTagNameNS: function(ns, localName) {
      var result = new HTMLCollection();
      var match = null;

      if (ns === '*') {
        match = localName === '*' ? matchesEveryThing : matchesLocalNameOnly;
      } else {
        match = localName === '*' ? matchesNameSpace : matchesLocalNameNS;
      }

      result.length = getElementsByTagNameNSFiltered.call(this,
          match,
          0,
          result,
          ns || null,
          localName);

      return result;
    }
  };

  scope.GetElementsByInterface = GetElementsByInterface;
  scope.SelectorsInterface = SelectorsInterface;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var NodeList = scope.wrappers.NodeList;

  function forwardElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.nextSibling;
    }
    return node;
  }

  function backwardsElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.previousSibling;
    }
    return node;
  }

  var ParentNodeInterface = {
    get firstElementChild() {
      return forwardElement(this.firstChild);
    },

    get lastElementChild() {
      return backwardsElement(this.lastChild);
    },

    get childElementCount() {
      var count = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        count++;
      }
      return count;
    },

    get children() {
      var wrapperList = new NodeList();
      var i = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        wrapperList[i++] = child;
      }
      wrapperList.length = i;
      return wrapperList;
    },

    remove: function() {
      var p = this.parentNode;
      if (p)
        p.removeChild(this);
    }
  };

  var ChildNodeInterface = {
    get nextElementSibling() {
      return forwardElement(this.nextSibling);
    },

    get previousElementSibling() {
      return backwardsElement(this.previousSibling);
    }
  };

  scope.ChildNodeInterface = ChildNodeInterface;
  scope.ParentNodeInterface = ParentNodeInterface;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var Node = scope.wrappers.Node;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;

  var OriginalCharacterData = window.CharacterData;

  function CharacterData(node) {
    Node.call(this, node);
  }
  CharacterData.prototype = Object.create(Node.prototype);
  mixin(CharacterData.prototype, {
    get textContent() {
      return this.data;
    },
    set textContent(value) {
      this.data = value;
    },
    get data() {
      return unsafeUnwrap(this).data;
    },
    set data(value) {
      var oldValue = unsafeUnwrap(this).data;
      enqueueMutation(this, 'characterData', {
        oldValue: oldValue
      });
      unsafeUnwrap(this).data = value;
    }
  });

  mixin(CharacterData.prototype, ChildNodeInterface);

  registerWrapper(OriginalCharacterData, CharacterData,
                  document.createTextNode(''));

  scope.wrappers.CharacterData = CharacterData;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var CharacterData = scope.wrappers.CharacterData;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  function toUInt32(x) {
    return x >>> 0;
  }

  var OriginalText = window.Text;

  function Text(node) {
    CharacterData.call(this, node);
  }
  Text.prototype = Object.create(CharacterData.prototype);
  mixin(Text.prototype, {
    splitText: function(offset) {
      offset = toUInt32(offset);
      var s = this.data;
      if (offset > s.length)
        throw new Error('IndexSizeError');
      var head = s.slice(0, offset);
      var tail = s.slice(offset);
      this.data = head;
      var newTextNode = this.ownerDocument.createTextNode(tail);
      if (this.parentNode)
        this.parentNode.insertBefore(newTextNode, this.nextSibling);
      return newTextNode;
    }
  });

  registerWrapper(OriginalText, Text, document.createTextNode(''));

  scope.wrappers.Text = Text;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;

  function invalidateClass(el) {
    scope.invalidateRendererBasedOnAttribute(el, 'class');
  }

  function DOMTokenList(impl, ownerElement) {
    setWrapper(impl, this);
    this.ownerElement_ = ownerElement;
  }

  DOMTokenList.prototype = {
    constructor: DOMTokenList,
    get length() {
      return unsafeUnwrap(this).length;
    },
    item: function(index) {
      return unsafeUnwrap(this).item(index);
    },
    contains: function(token) {
      return unsafeUnwrap(this).contains(token);
    },
    add: function() {
      unsafeUnwrap(this).add.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
    },
    remove: function() {
      unsafeUnwrap(this).remove.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
    },
    toggle: function(token) {
      var rv = unsafeUnwrap(this).toggle.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
      return rv;
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  scope.wrappers.DOMTokenList = DOMTokenList;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var GetElementsByInterface = scope.GetElementsByInterface;
  var Node = scope.wrappers.Node;
  var DOMTokenList = scope.wrappers.DOMTokenList;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var addWrapNodeListMethod = scope.addWrapNodeListMethod;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var oneOf = scope.oneOf;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrappers = scope.wrappers;

  var OriginalElement = window.Element;

  var matchesNames = [
    'matches',  // needs to come first.
    'mozMatchesSelector',
    'msMatchesSelector',
    'webkitMatchesSelector',
  ].filter(function(name) {
    return OriginalElement.prototype[name];
  });

  var matchesName = matchesNames[0];

  var originalMatches = OriginalElement.prototype[matchesName];

  function invalidateRendererBasedOnAttribute(element, name) {
    // Only invalidate if parent node is a shadow host.
    var p = element.parentNode;
    if (!p || !p.shadowRoot)
      return;

    var renderer = scope.getRendererForHost(p);
    if (renderer.dependsOnAttribute(name))
      renderer.invalidate();
  }

  function enqueAttributeChange(element, name, oldValue) {
    // This is not fully spec compliant. We should use localName (which might
    // have a different case than name) and the namespace (which requires us
    // to get the Attr object).
    enqueueMutation(element, 'attributes', {
      name: name,
      namespace: null,
      oldValue: oldValue
    });
  }

  var classListTable = new WeakMap();

  function Element(node) {
    Node.call(this, node);
  }
  Element.prototype = Object.create(Node.prototype);
  mixin(Element.prototype, {
    createShadowRoot: function() {
      var newShadowRoot = new wrappers.ShadowRoot(this);
      unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;

      var renderer = scope.getRendererForHost(this);
      renderer.invalidate();

      return newShadowRoot;
    },

    get shadowRoot() {
      return unsafeUnwrap(this).polymerShadowRoot_ || null;
    },

    // getDestinationInsertionPoints added in ShadowRenderer.js

    setAttribute: function(name, value) {
      var oldValue = unsafeUnwrap(this).getAttribute(name);
      unsafeUnwrap(this).setAttribute(name, value);
      enqueAttributeChange(this, name, oldValue);
      invalidateRendererBasedOnAttribute(this, name);
    },

    removeAttribute: function(name) {
      var oldValue = unsafeUnwrap(this).getAttribute(name);
      unsafeUnwrap(this).removeAttribute(name);
      enqueAttributeChange(this, name, oldValue);
      invalidateRendererBasedOnAttribute(this, name);
    },

    matches: function(selector) {
      return originalMatches.call(unsafeUnwrap(this), selector);
    },

    get classList() {
      var list = classListTable.get(this);
      if (!list) {
        classListTable.set(this,
            list = new DOMTokenList(unsafeUnwrap(this).classList, this));
      }
      return list;
    },

    get className() {
      return unsafeUnwrap(this).className;
    },

    set className(v) {
      this.setAttribute('class', v);
    },

    get id() {
      return unsafeUnwrap(this).id;
    },

    set id(v) {
      this.setAttribute('id', v);
    }
  });

  matchesNames.forEach(function(name) {
    if (name !== 'matches') {
      Element.prototype[name] = function(selector) {
        return this.matches(selector);
      };
    }
  });

  if (OriginalElement.prototype.webkitCreateShadowRoot) {
    Element.prototype.webkitCreateShadowRoot =
        Element.prototype.createShadowRoot;
  }

  mixin(Element.prototype, ChildNodeInterface);
  mixin(Element.prototype, GetElementsByInterface);
  mixin(Element.prototype, ParentNodeInterface);
  mixin(Element.prototype, SelectorsInterface);

  registerWrapper(OriginalElement, Element,
                  document.createElementNS(null, 'x'));

  scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;
  scope.matchesNames = matchesNames;
  scope.wrappers.Element = Element;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var Element = scope.wrappers.Element;
  var defineGetter = scope.defineGetter;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var nodesWereAdded = scope.nodesWereAdded;
  var nodesWereRemoved = scope.nodesWereRemoved;
  var registerWrapper = scope.registerWrapper;
  var snapshotNodeList = scope.snapshotNodeList;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrappers = scope.wrappers;

  /////////////////////////////////////////////////////////////////////////////
  // innerHTML and outerHTML

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
  var escapeAttrRegExp = /[&\u00A0"]/g;
  var escapeDataRegExp = /[&\u00A0<>]/g;

  function escapeReplace(c) {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;'
      case '\u00A0':
        return '&nbsp;';
    }
  }

  function escapeAttr(s) {
    return s.replace(escapeAttrRegExp, escapeReplace);
  }

  function escapeData(s) {
    return s.replace(escapeDataRegExp, escapeReplace);
  }

  function makeSet(arr) {
    var set = {};
    for (var i = 0; i < arr.length; i++) {
      set[arr[i]] = true;
    }
    return set;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/#void-elements
  var voidElements = makeSet([
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ]);

  var plaintextParents = makeSet([
    'style',
    'script',
    'xmp',
    'iframe',
    'noembed',
    'noframes',
    'plaintext',
    'noscript'
  ]);

  function getOuterHTML(node, parentNode) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        var tagName = node.tagName.toLowerCase();
        var s = '<' + tagName;
        var attrs = node.attributes;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
        }
        s += '>';
        if (voidElements[tagName])
          return s;

        return s + getInnerHTML(node) + '</' + tagName + '>';

      case Node.TEXT_NODE:
        var data = node.data;
        if (parentNode && plaintextParents[parentNode.localName])
          return data;
        return escapeData(data);

      case Node.COMMENT_NODE:
        return '<!--' + node.data + '-->';

      default:
        console.error(node);
        throw new Error('not implemented');
    }
  }

  function getInnerHTML(node) {
    if (node instanceof wrappers.HTMLTemplateElement)
      node = node.content;

    var s = '';
    for (var child = node.firstChild; child; child = child.nextSibling) {
      s += getOuterHTML(child, node);
    }
    return s;
  }

  function setInnerHTML(node, value, opt_tagName) {
    var tagName = opt_tagName || 'div';
    node.textContent = '';
    var tempElement = unwrap(node.ownerDocument.createElement(tagName));
    tempElement.innerHTML = value;
    var firstChild;
    while (firstChild = tempElement.firstChild) {
      node.appendChild(wrap(firstChild));
    }
  }

  // IE11 does not have MSIE in the user agent string.
  var oldIe = /MSIE/.test(navigator.userAgent);

  var OriginalHTMLElement = window.HTMLElement;
  var OriginalHTMLTemplateElement = window.HTMLTemplateElement;

  function HTMLElement(node) {
    Element.call(this, node);
  }
  HTMLElement.prototype = Object.create(Element.prototype);
  mixin(HTMLElement.prototype, {
    get innerHTML() {
      return getInnerHTML(this);
    },
    set innerHTML(value) {
      // IE9 does not handle set innerHTML correctly on plaintextParents. It
      // creates element children. For example
      //
      //   scriptElement.innerHTML = '<a>test</a>'
      //
      // Creates a single HTMLAnchorElement child.
      if (oldIe && plaintextParents[this.localName]) {
        this.textContent = value;
        return;
      }

      var removedNodes = snapshotNodeList(this.childNodes);

      if (this.invalidateShadowRenderer()) {
        if (this instanceof wrappers.HTMLTemplateElement)
          setInnerHTML(this.content, value);
        else
          setInnerHTML(this, value, this.tagName);

      // If we have a non native template element we need to handle this
      // manually since setting impl.innerHTML would add the html as direct
      // children and not be moved over to the content fragment.
      } else if (!OriginalHTMLTemplateElement &&
                 this instanceof wrappers.HTMLTemplateElement) {
        setInnerHTML(this.content, value);
      } else {
        unsafeUnwrap(this).innerHTML = value;
      }

      var addedNodes = snapshotNodeList(this.childNodes);

      enqueueMutation(this, 'childList', {
        addedNodes: addedNodes,
        removedNodes: removedNodes
      });

      nodesWereRemoved(removedNodes);
      nodesWereAdded(addedNodes, this);
    },

    get outerHTML() {
      return getOuterHTML(this, this.parentNode);
    },
    set outerHTML(value) {
      var p = this.parentNode;
      if (p) {
        p.invalidateShadowRenderer();
        var df = frag(p, value);
        p.replaceChild(df, this);
      }
    },

    insertAdjacentHTML: function(position, text) {
      var contextElement, refNode;
      switch (String(position).toLowerCase()) {
        case 'beforebegin':
          contextElement = this.parentNode;
          refNode = this;
          break;
        case 'afterend':
          contextElement = this.parentNode;
          refNode = this.nextSibling;
          break;
        case 'afterbegin':
          contextElement = this;
          refNode = this.firstChild;
          break;
        case 'beforeend':
          contextElement = this;
          refNode = null;
          break;
        default:
          return;
      }

      var df = frag(contextElement, text);
      contextElement.insertBefore(df, refNode);
    },

    get hidden() {
      return this.hasAttribute('hidden');
    },
    set hidden(v) {
      if (v) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    }
  });

  function frag(contextElement, html) {
    // TODO(arv): This does not work with SVG and other non HTML elements.
    var p = unwrap(contextElement.cloneNode(false));
    p.innerHTML = html;
    var df = unwrap(document.createDocumentFragment());
    var c;
    while (c = p.firstChild) {
      df.appendChild(c);
    }
    return wrap(df);
  }

  function getter(name) {
    return function() {
      scope.renderAllPending();
      return unsafeUnwrap(this)[name];
    };
  }

  function getterRequiresRendering(name) {
    defineGetter(HTMLElement, name, getter(name));
  }

  [
    'clientHeight',
    'clientLeft',
    'clientTop',
    'clientWidth',
    'offsetHeight',
    'offsetLeft',
    'offsetTop',
    'offsetWidth',
    'scrollHeight',
    'scrollWidth',
  ].forEach(getterRequiresRendering);

  function getterAndSetterRequiresRendering(name) {
    Object.defineProperty(HTMLElement.prototype, name, {
      get: getter(name),
      set: function(v) {
        scope.renderAllPending();
        unsafeUnwrap(this)[name] = v;
      },
      configurable: true,
      enumerable: true
    });
  }

  [
    'scrollLeft',
    'scrollTop',
  ].forEach(getterAndSetterRequiresRendering);

  function methodRequiresRendering(name) {
    Object.defineProperty(HTMLElement.prototype, name, {
      value: function() {
        scope.renderAllPending();
        return unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments);
      },
      configurable: true,
      enumerable: true
    });
  }

  [
    'getBoundingClientRect',
    'getClientRects',
    'scrollIntoView'
  ].forEach(methodRequiresRendering);

  // HTMLElement is abstract so we use a subclass that has no members.
  registerWrapper(OriginalHTMLElement, HTMLElement,
                  document.createElement('b'));

  scope.wrappers.HTMLElement = HTMLElement;

  // TODO: Find a better way to share these two with WrapperShadowRoot.
  scope.getInnerHTML = getInnerHTML;
  scope.setInnerHTML = setInnerHTML
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var OriginalHTMLCanvasElement = window.HTMLCanvasElement;

  function HTMLCanvasElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);

  mixin(HTMLCanvasElement.prototype, {
    getContext: function() {
      var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);
      return context && wrap(context);
    }
  });

  registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement,
                  document.createElement('canvas'));

  scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var OriginalHTMLContentElement = window.HTMLContentElement;

  function HTMLContentElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLContentElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLContentElement.prototype, {
    constructor: HTMLContentElement,

    get select() {
      return this.getAttribute('select');
    },
    set select(value) {
      this.setAttribute('select', value);
    },

    setAttribute: function(n, v) {
      HTMLElement.prototype.setAttribute.call(this, n, v);
      if (String(n).toLowerCase() === 'select')
        this.invalidateShadowRenderer(true);
    }

    // getDistributedNodes is added in ShadowRenderer
  });

  if (OriginalHTMLContentElement)
    registerWrapper(OriginalHTMLContentElement, HTMLContentElement);

  scope.wrappers.HTMLContentElement = HTMLContentElement;
})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var wrapHTMLCollection = scope.wrapHTMLCollection;
  var unwrap = scope.unwrap;

  var OriginalHTMLFormElement = window.HTMLFormElement;

  function HTMLFormElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLFormElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLFormElement.prototype, {
    get elements() {
      // Note: technically this should be an HTMLFormControlsCollection, but
      // that inherits from HTMLCollection, so should be good enough. Spec:
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-dom-interfaces.html#htmlformcontrolscollection
      return wrapHTMLCollection(unwrap(this).elements);
    }
  });

  registerWrapper(OriginalHTMLFormElement, HTMLFormElement,
                  document.createElement('form'));

  scope.wrappers.HTMLFormElement = HTMLFormElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var rewrap = scope.rewrap;

  var OriginalHTMLImageElement = window.HTMLImageElement;

  function HTMLImageElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLImageElement.prototype = Object.create(HTMLElement.prototype);

  registerWrapper(OriginalHTMLImageElement, HTMLImageElement,
                  document.createElement('img'));

  function Image(width, height) {
    if (!(this instanceof Image)) {
      throw new TypeError(
          'DOM object constructor cannot be called as a function.');
    }

    var node = unwrap(document.createElement('img'));
    HTMLElement.call(this, node);
    rewrap(node, this);

    if (width !== undefined)
      node.width = width;
    if (height !== undefined)
      node.height = height;
  }

  Image.prototype = HTMLImageElement.prototype;

  scope.wrappers.HTMLImageElement = HTMLImageElement;
  scope.wrappers.Image = Image;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var NodeList = scope.wrappers.NodeList;
  var registerWrapper = scope.registerWrapper;

  var OriginalHTMLShadowElement = window.HTMLShadowElement;

  function HTMLShadowElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);
  HTMLShadowElement.prototype.constructor = HTMLShadowElement;

  // getDistributedNodes is added in ShadowRenderer

  if (OriginalHTMLShadowElement)
    registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);

  scope.wrappers.HTMLShadowElement = HTMLShadowElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var contentTable = new WeakMap();
  var templateContentsOwnerTable = new WeakMap();

  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html#dfn-template-contents-owner
  function getTemplateContentsOwner(doc) {
    if (!doc.defaultView)
      return doc;
    var d = templateContentsOwnerTable.get(doc);
    if (!d) {
      // TODO(arv): This should either be a Document or HTMLDocument depending
      // on doc.
      d = doc.implementation.createHTMLDocument('');
      while (d.lastChild) {
        d.removeChild(d.lastChild);
      }
      templateContentsOwnerTable.set(doc, d);
    }
    return d;
  }

  function extractContent(templateElement) {
    // templateElement is not a wrapper here.
    var doc = getTemplateContentsOwner(templateElement.ownerDocument);
    var df = unwrap(doc.createDocumentFragment());
    var child;
    while (child = templateElement.firstChild) {
      df.appendChild(child);
    }
    return df;
  }

  var OriginalHTMLTemplateElement = window.HTMLTemplateElement;

  function HTMLTemplateElement(node) {
    HTMLElement.call(this, node);
    if (!OriginalHTMLTemplateElement) {
      var content = extractContent(node);
      contentTable.set(this, wrap(content));
    }
  }
  HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);

  mixin(HTMLTemplateElement.prototype, {
    constructor: HTMLTemplateElement,
    get content() {
      if (OriginalHTMLTemplateElement)
        return wrap(unsafeUnwrap(this).content);
      return contentTable.get(this);
    },

    // TODO(arv): cloneNode needs to clone content.

  });

  if (OriginalHTMLTemplateElement)
    registerWrapper(OriginalHTMLTemplateElement, HTMLTemplateElement);

  scope.wrappers.HTMLTemplateElement = HTMLTemplateElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var registerWrapper = scope.registerWrapper;

  var OriginalHTMLMediaElement = window.HTMLMediaElement;

  if (!OriginalHTMLMediaElement) return;

  function HTMLMediaElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLMediaElement.prototype = Object.create(HTMLElement.prototype);

  registerWrapper(OriginalHTMLMediaElement, HTMLMediaElement,
                  document.createElement('audio'));

  scope.wrappers.HTMLMediaElement = HTMLMediaElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLMediaElement = scope.wrappers.HTMLMediaElement;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var rewrap = scope.rewrap;

  var OriginalHTMLAudioElement = window.HTMLAudioElement;

  if (!OriginalHTMLAudioElement) return;

  function HTMLAudioElement(node) {
    HTMLMediaElement.call(this, node);
  }
  HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);

  registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement,
                  document.createElement('audio'));

  function Audio(src) {
    if (!(this instanceof Audio)) {
      throw new TypeError(
          'DOM object constructor cannot be called as a function.');
    }

    var node = unwrap(document.createElement('audio'));
    HTMLMediaElement.call(this, node);
    rewrap(node, this);

    node.setAttribute('preload', 'auto');
    if (src !== undefined)
      node.setAttribute('src', src);
  }

  Audio.prototype = HTMLAudioElement.prototype;

  scope.wrappers.HTMLAudioElement = HTMLAudioElement;
  scope.wrappers.Audio = Audio;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var rewrap = scope.rewrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLOptionElement = window.HTMLOptionElement;

  function trimText(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function HTMLOptionElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLOptionElement.prototype, {
    get text() {
      return trimText(this.textContent);
    },
    set text(value) {
      this.textContent = trimText(String(value));
    },
    get form() {
      return wrap(unwrap(this).form);
    }
  });

  registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement,
                  document.createElement('option'));

  function Option(text, value, defaultSelected, selected) {
    if (!(this instanceof Option)) {
      throw new TypeError(
          'DOM object constructor cannot be called as a function.');
    }

    var node = unwrap(document.createElement('option'));
    HTMLElement.call(this, node);
    rewrap(node, this);

    if (text !== undefined)
      node.text = text;
    if (value !== undefined)
      node.setAttribute('value', value);
    if (defaultSelected === true)
      node.setAttribute('selected', '');
    node.selected = selected === true;
  }

  Option.prototype = HTMLOptionElement.prototype;

  scope.wrappers.HTMLOptionElement = HTMLOptionElement;
  scope.wrappers.Option = Option;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLSelectElement = window.HTMLSelectElement;

  function HTMLSelectElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLSelectElement.prototype, {
    add: function(element, before) {
      if (typeof before === 'object')  // also includes null
        before = unwrap(before);
      unwrap(this).add(unwrap(element), before);
    },

    remove: function(indexOrNode) {
      // Spec only allows index but implementations allow index or node.
      // remove() is also allowed which is same as remove(undefined)
      if (indexOrNode === undefined) {
        HTMLElement.prototype.remove.call(this);
        return;
      }

      if (typeof indexOrNode === 'object')
        indexOrNode = unwrap(indexOrNode);

      unwrap(this).remove(indexOrNode);
    },

    get form() {
      return wrap(unwrap(this).form);
    }
  });

  registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement,
                  document.createElement('select'));

  scope.wrappers.HTMLSelectElement = HTMLSelectElement;
})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrapHTMLCollection = scope.wrapHTMLCollection;

  var OriginalHTMLTableElement = window.HTMLTableElement;

  function HTMLTableElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableElement.prototype, {
    get caption() {
      return wrap(unwrap(this).caption);
    },
    createCaption: function() {
      return wrap(unwrap(this).createCaption());
    },

    get tHead() {
      return wrap(unwrap(this).tHead);
    },
    createTHead: function() {
      return wrap(unwrap(this).createTHead());
    },

    createTFoot: function() {
      return wrap(unwrap(this).createTFoot());
    },
    get tFoot() {
      return wrap(unwrap(this).tFoot);
    },

    get tBodies() {
      return wrapHTMLCollection(unwrap(this).tBodies);
    },
    createTBody: function() {
      return wrap(unwrap(this).createTBody());
    },

    get rows() {
      return wrapHTMLCollection(unwrap(this).rows);
    },
    insertRow: function(index) {
      return wrap(unwrap(this).insertRow(index));
    }
  });

  registerWrapper(OriginalHTMLTableElement, HTMLTableElement,
                  document.createElement('table'));

  scope.wrappers.HTMLTableElement = HTMLTableElement;
})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var wrapHTMLCollection = scope.wrapHTMLCollection;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;

  function HTMLTableSectionElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableSectionElement.prototype, {
    constructor: HTMLTableSectionElement,
    get rows() {
      return wrapHTMLCollection(unwrap(this).rows);
    },
    insertRow: function(index) {
      return wrap(unwrap(this).insertRow(index));
    }
  });

  registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement,
                  document.createElement('thead'));

  scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;
})(window.ShadowDOMPolyfill);

/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var wrapHTMLCollection = scope.wrapHTMLCollection;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLTableRowElement = window.HTMLTableRowElement;

  function HTMLTableRowElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableRowElement.prototype, {
    get cells() {
      return wrapHTMLCollection(unwrap(this).cells);
    },

    insertCell: function(index) {
      return wrap(unwrap(this).insertCell(index));
    }
  });

  registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement,
                  document.createElement('tr'));

  scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLContentElement = scope.wrappers.HTMLContentElement;
  var HTMLElement = scope.wrappers.HTMLElement;
  var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
  var HTMLTemplateElement = scope.wrappers.HTMLTemplateElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;

  var OriginalHTMLUnknownElement = window.HTMLUnknownElement;

  function HTMLUnknownElement(node) {
    switch (node.localName) {
      case 'content':
        return new HTMLContentElement(node);
      case 'shadow':
        return new HTMLShadowElement(node);
      case 'template':
        return new HTMLTemplateElement(node);
    }
    HTMLElement.call(this, node);
  }
  HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);
  registerWrapper(OriginalHTMLUnknownElement, HTMLUnknownElement);
  scope.wrappers.HTMLUnknownElement = HTMLUnknownElement;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var Element = scope.wrappers.Element;
  var HTMLElement = scope.wrappers.HTMLElement;
  var registerObject = scope.registerObject;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var svgTitleElement = document.createElementNS(SVG_NS, 'title');
  var SVGTitleElement = registerObject(svgTitleElement);
  var SVGElement = Object.getPrototypeOf(SVGTitleElement.prototype).constructor;

  // IE11 does not have classList for SVG elements. The spec says that classList
  // is an accessor on Element, but IE11 puts classList on HTMLElement, leaving
  // SVGElement without a classList property. We therefore move the accessor for
  // IE11.
  if (!('classList' in svgTitleElement)) {
    var descr = Object.getOwnPropertyDescriptor(Element.prototype, 'classList');
    Object.defineProperty(HTMLElement.prototype, 'classList', descr);
    delete Element.prototype.classList;
  }

  scope.wrappers.SVGElement = SVGElement;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalSVGUseElement = window.SVGUseElement;

  // IE uses SVGElement as parent interface, SVG2 (Blink & Gecko) uses
  // SVGGraphicsElement. Use the <g> element to get the right prototype.

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var gWrapper = wrap(document.createElementNS(SVG_NS, 'g'));
  var useElement = document.createElementNS(SVG_NS, 'use');
  var SVGGElement = gWrapper.constructor;
  var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);
  var parentInterface = parentInterfacePrototype.constructor;

  function SVGUseElement(impl) {
    parentInterface.call(this, impl);
  }

  SVGUseElement.prototype = Object.create(parentInterfacePrototype);

  // Firefox does not expose instanceRoot.
  if ('instanceRoot' in useElement) {
    mixin(SVGUseElement.prototype, {
      get instanceRoot() {
        return wrap(unwrap(this).instanceRoot);
      },
      get animatedInstanceRoot() {
        return wrap(unwrap(this).animatedInstanceRoot);
      },
    });
  }

  registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);

  scope.wrappers.SVGUseElement = SVGUseElement;
})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var OriginalSVGElementInstance = window.SVGElementInstance;
  if (!OriginalSVGElementInstance)
    return;

  function SVGElementInstance(impl) {
    EventTarget.call(this, impl);
  }

  SVGElementInstance.prototype = Object.create(EventTarget.prototype);
  mixin(SVGElementInstance.prototype, {
    /** @type {SVGElement} */
    get correspondingElement() {
      return wrap(unsafeUnwrap(this).correspondingElement);
    },

    /** @type {SVGUseElement} */
    get correspondingUseElement() {
      return wrap(unsafeUnwrap(this).correspondingUseElement);
    },

    /** @type {SVGElementInstance} */
    get parentNode() {
      return wrap(unsafeUnwrap(this).parentNode);
    },

    /** @type {SVGElementInstanceList} */
    get childNodes() {
      throw new Error('Not implemented');
    },

    /** @type {SVGElementInstance} */
    get firstChild() {
      return wrap(unsafeUnwrap(this).firstChild);
    },

    /** @type {SVGElementInstance} */
    get lastChild() {
      return wrap(unsafeUnwrap(this).lastChild);
    },

    /** @type {SVGElementInstance} */
    get previousSibling() {
      return wrap(unsafeUnwrap(this).previousSibling);
    },

    /** @type {SVGElementInstance} */
    get nextSibling() {
      return wrap(unsafeUnwrap(this).nextSibling);
    }
  });

  registerWrapper(OriginalSVGElementInstance, SVGElementInstance);

  scope.wrappers.SVGElementInstance = SVGElementInstance;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;

  function CanvasRenderingContext2D(impl) {
    setWrapper(impl, this);
  }

  mixin(CanvasRenderingContext2D.prototype, {
    get canvas() {
      return wrap(unsafeUnwrap(this).canvas);
    },

    drawImage: function() {
      arguments[0] = unwrapIfNeeded(arguments[0]);
      unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), arguments);
    },

    createPattern: function() {
      arguments[0] = unwrap(arguments[0]);
      return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), arguments);
    }
  });

  registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D,
                  document.createElement('canvas').getContext('2d'));

  scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalWebGLRenderingContext = window.WebGLRenderingContext;

  // IE10 does not have WebGL.
  if (!OriginalWebGLRenderingContext)
    return;

  function WebGLRenderingContext(impl) {
    setWrapper(impl, this);
  }

  mixin(WebGLRenderingContext.prototype, {
    get canvas() {
      return wrap(unsafeUnwrap(this).canvas);
    },

    texImage2D: function() {
      arguments[5] = unwrapIfNeeded(arguments[5]);
      unsafeUnwrap(this).texImage2D.apply(unsafeUnwrap(this), arguments);
    },

    texSubImage2D: function() {
      arguments[6] = unwrapIfNeeded(arguments[6]);
      unsafeUnwrap(this).texSubImage2D.apply(unsafeUnwrap(this), arguments);
    }
  });

  // Blink/WebKit has broken DOM bindings. Usually we would create an instance
  // of the object and pass it into registerWrapper as a "blueprint" but
  // creating WebGL contexts is expensive and might fail so we use a dummy
  // object with dummy instance properties for these broken browsers.
  var instanceProperties = /WebKit/.test(navigator.userAgent) ?
      {drawingBufferHeight: null, drawingBufferWidth: null} : {};

  registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext,
      instanceProperties);

  scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;
})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalRange = window.Range;

  function Range(impl) {
    setWrapper(impl, this);
  }
  Range.prototype = {
    get startContainer() {
      return wrap(unsafeUnwrap(this).startContainer);
    },
    get endContainer() {
      return wrap(unsafeUnwrap(this).endContainer);
    },
    get commonAncestorContainer() {
      return wrap(unsafeUnwrap(this).commonAncestorContainer);
    },
    setStart: function(refNode,offset) {
      unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
    },
    setEnd: function(refNode,offset) {
      unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
    },
    setStartBefore: function(refNode) {
      unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
    },
    setStartAfter: function(refNode) {
      unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
    },
    setEndBefore: function(refNode) {
      unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
    },
    setEndAfter: function(refNode) {
      unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
    },
    selectNode: function(refNode) {
      unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
    },
    selectNodeContents: function(refNode) {
      unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
    },
    compareBoundaryPoints: function(how, sourceRange) {
      return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
    },
    extractContents: function() {
      return wrap(unsafeUnwrap(this).extractContents());
    },
    cloneContents: function() {
      return wrap(unsafeUnwrap(this).cloneContents());
    },
    insertNode: function(node) {
      unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
    },
    surroundContents: function(newParent) {
      unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
    },
    cloneRange: function() {
      return wrap(unsafeUnwrap(this).cloneRange());
    },
    isPointInRange: function(node, offset) {
      return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
    },
    comparePoint: function(node, offset) {
      return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
    },
    intersectsNode: function(node) {
      return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  // IE9 does not have createContextualFragment.
  if (OriginalRange.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function(html) {
      return wrap(unsafeUnwrap(this).createContextualFragment(html));
    };
  }

  registerWrapper(window.Range, Range, document.createRange());

  scope.wrappers.Range = Range;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var GetElementsByInterface = scope.GetElementsByInterface;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var mixin = scope.mixin;
  var registerObject = scope.registerObject;

  var DocumentFragment = registerObject(document.createDocumentFragment());
  mixin(DocumentFragment.prototype, ParentNodeInterface);
  mixin(DocumentFragment.prototype, SelectorsInterface);
  mixin(DocumentFragment.prototype, GetElementsByInterface);

  var Comment = registerObject(document.createComment(''));

  scope.wrappers.Comment = Comment;
  scope.wrappers.DocumentFragment = DocumentFragment;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var DocumentFragment = scope.wrappers.DocumentFragment;
  var TreeScope = scope.TreeScope;
  var elementFromPoint = scope.elementFromPoint;
  var getInnerHTML = scope.getInnerHTML;
  var getTreeScope = scope.getTreeScope;
  var mixin = scope.mixin;
  var rewrap = scope.rewrap;
  var setInnerHTML = scope.setInnerHTML;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;

  var shadowHostTable = new WeakMap();
  var nextOlderShadowTreeTable = new WeakMap();

  var spaceCharRe = /[ \t\n\r\f]/;

  function ShadowRoot(hostWrapper) {
    var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());
    DocumentFragment.call(this, node);

    // createDocumentFragment associates the node with a wrapper
    // DocumentFragment instance. Override that.
    rewrap(node, this);

    var oldShadowRoot = hostWrapper.shadowRoot;
    nextOlderShadowTreeTable.set(this, oldShadowRoot);

    this.treeScope_ =
        new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));

    shadowHostTable.set(this, hostWrapper);
  }
  ShadowRoot.prototype = Object.create(DocumentFragment.prototype);
  mixin(ShadowRoot.prototype, {
    constructor: ShadowRoot,

    get innerHTML() {
      return getInnerHTML(this);
    },
    set innerHTML(value) {
      setInnerHTML(this, value);
      this.invalidateShadowRenderer();
    },

    get olderShadowRoot() {
      return nextOlderShadowTreeTable.get(this) || null;
    },

    get host() {
      return shadowHostTable.get(this) || null;
    },

    invalidateShadowRenderer: function() {
      return shadowHostTable.get(this).invalidateShadowRenderer();
    },

    elementFromPoint: function(x, y) {
      return elementFromPoint(this, this.ownerDocument, x, y);
    },

    getElementById: function(id) {
      if (spaceCharRe.test(id))
        return null;
      return this.querySelector('[id="' + id + '"]');
    }
  });

  scope.wrappers.ShadowRoot = ShadowRoot;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var Element = scope.wrappers.Element;
  var HTMLContentElement = scope.wrappers.HTMLContentElement;
  var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
  var Node = scope.wrappers.Node;
  var ShadowRoot = scope.wrappers.ShadowRoot;
  var assert = scope.assert;
  var getTreeScope = scope.getTreeScope;
  var mixin = scope.mixin;
  var oneOf = scope.oneOf;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Up means parentNode
   * Sideways means previous and next sibling.
   * @param {!Node} wrapper
   */
  function updateWrapperUpAndSideways(wrapper) {
    wrapper.previousSibling_ = wrapper.previousSibling;
    wrapper.nextSibling_ = wrapper.nextSibling;
    wrapper.parentNode_ = wrapper.parentNode;
  }

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Down means first and last child
   * @param {!Node} wrapper
   */
  function updateWrapperDown(wrapper) {
    wrapper.firstChild_ = wrapper.firstChild;
    wrapper.lastChild_ = wrapper.lastChild;
  }

  function updateAllChildNodes(parentNodeWrapper) {
    assert(parentNodeWrapper instanceof Node);
    for (var childWrapper = parentNodeWrapper.firstChild;
         childWrapper;
         childWrapper = childWrapper.nextSibling) {
      updateWrapperUpAndSideways(childWrapper);
    }
    updateWrapperDown(parentNodeWrapper);
  }

  function insertBefore(parentNodeWrapper, newChildWrapper, refChildWrapper) {
    var parentNode = unwrap(parentNodeWrapper);
    var newChild = unwrap(newChildWrapper);
    var refChild = refChildWrapper ? unwrap(refChildWrapper) : null;

    remove(newChildWrapper);
    updateWrapperUpAndSideways(newChildWrapper);

    if (!refChildWrapper) {
      parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
      if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild)
        parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;

      var lastChildWrapper = wrap(parentNode.lastChild);
      if (lastChildWrapper)
        lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
    } else {
      if (parentNodeWrapper.firstChild === refChildWrapper)
        parentNodeWrapper.firstChild_ = refChildWrapper;

      refChildWrapper.previousSibling_ = refChildWrapper.previousSibling;
    }

    parentNode.insertBefore(newChild, refChild);
  }

  function remove(nodeWrapper) {
    var node = unwrap(nodeWrapper)
    var parentNode = node.parentNode;
    if (!parentNode)
      return;

    var parentNodeWrapper = wrap(parentNode);
    updateWrapperUpAndSideways(nodeWrapper);

    if (nodeWrapper.previousSibling)
      nodeWrapper.previousSibling.nextSibling_ = nodeWrapper;
    if (nodeWrapper.nextSibling)
      nodeWrapper.nextSibling.previousSibling_ = nodeWrapper;

    if (parentNodeWrapper.lastChild === nodeWrapper)
      parentNodeWrapper.lastChild_ = nodeWrapper;
    if (parentNodeWrapper.firstChild === nodeWrapper)
      parentNodeWrapper.firstChild_ = nodeWrapper;

    parentNode.removeChild(node);
  }

  var distributedNodesTable = new WeakMap();
  var destinationInsertionPointsTable = new WeakMap();
  var rendererForHostTable = new WeakMap();

  function resetDistributedNodes(insertionPoint) {
    distributedNodesTable.set(insertionPoint, []);
  }

  function getDistributedNodes(insertionPoint) {
    var rv = distributedNodesTable.get(insertionPoint);
    if (!rv)
      distributedNodesTable.set(insertionPoint, rv = []);
    return rv;
  }

  function getChildNodesSnapshot(node) {
    var result = [], i = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      result[i++] = child;
    }
    return result;
  }

  var request = oneOf(window, [
    'requestAnimationFrame',
    'mozRequestAnimationFrame',
    'webkitRequestAnimationFrame',
    'setTimeout'
  ]);

  var pendingDirtyRenderers = [];
  var renderTimer;

  function renderAllPending() {
    // TODO(arv): Order these in document order. That way we do not have to
    // render something twice.
    for (var i = 0; i < pendingDirtyRenderers.length; i++) {
      var renderer = pendingDirtyRenderers[i];
      var parentRenderer = renderer.parentRenderer;
      if (parentRenderer && parentRenderer.dirty)
        continue;
      renderer.render();
    }

    pendingDirtyRenderers = [];
  }

  function handleRequestAnimationFrame() {
    renderTimer = null;
    renderAllPending();
  }

  /**
   * Returns existing shadow renderer for a host or creates it if it is needed.
   * @params {!Element} host
   * @return {!ShadowRenderer}
   */
  function getRendererForHost(host) {
    var renderer = rendererForHostTable.get(host);
    if (!renderer) {
      renderer = new ShadowRenderer(host);
      rendererForHostTable.set(host, renderer);
    }
    return renderer;
  }

  function getShadowRootAncestor(node) {
    var root = getTreeScope(node).root;
    if (root instanceof ShadowRoot)
      return root;
    return null;
  }

  function getRendererForShadowRoot(shadowRoot) {
    return getRendererForHost(shadowRoot.host);
  }

  var spliceDiff = new ArraySplice();
  spliceDiff.equals = function(renderNode, rawNode) {
    return unwrap(renderNode.node) === rawNode;
  };

  /**
   * RenderNode is used as an in memory "render tree". When we render the
   * composed tree we create a tree of RenderNodes, then we diff this against
   * the real DOM tree and make minimal changes as needed.
   */
  function RenderNode(node) {
    this.skip = false;
    this.node = node;
    this.childNodes = [];
  }

  RenderNode.prototype = {
    append: function(node) {
      var rv = new RenderNode(node);
      this.childNodes.push(rv);
      return rv;
    },

    sync: function(opt_added) {
      if (this.skip)
        return;

      var nodeWrapper = this.node;
      // plain array of RenderNodes
      var newChildren = this.childNodes;
      // plain array of real nodes.
      var oldChildren = getChildNodesSnapshot(unwrap(nodeWrapper));
      var added = opt_added || new WeakMap();

      var splices = spliceDiff.calculateSplices(newChildren, oldChildren);

      var newIndex = 0, oldIndex = 0;
      var lastIndex = 0;
      for (var i = 0; i < splices.length; i++) {
        var splice = splices[i];
        for (; lastIndex < splice.index; lastIndex++) {
          oldIndex++;
          newChildren[newIndex++].sync(added);
        }

        var removedCount = splice.removed.length;
        for (var j = 0; j < removedCount; j++) {
          var wrapper = wrap(oldChildren[oldIndex++]);
          if (!added.get(wrapper))
            remove(wrapper);
        }

        var addedCount = splice.addedCount;
        var refNode = oldChildren[oldIndex] && wrap(oldChildren[oldIndex]);
        for (var j = 0; j < addedCount; j++) {
          var newChildRenderNode = newChildren[newIndex++];
          var newChildWrapper = newChildRenderNode.node;
          insertBefore(nodeWrapper, newChildWrapper, refNode);

          // Keep track of added so that we do not remove the node after it
          // has been added.
          added.set(newChildWrapper, true);

          newChildRenderNode.sync(added);
        }

        lastIndex += addedCount;
      }

      for (var i = lastIndex; i < newChildren.length; i++) {
        newChildren[i].sync(added);
      }
    }
  };

  function ShadowRenderer(host) {
    this.host = host;
    this.dirty = false;
    this.invalidateAttributes();
    this.associateNode(host);
  }

  ShadowRenderer.prototype = {

    // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#rendering-shadow-trees
    render: function(opt_renderNode) {
      if (!this.dirty)
        return;

      this.invalidateAttributes();

      var host = this.host;

      this.distribution(host);
      var renderNode = opt_renderNode || new RenderNode(host);
      this.buildRenderTree(renderNode, host);

      var topMostRenderer = !opt_renderNode;
      if (topMostRenderer)
        renderNode.sync();

      this.dirty = false;
    },

    get parentRenderer() {
      return getTreeScope(this.host).renderer;
    },

    invalidate: function() {
      if (!this.dirty) {
        this.dirty = true;
        var parentRenderer = this.parentRenderer;
        if (parentRenderer)
          parentRenderer.invalidate();
        pendingDirtyRenderers.push(this);
        if (renderTimer)
          return;
        renderTimer = window[request](handleRequestAnimationFrame, 0);
      }
    },

    // http://w3c.github.io/webcomponents/spec/shadow/#distribution-algorithms
    distribution: function(root) {
      this.resetAll(root);
      this.distributionResolution(root);
    },

    resetAll: function(node) {
      if (isInsertionPoint(node))
        resetDistributedNodes(node);
      else
        resetDestinationInsertionPoints(node);

      for (var child = node.firstChild; child; child = child.nextSibling) {
        this.resetAll(child);
      }

      if (node.shadowRoot)
        this.resetAll(node.shadowRoot);

      if (node.olderShadowRoot)
        this.resetAll(node.olderShadowRoot);
    },

    // http://w3c.github.io/webcomponents/spec/shadow/#distribution-results
    distributionResolution: function(node) {
      if (isShadowHost(node)) {
        var shadowHost = node;
        // 1.1
        var pool = poolPopulation(shadowHost);

        var shadowTrees = getShadowTrees(shadowHost);

        // 1.2
        for (var i = 0; i < shadowTrees.length; i++) {
          // 1.2.1
          this.poolDistribution(shadowTrees[i], pool);
        }

        // 1.3
        for (var i = shadowTrees.length - 1; i >= 0; i--) {
          var shadowTree = shadowTrees[i];

          // 1.3.1
          // TODO(arv): We should keep the shadow insertion points on the
          // shadow root (or renderer) so we don't have to search the tree
          // every time.
          var shadow = getShadowInsertionPoint(shadowTree);

          // 1.3.2
          if (shadow) {

            // 1.3.2.1
            var olderShadowRoot = shadowTree.olderShadowRoot;
            if (olderShadowRoot) {
              // 1.3.2.1.1
              pool = poolPopulation(olderShadowRoot);
            }

            // 1.3.2.2
            for (var j = 0; j < pool.length; j++) {
              // 1.3.2.2.1
              destributeNodeInto(pool[j], shadow);
            }
          }

          // 1.3.3
          this.distributionResolution(shadowTree);
        }
      }

      for (var child = node.firstChild; child; child = child.nextSibling) {
        this.distributionResolution(child);
      }
    },

    // http://w3c.github.io/webcomponents/spec/shadow/#dfn-pool-distribution-algorithm
    poolDistribution: function (node, pool) {
      if (node instanceof HTMLShadowElement)
        return;

      if (node instanceof HTMLContentElement) {
        var content = node;
        this.updateDependentAttributes(content.getAttribute('select'));

        var anyDistributed = false;

        // 1.1
        for (var i = 0; i < pool.length; i++) {
          var node = pool[i];
          if (!node)
            continue;
          if (matches(node, content)) {
            destributeNodeInto(node, content);
            pool[i] = undefined;
            anyDistributed = true;
          }
        }

        // 1.2
        // Fallback content
        if (!anyDistributed) {
          for (var child = content.firstChild;
               child;
               child = child.nextSibling) {
            destributeNodeInto(child, content);
          }
        }

        return;
      }

      for (var child = node.firstChild; child; child = child.nextSibling) {
        this.poolDistribution(child, pool);
      }
    },

    buildRenderTree: function(renderNode, node) {
      var children = this.compose(node);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var childRenderNode = renderNode.append(child);
        this.buildRenderTree(childRenderNode, child);
      }

      if (isShadowHost(node)) {
        var renderer = getRendererForHost(node);
        renderer.dirty = false;
      }

    },

    compose: function(node) {
      var children = [];
      var p = node.shadowRoot || node;
      for (var child = p.firstChild; child; child = child.nextSibling) {
        if (isInsertionPoint(child)) {
          this.associateNode(p);
          var distributedNodes = getDistributedNodes(child);
          for (var j = 0; j < distributedNodes.length; j++) {
            var distributedNode = distributedNodes[j];
            if (isFinalDestination(child, distributedNode))
              children.push(distributedNode);
          }
        } else {
          children.push(child);
        }
      }
      return children;
    },

    /**
     * Invalidates the attributes used to keep track of which attributes may
     * cause the renderer to be invalidated.
     */
    invalidateAttributes: function() {
      this.attributes = Object.create(null);
    },

    /**
     * Parses the selector and makes this renderer dependent on the attribute
     * being used in the selector.
     * @param {string} selector
     */
    updateDependentAttributes: function(selector) {
      if (!selector)
        return;

      var attributes = this.attributes;

      // .class
      if (/\.\w+/.test(selector))
        attributes['class'] = true;

      // #id
      if (/#\w+/.test(selector))
        attributes['id'] = true;

      selector.replace(/\[\s*([^\s=\|~\]]+)/g, function(_, name) {
        attributes[name] = true;
      });

      // Pseudo selectors have been removed from the spec.
    },

    dependsOnAttribute: function(name) {
      return this.attributes[name];
    },

    associateNode: function(node) {
      unsafeUnwrap(node).polymerShadowRenderer_ = this;
    }
  };

  // http://w3c.github.io/webcomponents/spec/shadow/#dfn-pool-population-algorithm
  function poolPopulation(node) {
    var pool = [];
    for (var child = node.firstChild; child; child = child.nextSibling) {
      if (isInsertionPoint(child)) {
        pool.push.apply(pool, getDistributedNodes(child));
      } else {
        pool.push(child);
      }
    }
    return pool;
  }

  function getShadowInsertionPoint(node) {
    if (node instanceof HTMLShadowElement)
      return node;
    if (node instanceof HTMLContentElement)
      return null;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      var res = getShadowInsertionPoint(child);
      if (res)
        return res;
    }
    return null;
  }

  function destributeNodeInto(child, insertionPoint) {
    getDistributedNodes(insertionPoint).push(child);
    var points = destinationInsertionPointsTable.get(child);
    if (!points)
      destinationInsertionPointsTable.set(child, [insertionPoint]);
    else
      points.push(insertionPoint);
  }

  function getDestinationInsertionPoints(node) {
    return destinationInsertionPointsTable.get(node);
  }

  function resetDestinationInsertionPoints(node) {
    // IE11 crashes when delete is used.
    destinationInsertionPointsTable.set(node, undefined);
  }

  // AllowedSelectors :
  //   TypeSelector
  //   *
  //   ClassSelector
  //   IDSelector
  //   AttributeSelector
  //   negation
  var selectorStartCharRe = /^(:not\()?[*.#[a-zA-Z_|]/;

  function matches(node, contentElement) {
    var select = contentElement.getAttribute('select');
    if (!select)
      return true;

    // Here we know the select attribute is a non empty string.
    select = select.trim();
    if (!select)
      return true;

    if (!(node instanceof Element))
      return false;

    if (!selectorStartCharRe.test(select))
      return false;

    try {
      return node.matches(select);
    } catch (ex) {
      // Invalid selector.
      return false;
    }
  }

  function isFinalDestination(insertionPoint, node) {
    var points = getDestinationInsertionPoints(node);
    return points && points[points.length - 1] === insertionPoint;
  }

  function isInsertionPoint(node) {
    return node instanceof HTMLContentElement ||
           node instanceof HTMLShadowElement;
  }

  function isShadowHost(shadowHost) {
    return shadowHost.shadowRoot;
  }

  // Returns the shadow trees as an array, with the youngest tree at the
  // beginning of the array.
  function getShadowTrees(host) {
    var trees = [];

    for (var tree = host.shadowRoot; tree; tree = tree.olderShadowRoot) {
      trees.push(tree);
    }
    return trees;
  }

  function render(host) {
    new ShadowRenderer(host).render();
  };

  // Need to rerender shadow host when:
  //
  // - a direct child to the ShadowRoot is added or removed
  // - a direct child to the host is added or removed
  // - a new shadow root is created
  // - a direct child to a content/shadow element is added or removed
  // - a sibling to a content/shadow element is added or removed
  // - content[select] is changed
  // - an attribute in a direct child to a host is modified

  /**
   * This gets called when a node was added or removed to it.
   */
  Node.prototype.invalidateShadowRenderer = function(force) {
    var renderer = unsafeUnwrap(this).polymerShadowRenderer_;
    if (renderer) {
      renderer.invalidate();
      return true;
    }

    return false;
  };

  HTMLContentElement.prototype.getDistributedNodes =
  HTMLShadowElement.prototype.getDistributedNodes = function() {
    // TODO(arv): We should only rerender the dirty ancestor renderers (from
    // the root and down).
    renderAllPending();
    return getDistributedNodes(this);
  };

  Element.prototype.getDestinationInsertionPoints = function() {
    renderAllPending();
    return getDestinationInsertionPoints(this) || [];
  };

  HTMLContentElement.prototype.nodeIsInserted_ =
  HTMLShadowElement.prototype.nodeIsInserted_ = function() {
    // Invalidate old renderer if any.
    this.invalidateShadowRenderer();

    var shadowRoot = getShadowRootAncestor(this);
    var renderer;
    if (shadowRoot)
      renderer = getRendererForShadowRoot(shadowRoot);
    unsafeUnwrap(this).polymerShadowRenderer_ = renderer;
    if (renderer)
      renderer.invalidate();
  };

  scope.getRendererForHost = getRendererForHost;
  scope.getShadowTrees = getShadowTrees;
  scope.renderAllPending = renderAllPending;

  scope.getDestinationInsertionPoints = getDestinationInsertionPoints;

  // Exposed for testing
  scope.visual = {
    insertBefore: insertBefore,
    remove: remove,
  };

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var assert = scope.assert;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var elementsWithFormProperty = [
    'HTMLButtonElement',
    'HTMLFieldSetElement',
    'HTMLInputElement',
    'HTMLKeygenElement',
    'HTMLLabelElement',
    'HTMLLegendElement',
    'HTMLObjectElement',
    // HTMLOptionElement is handled in HTMLOptionElement.js
    'HTMLOutputElement',
    // HTMLSelectElement is handled in HTMLSelectElement.js
    'HTMLTextAreaElement',
  ];

  function createWrapperConstructor(name) {
    if (!window[name])
      return;

    // Ensure we are not overriding an already existing constructor.
    assert(!scope.wrappers[name]);

    var GeneratedWrapper = function(node) {
      // At this point all of them extend HTMLElement.
      HTMLElement.call(this, node);
    }
    GeneratedWrapper.prototype = Object.create(HTMLElement.prototype);
    mixin(GeneratedWrapper.prototype, {
      get form() {
        return wrap(unwrap(this).form);
      },
    });

    registerWrapper(window[name], GeneratedWrapper,
        document.createElement(name.slice(4, -7)));
    scope.wrappers[name] = GeneratedWrapper;
  }

  elementsWithFormProperty.forEach(createWrapperConstructor);

})(window.ShadowDOMPolyfill);

// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalSelection = window.Selection;

  function Selection(impl) {
    setWrapper(impl, this);
  }
  Selection.prototype = {
    get anchorNode() {
      return wrap(unsafeUnwrap(this).anchorNode);
    },
    get focusNode() {
      return wrap(unsafeUnwrap(this).focusNode);
    },
    addRange: function(range) {
      unsafeUnwrap(this).addRange(unwrap(range));
    },
    collapse: function(node, index) {
      unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);
    },
    containsNode: function(node, allowPartial) {
      return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);
    },
    extend: function(node, offset) {
      unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
    },
    getRangeAt: function(index) {
      return wrap(unsafeUnwrap(this).getRangeAt(index));
    },
    removeRange: function(range) {
      unsafeUnwrap(this).removeRange(unwrap(range));
    },
    selectAllChildren: function(node) {
      unsafeUnwrap(this).selectAllChildren(unwrapIfNeeded(node));
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  // WebKit extensions. Not implemented.
  // readonly attribute Node baseNode;
  // readonly attribute long baseOffset;
  // readonly attribute Node extentNode;
  // readonly attribute long extentOffset;
  // [RaisesException] void setBaseAndExtent([Default=Undefined] optional Node baseNode,
  //                       [Default=Undefined] optional long baseOffset,
  //                       [Default=Undefined] optional Node extentNode,
  //                       [Default=Undefined] optional long extentOffset);
  // [RaisesException, ImplementedAs=collapse] void setPosition([Default=Undefined] optional Node node,
  //                  [Default=Undefined] optional long offset);

  registerWrapper(window.Selection, Selection, window.getSelection());

  scope.wrappers.Selection = Selection;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var GetElementsByInterface = scope.GetElementsByInterface;
  var Node = scope.wrappers.Node;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var Selection = scope.wrappers.Selection;
  var SelectorsInterface = scope.SelectorsInterface;
  var ShadowRoot = scope.wrappers.ShadowRoot;
  var TreeScope = scope.TreeScope;
  var cloneNode = scope.cloneNode;
  var defineWrapGetter = scope.defineWrapGetter;
  var elementFromPoint = scope.elementFromPoint;
  var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
  var matchesNames = scope.matchesNames;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var renderAllPending = scope.renderAllPending;
  var rewrap = scope.rewrap;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrapEventTargetMethods = scope.wrapEventTargetMethods;
  var wrapNodeList = scope.wrapNodeList;

  var implementationTable = new WeakMap();

  function Document(node) {
    Node.call(this, node);
    this.treeScope_ = new TreeScope(this, null);
  }
  Document.prototype = Object.create(Node.prototype);

  defineWrapGetter(Document, 'documentElement');

  // Conceptually both body and head can be in a shadow but suporting that seems
  // overkill at this point.
  defineWrapGetter(Document, 'body');
  defineWrapGetter(Document, 'head');

  // document cannot be overridden so we override a bunch of its methods
  // directly on the instance.

  function wrapMethod(name) {
    var original = document[name];
    Document.prototype[name] = function() {
      return wrap(original.apply(unsafeUnwrap(this), arguments));
    };
  }

  [
    'createComment',
    'createDocumentFragment',
    'createElement',
    'createElementNS',
    'createEvent',
    'createEventNS',
    'createRange',
    'createTextNode',
    'getElementById'
  ].forEach(wrapMethod);

  var originalAdoptNode = document.adoptNode;

  function adoptNodeNoRemove(node, doc) {
    originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));
    adoptSubtree(node, doc);
  }

  function adoptSubtree(node, doc) {
    if (node.shadowRoot)
      doc.adoptNode(node.shadowRoot);
    if (node instanceof ShadowRoot)
      adoptOlderShadowRoots(node, doc);
    for (var child = node.firstChild; child; child = child.nextSibling) {
      adoptSubtree(child, doc);
    }
  }

  function adoptOlderShadowRoots(shadowRoot, doc) {
    var oldShadowRoot = shadowRoot.olderShadowRoot;
    if (oldShadowRoot)
      doc.adoptNode(oldShadowRoot);
  }

  var originalGetSelection = document.getSelection;

  mixin(Document.prototype, {
    adoptNode: function(node) {
      if (node.parentNode)
        node.parentNode.removeChild(node);
      adoptNodeNoRemove(node, this);
      return node;
    },
    elementFromPoint: function(x, y) {
      return elementFromPoint(this, this, x, y);
    },
    importNode: function(node, deep) {
      return cloneNode(node, deep, unsafeUnwrap(this));
    },
    getSelection: function() {
      renderAllPending();
      return new Selection(originalGetSelection.call(unwrap(this)));
    },
    getElementsByName: function(name) {
      return SelectorsInterface.querySelectorAll.call(this,
          '[name=' + JSON.stringify(String(name)) + ']');
    }
  });

  if (document.registerElement) {
    var originalRegisterElement = document.registerElement;
    Document.prototype.registerElement = function(tagName, object) {
      var prototype, extendsOption;
      if (object !== undefined) {
        prototype = object.prototype;
        extendsOption = object.extends;
      }

      if (!prototype)
        prototype = Object.create(HTMLElement.prototype);


      // If we already used the object as a prototype for another custom
      // element.
      if (scope.nativePrototypeTable.get(prototype)) {
        // TODO(arv): DOMException
        throw new Error('NotSupportedError');
      }

      // Find first object on the prototype chain that already have a native
      // prototype. Keep track of all the objects before that so we can create
      // a similar structure for the native case.
      var proto = Object.getPrototypeOf(prototype);
      var nativePrototype;
      var prototypes = [];
      while (proto) {
        nativePrototype = scope.nativePrototypeTable.get(proto);
        if (nativePrototype)
          break;
        prototypes.push(proto);
        proto = Object.getPrototypeOf(proto);
      }

      if (!nativePrototype) {
        // TODO(arv): DOMException
        throw new Error('NotSupportedError');
      }

      // This works by creating a new prototype object that is empty, but has
      // the native prototype as its proto. The original prototype object
      // passed into register is used as the wrapper prototype.

      var newPrototype = Object.create(nativePrototype);
      for (var i = prototypes.length - 1; i >= 0; i--) {
        newPrototype = Object.create(newPrototype);
      }

      // Add callbacks if present.
      // Names are taken from:
      //   https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/bindings/v8/CustomElementConstructorBuilder.cpp&sq=package:chromium&type=cs&l=156
      // and not from the spec since the spec is out of date.
      [
        'createdCallback',
        'attachedCallback',
        'detachedCallback',
        'attributeChangedCallback',
      ].forEach(function(name) {
        var f = prototype[name];
        if (!f)
          return;
        newPrototype[name] = function() {
          // if this element has been wrapped prior to registration,
          // the wrapper is stale; in this case rewrap
          if (!(wrap(this) instanceof CustomElementConstructor)) {
            rewrap(this);
          }
          f.apply(wrap(this), arguments);
        };
      });

      var p = {prototype: newPrototype};
      if (extendsOption)
        p.extends = extendsOption;

      function CustomElementConstructor(node) {
        if (!node) {
          if (extendsOption) {
            return document.createElement(extendsOption, tagName);
          } else {
            return document.createElement(tagName);
          }
        }
        setWrapper(node, this);
      }
      CustomElementConstructor.prototype = prototype;
      CustomElementConstructor.prototype.constructor = CustomElementConstructor;

      scope.constructorTable.set(newPrototype, CustomElementConstructor);
      scope.nativePrototypeTable.set(prototype, newPrototype);

      // registration is synchronous so do it last
      var nativeConstructor = originalRegisterElement.call(unwrap(this),
          tagName, p);
      return CustomElementConstructor;
    };

    forwardMethodsToWrapper([
      window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    ], [
      'registerElement',
    ]);
  }

  // We also override some of the methods on document.body and document.head
  // for convenience.
  forwardMethodsToWrapper([
    window.HTMLBodyElement,
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    window.HTMLHeadElement,
    window.HTMLHtmlElement,
  ], [
    'appendChild',
    'compareDocumentPosition',
    'contains',
    'getElementsByClassName',
    'getElementsByTagName',
    'getElementsByTagNameNS',
    'insertBefore',
    'querySelector',
    'querySelectorAll',
    'removeChild',
    'replaceChild',
  ].concat(matchesNames));

  forwardMethodsToWrapper([
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
  ], [
    'adoptNode',
    'importNode',
    'contains',
    'createComment',
    'createDocumentFragment',
    'createElement',
    'createElementNS',
    'createEvent',
    'createEventNS',
    'createRange',
    'createTextNode',
    'elementFromPoint',
    'getElementById',
    'getElementsByName',
    'getSelection',
  ]);

  mixin(Document.prototype, GetElementsByInterface);
  mixin(Document.prototype, ParentNodeInterface);
  mixin(Document.prototype, SelectorsInterface);

  mixin(Document.prototype, {
    get implementation() {
      var implementation = implementationTable.get(this);
      if (implementation)
        return implementation;
      implementation =
          new DOMImplementation(unwrap(this).implementation);
      implementationTable.set(this, implementation);
      return implementation;
    },

    get defaultView() {
      return wrap(unwrap(this).defaultView);
    }
  });

  registerWrapper(window.Document, Document,
      document.implementation.createHTMLDocument(''));

  // Both WebKit and Gecko uses HTMLDocument for document. HTML5/DOM only has
  // one Document interface and IE implements the standard correctly.
  if (window.HTMLDocument)
    registerWrapper(window.HTMLDocument, Document);

  wrapEventTargetMethods([
    window.HTMLBodyElement,
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    window.HTMLHeadElement,
  ]);

  function DOMImplementation(impl) {
    setWrapper(impl, this);
  }

  function wrapImplMethod(constructor, name) {
    var original = document.implementation[name];
    constructor.prototype[name] = function() {
      return wrap(original.apply(unsafeUnwrap(this), arguments));
    };
  }

  function forwardImplMethod(constructor, name) {
    var original = document.implementation[name];
    constructor.prototype[name] = function() {
      return original.apply(unsafeUnwrap(this), arguments);
    };
  }

  wrapImplMethod(DOMImplementation, 'createDocumentType');
  wrapImplMethod(DOMImplementation, 'createDocument');
  wrapImplMethod(DOMImplementation, 'createHTMLDocument');
  forwardImplMethod(DOMImplementation, 'hasFeature');

  registerWrapper(window.DOMImplementation, DOMImplementation);

  forwardMethodsToWrapper([
    window.DOMImplementation,
  ], [
    'createDocumentType',
    'createDocument',
    'createHTMLDocument',
    'hasFeature',
  ]);

  scope.adoptNodeNoRemove = adoptNodeNoRemove;
  scope.wrappers.DOMImplementation = DOMImplementation;
  scope.wrappers.Document = Document;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var Selection = scope.wrappers.Selection;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var renderAllPending = scope.renderAllPending;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalWindow = window.Window;
  var originalGetComputedStyle = window.getComputedStyle;
  var originalGetDefaultComputedStyle = window.getDefaultComputedStyle;
  var originalGetSelection = window.getSelection;

  function Window(impl) {
    EventTarget.call(this, impl);
  }
  Window.prototype = Object.create(EventTarget.prototype);

  OriginalWindow.prototype.getComputedStyle = function(el, pseudo) {
    return wrap(this || window).getComputedStyle(unwrapIfNeeded(el), pseudo);
  };

  // Mozilla proprietary extension.
  if (originalGetDefaultComputedStyle) {
    OriginalWindow.prototype.getDefaultComputedStyle = function(el, pseudo) {
      return wrap(this || window).getDefaultComputedStyle(
          unwrapIfNeeded(el), pseudo);
    };
  }

  OriginalWindow.prototype.getSelection = function() {
    return wrap(this || window).getSelection();
  };

  // Work around for https://bugzilla.mozilla.org/show_bug.cgi?id=943065
  delete window.getComputedStyle;
  delete window.getSelection;

  ['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(
      function(name) {
        OriginalWindow.prototype[name] = function() {
          var w = wrap(this || window);
          return w[name].apply(w, arguments);
        };

        // Work around for https://bugzilla.mozilla.org/show_bug.cgi?id=943065
        delete window[name];
      });

  mixin(Window.prototype, {
    getComputedStyle: function(el, pseudo) {
      renderAllPending();
      return originalGetComputedStyle.call(unwrap(this), unwrapIfNeeded(el),
                                           pseudo);
    },
    getSelection: function() {
      renderAllPending();
      return new Selection(originalGetSelection.call(unwrap(this)));
    },

    get document() {
      return wrap(unwrap(this).document);
    }
  });

  // Mozilla proprietary extension.
  if (originalGetDefaultComputedStyle) {
    Window.prototype.getDefaultComputedStyle = function(el, pseudo) {
      renderAllPending();
      return originalGetDefaultComputedStyle.call(unwrap(this),
          unwrapIfNeeded(el),pseudo);
    };
  }

  registerWrapper(OriginalWindow, Window, window);

  scope.wrappers.Window = Window;

})(window.ShadowDOMPolyfill);

/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var unwrap = scope.unwrap;

  // DataTransfer (Clipboard in old Blink/WebKit) has a single method that
  // requires wrapping. Since it is only a method we do not need a real wrapper,
  // we can just override the method.

  var OriginalDataTransfer = window.DataTransfer || window.Clipboard;
  var OriginalDataTransferSetDragImage =
      OriginalDataTransfer.prototype.setDragImage;

  if (OriginalDataTransferSetDragImage) {
    OriginalDataTransfer.prototype.setDragImage = function(image, x, y) {
      OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);
    };
  }

})(window.ShadowDOMPolyfill);

/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unwrap = scope.unwrap;

  var OriginalFormData = window.FormData;

  function FormData(formElement) {
    var impl;
    if (formElement instanceof OriginalFormData) {
      impl = formElement;
    } else {
      impl = new OriginalFormData(formElement && unwrap(formElement));
    }
    setWrapper(impl, this);
  }

  registerWrapper(OriginalFormData, FormData, new OriginalFormData());

  scope.wrappers.FormData = FormData;

})(window.ShadowDOMPolyfill);

// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var isWrapperFor = scope.isWrapperFor;

  // This is a list of the elements we currently override the global constructor
  // for.
  var elements = {
    'a': 'HTMLAnchorElement',
    // Do not create an applet element by default since it shows a warning in
    // IE.
    // https://github.com/Polymer/polymer/issues/217
    // 'applet': 'HTMLAppletElement',
    'area': 'HTMLAreaElement',
    'audio': 'HTMLAudioElement',
    'base': 'HTMLBaseElement',
    'body': 'HTMLBodyElement',
    'br': 'HTMLBRElement',
    'button': 'HTMLButtonElement',
    'canvas': 'HTMLCanvasElement',
    'caption': 'HTMLTableCaptionElement',
    'col': 'HTMLTableColElement',
    // 'command': 'HTMLCommandElement',  // Not fully implemented in Gecko.
    'content': 'HTMLContentElement',
    'data': 'HTMLDataElement',
    'datalist': 'HTMLDataListElement',
    'del': 'HTMLModElement',
    'dir': 'HTMLDirectoryElement',
    'div': 'HTMLDivElement',
    'dl': 'HTMLDListElement',
    'embed': 'HTMLEmbedElement',
    'fieldset': 'HTMLFieldSetElement',
    'font': 'HTMLFontElement',
    'form': 'HTMLFormElement',
    'frame': 'HTMLFrameElement',
    'frameset': 'HTMLFrameSetElement',
    'h1': 'HTMLHeadingElement',
    'head': 'HTMLHeadElement',
    'hr': 'HTMLHRElement',
    'html': 'HTMLHtmlElement',
    'iframe': 'HTMLIFrameElement',
    'img': 'HTMLImageElement',
    'input': 'HTMLInputElement',
    'keygen': 'HTMLKeygenElement',
    'label': 'HTMLLabelElement',
    'legend': 'HTMLLegendElement',
    'li': 'HTMLLIElement',
    'link': 'HTMLLinkElement',
    'map': 'HTMLMapElement',
    'marquee': 'HTMLMarqueeElement',
    'menu': 'HTMLMenuElement',
    'menuitem': 'HTMLMenuItemElement',
    'meta': 'HTMLMetaElement',
    'meter': 'HTMLMeterElement',
    'object': 'HTMLObjectElement',
    'ol': 'HTMLOListElement',
    'optgroup': 'HTMLOptGroupElement',
    'option': 'HTMLOptionElement',
    'output': 'HTMLOutputElement',
    'p': 'HTMLParagraphElement',
    'param': 'HTMLParamElement',
    'pre': 'HTMLPreElement',
    'progress': 'HTMLProgressElement',
    'q': 'HTMLQuoteElement',
    'script': 'HTMLScriptElement',
    'select': 'HTMLSelectElement',
    'shadow': 'HTMLShadowElement',
    'source': 'HTMLSourceElement',
    'span': 'HTMLSpanElement',
    'style': 'HTMLStyleElement',
    'table': 'HTMLTableElement',
    'tbody': 'HTMLTableSectionElement',
    // WebKit and Moz are wrong:
    // https://bugs.webkit.org/show_bug.cgi?id=111469
    // https://bugzilla.mozilla.org/show_bug.cgi?id=848096
    // 'td': 'HTMLTableCellElement',
    'template': 'HTMLTemplateElement',
    'textarea': 'HTMLTextAreaElement',
    'thead': 'HTMLTableSectionElement',
    'time': 'HTMLTimeElement',
    'title': 'HTMLTitleElement',
    'tr': 'HTMLTableRowElement',
    'track': 'HTMLTrackElement',
    'ul': 'HTMLUListElement',
    'video': 'HTMLVideoElement',
  };

  function overrideConstructor(tagName) {
    var nativeConstructorName = elements[tagName];
    var nativeConstructor = window[nativeConstructorName];
    if (!nativeConstructor)
      return;
    var element = document.createElement(tagName);
    var wrapperConstructor = element.constructor;
    window[nativeConstructorName] = wrapperConstructor;
  }

  Object.keys(elements).forEach(overrideConstructor);

  Object.getOwnPropertyNames(scope.wrappers).forEach(function(name) {
    window[name] = scope.wrappers[name]
  });

})(window.ShadowDOMPolyfill);
