/* @ds-bundle: {"format":4,"namespace":"ScoutVestiario","components":[{"name":"Button"},{"name":"Tabs"},{"name":"ClubBand"},{"name":"Card"},{"name":"StatCell"},{"name":"MetricsGrid"},{"name":"ChangeChip"},{"name":"MeasurementCard"},{"name":"InlineError"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(" ");
  }

  function luminance(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return 0;
    var n = parseInt(m[1], 16);
    return [n >> 16, (n >> 8) & 255, n & 255]
      .map(function (c) {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      })
      .reduce(function (acc, c, i) {
        return acc + c * [0.2126, 0.7152, 0.0722][i];
      }, 0);
  }

  function Button(props) {
    var variant = props.variant || "secondary";
    var rest = Object.assign({}, props);
    delete rest.variant;
    delete rest.className;
    return h("button", Object.assign({ type: "button" }, rest, {
      className: cx("sv-btn", "sv-btn-" + variant, props.className)
    }), props.children);
  }

  function Tabs(props) {
    return h("div", { className: "sv-tabs", role: "tablist", "aria-label": props.ariaLabel },
      props.items.map(function (item) {
        var selected = item.id === props.value;
        return h("button", {
          key: item.id,
          type: "button",
          role: "tab",
          "aria-selected": selected,
          className: cx("sv-tab", selected && "is-selected"),
          onClick: function () { if (props.onChange) props.onChange(item.id); }
        }, item.label, item.count != null ? h("span", { className: "sv-tab-count" }, item.count) : null);
      }));
  }

  function isHex(value) {
    return /^#?[0-9a-f]{6}$/i.test(String(value || "").trim());
  }

  function usable(value) {
    if (!isHex(value)) return false;
    var l = luminance(value);
    return l <= 0.8 && l >= 0.02;
  }

  function bandColor(primary, secondary) {
    if (usable(primary)) return primary;
    if (usable(secondary)) return secondary;
    return null;
  }

  function ClubBand(props) {
    var color = bandColor(props.color, props.secondaryColor);
    var light = color ? luminance(color) > 0.4 : false;
    return h("header", {
      className: cx("sv-band", light && "is-light"),
      style: color ? { background: color } : undefined
    },
      props.crest ? h("img", { className: "sv-band-crest", src: props.crest, alt: "" }) : null,
      h("div", { className: "sv-band-text" },
        h("h2", { className: "sv-band-name" }, props.name),
        props.subtitle ? h("p", { className: "sv-band-sub" }, props.subtitle) : null),
      props.action ? h("div", { className: "sv-band-action" }, props.action) : null);
  }

  function Card(props) {
    return h("section", { className: cx("sv-card", props.className) },
      props.header || null,
      props.title ? h("div", { className: "sv-card-head" },
        h("div", null,
          h("h3", { className: "sv-card-title" }, props.title),
          props.subtitle ? h("p", { className: "sv-card-sub" }, props.subtitle) : null),
        props.aside ? h("div", { className: "sv-card-aside" }, props.aside) : null) : null,
      h("div", { className: cx("sv-card-body", props.flush && "is-flush") }, props.children),
      props.footer ? h("div", { className: "sv-card-foot" }, props.footer) : null);
  }

  function StatCell(props) {
    var state = props.state || "calculada";
    var label = props.unit && props.unit !== "%" ? props.label + ", " + props.unit : props.label;
    var value;
    if (state === "carregando") {
      value = h("span", { className: "sv-skeleton sv-skeleton-value", "aria-hidden": true });
    } else if (state === "recusada") {
      value = h("span", { className: "sv-stat-reason" }, props.reason);
    } else {
      value = h("span", { className: "sv-stat-value" }, props.value, props.unit === "%" ? "%" : null);
    }
    return h("div", { className: cx("sv-stat", "is-" + state), "aria-busy": state === "carregando" || undefined },
      value,
      h("span", { className: "sv-stat-label" }, label));
  }

  function MetricsGrid(props) {
    return h("div", { className: "sv-metrics" },
      h("div", { className: "sv-metrics-grid" },
        props.metrics.map(function (m) {
          return h(StatCell, Object.assign({ key: m.label }, m));
        })),
      props.footnote ? h("p", { className: "sv-metrics-foot" }, props.footnote) : null);
  }

  function ChangeChip(props) {
    var direction = props.direction || "up";
    return h("span", { className: cx("sv-chip", "sv-chip-" + direction) }, props.children);
  }

  function MeasurementCard(props) {
    var state = props.state;
    var body;
    if (state === "ComMudanca") {
      body = h(React.Fragment, null,
        h("p", { className: "sv-measure-values" },
          h("span", { className: "sv-measure-prev" }, props.previous),
          h("span", { className: "sv-measure-arrow", "aria-hidden": true }, " → "),
          h("span", { className: "sv-measure-curr" }, props.current)),
        props.change ? h(ChangeChip, { direction: props.change.direction }, props.change.text) : null);
    } else if (state === "SemMudancaRelevante") {
      body = h(React.Fragment, null,
        h("p", { className: "sv-measure-values" }, h("span", { className: "sv-measure-curr" }, props.current)),
        h("p", { className: "sv-measure-note" }, "Sem mudança relevante"));
    } else {
      body = h("p", { className: "sv-measure-reason" }, props.reason);
    }
    return h("div", { className: cx("sv-measure", "is-" + state) },
      h("p", { className: "sv-measure-title" }, props.title),
      body);
  }

  function InlineError(props) {
    return h("div", { className: "sv-error", role: "alert" },
      h("p", { className: "sv-error-msg" }, props.message),
      props.onRetry ? h(Button, { variant: "secondary", onClick: props.onRetry }, props.retryLabel || "Tentar de novo") : null);
  }

  window.ScoutVestiario = Object.assign(window.ScoutVestiario || {}, {
    Button: Button,
    Tabs: Tabs,
    ClubBand: ClubBand,
    Card: Card,
    StatCell: StatCell,
    MetricsGrid: MetricsGrid,
    ChangeChip: ChangeChip,
    MeasurementCard: MeasurementCard,
    InlineError: InlineError
  });
})();
