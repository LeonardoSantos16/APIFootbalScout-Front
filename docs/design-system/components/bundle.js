/* @ds-bundle: {"format":4,"namespace":"ScoutVestiario","components":[{"name":"Button"},{"name":"Tabs"},{"name":"ClubBand"},{"name":"Card"},{"name":"StatCell"},{"name":"MetricsGrid"},{"name":"ChangeChip"},{"name":"MeasurementCard"},{"name":"InlineError"},{"name":"Select"},{"name":"TextField"},{"name":"PasswordField"},{"name":"Notice"},{"name":"Dialog"}]} */
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
      h("span", { className: "sv-stat-label" }, label),
      state === "calculada" && props.sample ? h("span", { className: "sv-stat-sample" }, props.sample) : null);
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

  function Select(props) {
    var id = React.useId();
    var field;
    if (props.loading) {
      field = h("span", { className: "sv-skeleton sv-select-skeleton", "aria-hidden": true });
    } else {
      field = h("div", { className: "sv-select-wrap" },
        h("select", {
          id: id,
          className: "sv-select",
          value: props.value,
          onChange: function (e) { if (props.onChange) props.onChange(e.target.value); }
        }, props.options.map(function (o) {
          return h("option", { key: o.value, value: o.value }, o.label);
        })),
        h("svg", { className: "sv-select-caret", viewBox: "0 0 256 256", fill: "currentColor", "aria-hidden": true },
          h("path", { d: "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" })));
    }
    return h("div", { className: "sv-field", "aria-busy": props.loading || undefined },
      h("label", { className: "sv-field-label", htmlFor: id }, props.label),
      field);
  }

  function TextField(props) {
    var id = React.useId();
    var hintId = id + "-hint";
    var errorId = id + "-error";
    var described = props.error ? errorId : props.hint ? hintId : undefined;
    var rest = Object.assign({}, props);
    ["label", "hint", "error", "trailing", "className"].forEach(function (k) { delete rest[k]; });
    var input = h("input", Object.assign({ type: "text" }, rest, {
      id: id,
      className: "sv-input",
      "aria-invalid": props.error ? true : undefined,
      "aria-describedby": described
    }));
    return h("div", { className: cx("sv-field", props.className) },
      h("label", { className: "sv-field-label", htmlFor: id }, props.label),
      h("div", { className: cx("sv-input-wrap", props.error && "is-invalid", props.disabled && "is-disabled") },
        input,
        props.trailing || null),
      props.error ? h("span", { className: "sv-field-error", id: errorId }, props.error)
        : props.hint ? h("span", { className: "sv-field-hint", id: hintId }, props.hint) : null);
  }

  function PasswordField(props) {
    var s = React.useState(false);
    var visible = s[0];
    var toggle = h("button", {
      type: "button",
      className: "sv-input-toggle",
      disabled: props.disabled,
      "aria-pressed": visible,
      onClick: function () { s[1](!visible); }
    }, visible ? "Ocultar" : "Mostrar");
    return h(TextField, Object.assign({}, props, { type: visible ? "text" : "password", trailing: toggle }));
  }

  function Notice(props) {
    return h("p", { className: "sv-notice", role: "status" }, props.children);
  }

  function Dialog(props) {
    var titleId = React.useId();
    if (!props.open) return null;
    return h("div", { className: "sv-dialog-backdrop" },
      h("div", { className: "sv-dialog", role: "dialog", "aria-modal": true, "aria-labelledby": titleId },
        h("div", { className: "sv-dialog-head" },
          h("h2", { className: "sv-dialog-title", id: titleId }, props.title),
          h("button", { type: "button", className: "sv-dialog-close", "aria-label": "Fechar", onClick: props.onClose },
            h("svg", { viewBox: "0 0 256 256", width: 20, height: 20, fill: "currentColor", "aria-hidden": true },
              h("path", { d: "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" })))),
        props.description ? h("p", { className: "sv-dialog-desc" }, props.description) : null,
        props.children,
        props.actions ? h("div", { className: "sv-dialog-actions" }, props.actions) : null));
  }

  window.ScoutVestiario = Object.assign(window.ScoutVestiario || {}, {
    TextField: TextField,
    PasswordField: PasswordField,
    Notice: Notice,
    Dialog: Dialog,
    Select: Select,
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
