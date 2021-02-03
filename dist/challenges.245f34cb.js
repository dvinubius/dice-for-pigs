// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"challenges.js":[function(require,module,exports) {
/*
YOUR 3 CHALLENGES
Change the game to follow these rules:

1. A player looses his ENTIRE score when he rolls two 6 in a row. After that, it's the next player's turn. (Hint: Always save the previous dice roll in a separate variable)
2. Add an input field to the HTML where players can set the winning score, so that they can change the predefined score of 100. (Hint: you can read that value with the .value property in JavaScript. This is a good oportunity to use google to figure this out :)
3. Add another dice to the game, so that there are two dices now. The player looses his current score when one of them is a 1. (Hint: you will need CSS to position the second dice, so take a look at the CSS code for the first one.)
*/
// state
var scores, roundScore, activePlayer, gamePlaying, rolledSix; // controls

var rollButton, holdButton, resetButton, maxScoreInput; // displayed elements

var dice0DOM, dice1DOM, ouchDOM, panelPl0DOM, panelPl1DOM;
init();
var rolls$ = rxjs.fromEvent(rollButton, "click");
rolls$.pipe(rxjs.operators.map(function () {
  // Gen Random numbers
  var dice0 = Math.floor(Math.random() * 6) + 1;
  var dice1 = Math.floor(Math.random() * 6) + 1;
  return {
    dice0: dice0,
    dice1: dice1
  };
})).subscribe(function (_ref) {
  var dice0 = _ref.dice0,
      dice1 = _ref.dice1;

  if (gamePlaying) {
    // Display the result
    dice0DOM.style.display = "block";
    dice0DOM.src = "dice-" + dice0 + ".png";
    dice1DOM.style.display = "block";
    dice1DOM.src = "dice-" + dice1 + ".png"; // Catastrophy check

    if (dice1 === 6 || dice0 === 6) {
      if (rolledSix) {
        ouchMessage(6).then(function () {
          scores[activePlayer] = 0;
          nextPlayer();
        });
      } else {
        rolledSix = true;
      }
    } else {
      rolledSix = false;
    } // Update the round score IF the rolled number was NOT a 1


    if (dice0 !== 1 && dice1 !== 1) {
      //Add score
      roundScore += dice0 + dice1;
      document.querySelector("#current-" + activePlayer).textContent = roundScore;
    } else {
      ouchMessage(1).then(function () {
        return nextPlayer();
      });
    }
  }
});
var holds$ = rxjs.fromEvent(holdButton, "click");
holds$.subscribe(function () {
  if (gamePlaying) {
    // Add CURRENT score to GLOBAL score
    scores[activePlayer] += roundScore; // Update the UI

    document.querySelector("#score-" + activePlayer).textContent = scores[activePlayer]; // Check if player won the game

    var customVal = document.querySelector(".max-score-input").value;
    var usedVal = customVal === "" ? 100 : Number(customVal);

    if (scores[activePlayer] >= usedVal) {
      document.querySelector("#name-" + activePlayer).textContent = "Winner!";
      document.querySelectorAll(".dice")[0].style.display = "none";
      document.querySelectorAll(".dice")[1].style.display = "none";
      document.querySelector(".player-" + activePlayer + "-panel").classList.add("winner");
      document.querySelector(".player-" + activePlayer + "-panel").classList.remove("active");
      gamePlaying = false;
    } else {
      //Next player
      nextPlayer();
    }
  }
});

function ouchMessage(number) {
  var text;

  if (number === 6) {
    text = "<strong>OUCH!<strong>\nThe 6-es";
  } else {
    text = "<strong>OUCH!<strong>\nRolled some 1";
  }

  return new Promise(function (success, fail) {
    ouchDOM.firstElementChild.innerHTML = text;
    ouchDOM.style.display = "block";
    setTimeout(function () {
      ouchDOM.style.display = "none";
      success();
    }, 1200);
  });
}

function nextPlayer() {
  //Next player
  activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
  roundScore = 0;
  document.getElementById("current-0").textContent = "0";
  document.getElementById("current-1").textContent = "0";
  panelPl0DOM.classList.toggle("active");
  panelPl1DOM.classList.toggle("active");
  dice0DOM.style.display = "none";
  dice1DOM.style.display = "none";
}

var resets$ = rxjs.fromEvent(resetButton, "click");
resets$.subscribe(init);
var maxScores$ = rxjs.fromEvent(maxScoreInput, "keypress");
maxScores$.pipe(rxjs.operators.filter(function (ev) {
  return ev.keyCode === 13;
})).subscribe(function (ev) {
  return ev.target.blur();
});

function init() {
  // initial values for variables
  scores = [0, 0];
  activePlayer = 0;
  roundScore = 0;
  gamePlaying = true;
  rolledSix = false;
  rollButton = document.querySelector(".btn-roll");
  holdButton = document.querySelector(".btn-hold");
  resetButton = document.querySelector(".btn-new");
  maxScoreInput = document.querySelector(".max-score-input");
  dice0DOM = document.querySelectorAll(".dice")[0];
  dice1DOM = document.querySelectorAll(".dice")[1];
  ouchDOM = document.querySelector(".ouch");
  panelPl0DOM = document.querySelector(".player-0-panel");
  panelPl1DOM = document.querySelector(".player-1-panel"); // initial values in content & styling

  dice0DOM.style.display = "none";
  dice1DOM.style.display = "none";
  ouchDOM.style.display = "none";
  document.getElementById("score-0").textContent = "0";
  document.getElementById("score-1").textContent = "0";
  document.getElementById("current-0").textContent = "0";
  document.getElementById("current-1").textContent = "0";
  document.getElementById("name-0").textContent = "Player 1";
  document.getElementById("name-1").textContent = "Player 2";
  panelPl0DOM.classList.remove("winner");
  panelPl1DOM.classList.remove("winner");
  panelPl0DOM.classList.remove("active");
  panelPl1DOM.classList.remove("active");
  panelPl0DOM.classList.add("active");
}
},{}],"../../../.nvm/versions/node/v12.7.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55182" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.nvm/versions/node/v12.7.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","challenges.js"], null)
//# sourceMappingURL=/challenges.245f34cb.js.map