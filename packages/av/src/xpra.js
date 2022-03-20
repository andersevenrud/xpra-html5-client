// based on aurora-websocket.js https://github.com/fsbdev/aurora-websocket
// MIT licensed
import AV from './av'

AV.XpraSource = class XpraSource extends AV.EventEmitter {
  start() {
    return true
  }

  pause() {
    return true
  }

  reset() {
    return true
  }

  _on_data(data) {
    var buf = new AV.Buffer(data);
    return this.emit('data', buf);
  }
}

AV.Asset.fromXpraSource = function() {
  var source = new AV.XpraSource();
  return new AV.Asset(source);
};

AV.Player.fromXpraSource = function() {
  var asset = AV.Asset.fromXpraSource();
  return new AV.Player(asset);
};
