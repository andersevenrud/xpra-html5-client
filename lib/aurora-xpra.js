
export default function(AV) {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  const XpraSource = (function(_super) {
    __extends(XpraSource, _super);

    function XpraSource() {
      // constructor
    }

    XpraSource.prototype.start = function() {
      return true;
    };

    XpraSource.prototype.pause = function() {
      return true;
    };

    XpraSource.prototype.reset = function() {
      return true;
    };

    XpraSource.prototype._on_data = function(data) {
      var buf = new AV.Buffer(data);
      return this.emit('data', buf);
    };

    return XpraSource;

  })(AV.EventEmitter);

  const source = new XpraSource();
  const asset = new AV.Asset(source);
  return new AV.Player(asset);
};
