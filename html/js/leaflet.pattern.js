/*
 Leaflet.pattern, Provides tools to set the backgrounds of vector shapes in Leaflet to be patterns.
 https://github.com/teastman/Leaflet.pattern
 (c) 2015, Tyler Eastman
*/
!(function (t, e) {
  (L.Pattern = L.Class.extend({
    includes: [L.Mixin.Events],
    options: { x: 0, y: 0, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternContentUnits: 'userSpaceOnUse' },
    _addShapes: L.Util.falseFn,
    _update: L.Util.falseFn,
    initialize: function (t) {
      (this._shapes = {}), L.setOptions(this, t);
    },
    onAdd: function (t) {
      (this._map = t.target ? t.target : t), this._map._initDefRoot(), this._initDom();
      for (var e in this._shapes) this._shapes[e].onAdd(this);
      this._addShapes(), this._addDom(), this.redraw(), this.getEvents && this._map.on(this.getEvents(), this), this.fire('add'), this._map.fire('patternadd', { pattern: this });
    },
    onRemove: function () {
      this._removeDom();
    },
    redraw: function () {
      if (this._map) {
        this._update();
        for (var t in this._shapes) this._shapes[t].redraw();
      }
      return this;
    },
    setStyle: function (t) {
      return L.setOptions(this, t), this._map && (this._updateStyle(), this.redraw()), this;
    },
    addTo: function (t) {
      return t.addPattern(this), this;
    },
    remove: function () {
      return this.removeFrom(this._map);
    },
    removeFrom: function (t) {
      return t && t.removePattern(this), this;
    },
  })),
    L.Map.addInitHook(function () {
      this._patterns = {};
    }),
    L.Map.include({
      addPattern: function (t) {
        var e = L.stamp(t);
        return this._patterns[e] ? t : ((this._patterns[e] = t), this.whenReady(t.onAdd, t), this);
      },
      removePattern: function (t) {
        var e = L.stamp(t);
        return this._patterns[e]
          ? (this._loaded && t.onRemove(this), t.getEvents && this.off(t.getEvents(), t), delete this._patterns[e], this._loaded && (this.fire('patternremove', { pattern: t }), t.fire('remove')), (t._map = null), this)
          : this;
      },
      hasPattern: function (t) {
        return !!t && L.stamp(t) in this._patterns;
      },
    }),
    (L.Pattern.SVG_NS = 'http://www.w3.org/2000/svg'),
    (L.Pattern = L.Pattern.extend({
      _createElement: function (t) {
        return e.createElementNS(L.Pattern.SVG_NS, t);
      },
      _initDom: function () {
        (this._dom = this._createElement('pattern')), this.options.className && L.DomUtil.addClass(this._dom, this.options.className), this._updateStyle();
      },
      _addDom: function () {
        this._map._defRoot.appendChild(this._dom);
      },
      _removeDom: function () {
        L.DomUtil.remove(this._dom);
      },
      _updateStyle: function () {
        var t = this._dom,
          e = this.options;
        if (t) {
          if (
            (t.setAttribute('id', L.stamp(this)),
            t.setAttribute('x', e.x),
            t.setAttribute('y', e.y),
            t.setAttribute('width', e.width),
            t.setAttribute('height', e.height),
            t.setAttribute('patternUnits', e.patternUnits),
            t.setAttribute('patternContentUnits', e.patternContentUnits),
            e.patternTransform || e.angle)
          ) {
            var i = e.patternTransform ? e.patternTransform + ' ' : '';
            (i += e.angle ? 'rotate(' + e.angle + ') ' : ''), t.setAttribute('patternTransform', i);
          } else t.removeAttribute('patternTransform');
          for (var s in this._shapes) this._shapes[s]._updateStyle();
        }
      },
    })),
    L.Map.include({
      _initDefRoot: function () {
        if (!this._defRoot)
          if ('function' == typeof this.getRenderer) {
            var t = this.getRenderer(this);
            (this._defRoot = L.Pattern.prototype._createElement('defs')), t._container.appendChild(this._defRoot);
          } else this._pathRoot || this._initPathRoot(), (this._defRoot = L.Pattern.prototype._createElement('defs')), this._pathRoot.appendChild(this._defRoot);
      },
    }),
    L.SVG
      ? L.SVG.include({
          _superUpdateStyle: L.SVG.prototype._updateStyle,
          _updateStyle: function (t) {
            this._superUpdateStyle(t), t.options.fill && t.options.fillPattern && t._path.setAttribute('fill', 'url(#' + L.stamp(t.options.fillPattern) + ')');
          },
        })
      : L.Path.include({
          _superUpdateStyle: L.Path.prototype._updateStyle,
          _updateStyle: function () {
            this._superUpdateStyle(), this.options.fill && this.options.fillPattern && this._path.setAttribute('fill', 'url(#' + L.stamp(this.options.fillPattern) + ')');
          },
        }),
    (L.StripePattern = L.Pattern.extend({
      options: { weight: 4, spaceWeight: 4, color: '#000000', spaceColor: '#ffffff', opacity: 1, spaceOpacity: 0 },
      _addShapes: function () {
        (this._stripe = new L.PatternPath({ stroke: !0, weight: this.options.weight, color: this.options.color, opacity: this.options.opacity })),
          (this._space = new L.PatternPath({ stroke: !0, weight: this.options.spaceWeight, color: this.options.spaceColor, opacity: this.options.spaceOpacity })),
          this.addShape(this._stripe),
          this.addShape(this._space),
          this._update();
      },
      _update: function () {
        (this._stripe.options.d = 'M0 ' + this._stripe.options.weight / 2 + ' H ' + this.options.width), (this._space.options.d = 'M0 ' + (this._stripe.options.weight + this._space.options.weight / 2) + ' H ' + this.options.width);
      },
      setStyle: L.Pattern.prototype.setStyle,
    })),
    (L.stripePattern = function (t) {
      return new L.StripePattern(t);
    }),
    (L.PatternShape = L.Class.extend({
      options: { stroke: !0, color: '#3388ff', weight: 3, opacity: 1, lineCap: 'round', lineJoin: 'round', fillOpacity: 0.2, fillRule: 'evenodd' },
      initialize: function (t) {
        L.setOptions(this, t);
      },
      onAdd: function (t) {
        (this._pattern = t), this._pattern._dom && (this._initDom(), this._addDom());
      },
      addTo: function (t) {
        return t.addShape(this), this;
      },
      redraw: function () {
        return this._pattern && this._updateShape(), this;
      },
      setStyle: function (t) {
        return L.setOptions(this, t), this._pattern && this._updateStyle(), this;
      },
      setShape: function (t) {
        (this.options = L.extend({}, this.options, t)), this._updateShape();
      },
    })),
    L.Pattern.include({
      addShape: function (t) {
        var e = L.stamp(t);
        return this._shapes[e] ? t : ((this._shapes[e] = t), t.onAdd(this), void 0);
      },
    }),
    (L.PatternShape.SVG_NS = 'http://www.w3.org/2000/svg'),
    (L.PatternShape = L.PatternShape.extend({
      _createElement: function (t) {
        return e.createElementNS(L.PatternShape.SVG_NS, t);
      },
      _initDom: L.Util.falseFn,
      _updateShape: L.Util.falseFn,
      _initDomElement: function (t) {
        (this._dom = this._createElement(t)), this.options.className && L.DomUtil.addClass(this._dom, this.options.className), this._updateStyle();
      },
      _addDom: function () {
        this._pattern._dom.appendChild(this._dom);
      },
      _updateStyle: function () {
        var t = this._dom,
          e = this.options;
        t &&
          (e.stroke
            ? (t.setAttribute('stroke', e.color),
              t.setAttribute('stroke-opacity', e.opacity),
              t.setAttribute('stroke-width', e.weight),
              t.setAttribute('stroke-linecap', e.lineCap),
              t.setAttribute('stroke-linejoin', e.lineJoin),
              e.dashArray ? t.setAttribute('stroke-dasharray', e.dashArray) : t.removeAttribute('stroke-dasharray'),
              e.dashOffset ? t.setAttribute('stroke-dashoffset', e.dashOffset) : t.removeAttribute('stroke-dashoffset'))
            : t.setAttribute('stroke', 'none'),
          e.fill
            ? (e.fillPattern ? t.setAttribute('fill', 'url(#' + L.stamp(e.fillPattern) + ')') : t.setAttribute('fill', e.fillColor || e.color),
              t.setAttribute('fill-opacity', e.fillOpacity),
              t.setAttribute('fill-rule', e.fillRule || 'evenodd'))
            : t.setAttribute('fill', 'none'),
          t.setAttribute('pointer-events', e.pointerEvents || (e.interactive ? 'visiblePainted' : 'none')));
      },
    })),
    (L.PatternPath = L.PatternShape.extend({
      _initDom: function () {
        this._initDomElement('path');
      },
      _updateShape: function () {
        this._dom && this._dom.setAttribute('d', this.options.d);
      },
    })),
    (L.PatternCircle = L.PatternShape.extend({
      options: { x: 0, y: 0, radius: 0 },
      _initDom: function () {
        this._initDomElement('circle');
      },
      _updateShape: function () {
        this._dom && (this._dom.setAttribute('cx', this.options.x), this._dom.setAttribute('cy', this.options.y), this._dom.setAttribute('r', this.options.radius));
      },
    })),
    (L.PatternRect = L.PatternShape.extend({
      options: { x: 0, y: 0, width: 10, height: 10 },
      _initDom: function () {
        this._initDomElement('rect');
      },
      _updateShape: function () {
        this._dom &&
          (this._dom.setAttribute('x', this.options.x),
          this._dom.setAttribute('y', this.options.y),
          this._dom.setAttribute('width', this.options.width),
          this._dom.setAttribute('height', this.options.height),
          this.options.rx && this._dom.setAttribute('rx', this.options.rx),
          this.options.ry && this._dom.setAttribute('ry', this.options.ry));
      },
    }));
})(window, document);
