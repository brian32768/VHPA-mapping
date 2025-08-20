import Control from 'ol/control/Control.js';

export default class LayerSwitcher extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const element = document.createElement('div');
    element.className = 'ol-layer-switcher ol-unselectable ol-control';

    super({
      element: element,
      target: options.target,
    });
  }

  setMap(map) {
    super.setMap(map);
    this.mapListeners && this.mapListeners.forEach((key) => key.remove());
    if (map) {
      this.renderPanel();
      this.mapListeners = [
        map.getLayers().on('add', () => this.renderPanel()),
        map.getLayers().on('remove', () => this.renderPanel()),
      ];
    }
  }

  renderPanel() {
    const map = this.getMap();
    if (!map) return;
    const layers = map.getLayers().getArray();
    this.element.innerHTML = '';
    layers.forEach((layer, i) => {
      const label = layer.get('title') || `Layer #${i+1}`;
      const input = document.createElement('input');
      input.type = layer.get('type') === 'base' ? 'radio' : 'checkbox';
      input.name = layer.get('type') === 'base' ? 'base' : undefined;
      input.checked = layer.getVisible();
      input.onchange = () => {
        if (layer.get('type') === 'base') {
          // Only one base layer visible at a time
          layers.forEach((l) => {
            if (l.get('type') === 'base') l.setVisible(l === layer);
          });
        } else {
          layer.setVisible(input.checked);
        }
      };
      const lbl = document.createElement('label');
      lbl.appendChild(input);
      lbl.appendChild(document.createTextNode(' ' + label));
      this.element.appendChild(lbl);
      this.element.appendChild(document.createElement('br'));
    });
  }
}