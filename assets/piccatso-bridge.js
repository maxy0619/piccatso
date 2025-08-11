/* Piccatso → Shopify line item properties bridge */
(function initPiccatsoBridge() {
  function setValue(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el) return;
      el.value = value || '';
      // Trigger change for any listeners
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    });
  }

  function applyRenderPayload(payload) {
    if (!payload || typeof payload !== 'object') return;
    const { renderUrl, renderID, renderId, style } = payload;
    const id = renderID || renderId;
    setValue('input[name="properties[Piccatso Render URL]"]', renderUrl);
    setValue('input[name="properties[Piccatso Render ID]"]', id);
    setValue('input[name="properties[Piccatso Style]"]', style);
  }

  // Public bridge
  window.PiccatsoBridge = {
    setRender: applyRenderPayload,
  };

  // Listen for common custom events the app might dispatch
  document.addEventListener('piccatso:render', function (evt) {
    applyRenderPayload(evt.detail || {});
  });
  document.addEventListener('piccatso:previewReady', function (evt) {
    applyRenderPayload(evt.detail || {});
  });
})();


