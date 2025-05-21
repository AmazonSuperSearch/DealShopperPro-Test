// form-tracking.js

(function runWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCore);
  } else {
    runCore();
  }

  function runCore() {
    console.log('[form-tracking] Running core logic');

    // ─────── grab sounds ───────
    const clickSound       = document.getElementById("clickSound");
    const boxSelectSound   = document.getElementById("boxselect");
    const boxUnselectSound = document.getElementById("boxunselect");

    // ─── play click sound on any button/submit/input click ───
    if (clickSound) {
      document.addEventListener("click", (e) => {
        const tgt = e.target;
        if (tgt.matches("button, input[type=submit], input[type=button]")) {
          clickSound.currentTime = 0;
          clickSound.play().catch(() => {});
        }
      });
    }

   // ─── play select or unselect sound on any checkbox change ───
document.querySelectorAll('input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', (e) => {
    console.log("Checkbox change → checked?", e.target.checked);
    if (e.target.checked) {
      console.log("▶️ select branch");
      if (boxSelectSound) {
        boxSelectSound.currentTime = 0;
        boxSelectSound.play().catch(err => console.error("Select play error:", err));
      }
    } else {
      console.log("⏸ unselect branch, boxUnselectSound:", boxUnselectSound);
      if (boxUnselectSound) {
        boxUnselectSound.currentTime = 0;
        boxUnselectSound.play().catch(err => console.error("Unselect play error:", err));
      } else {
        console.warn("❌ boxUnselectSound is null");
      }
    }
  });
});

    // ─── grab the form and wire up submit logic ───
    const form = document.getElementById("amazon-search-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();  // stop the normal form post

      // 💥 play click sound again on submit
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
      }

      // 🧠 Brand filters
      const data = new FormData(form);
      const rh = [];

      const brandIncludeRaw = data.get('brand-include')?.trim();
      const brandExcludeRaw = data.get('brand-exclude')?.trim();

      if (brandIncludeRaw) {
        try {
          const brands = JSON.parse(brandIncludeRaw).map(obj => obj.value);
          brands.forEach(b => rh.push(`p_89:${encodeURIComponent(b)}`));
        } catch (err) {
          console.warn("Brand include invalid JSON", brandIncludeRaw);
        }
      }

      if (brandExcludeRaw) {
        try {
          const brands = JSON.parse(brandExcludeRaw).map(obj => obj.value);
          brands.forEach(b => rh.push(`p_89:-${encodeURIComponent(b)}`));
        } catch (err) {
          console.warn("Brand exclude invalid JSON", brandExcludeRaw);
        }
      }

      console.log("Final RH filters:", rh.join(","));

      // 🔔 Fire GA4 search_submit event
      if (window.gtag) {
        gtag('event', 'search_submit', {
          search_term: data.get('q') || '',
          filters: rh.join(',')
        });
      }

      // ▶️ Perform the redirect
      const base = form.action || 'https://amazonsupersearch.com/';
      const q = data.get('q') || '';
      const encodedQuery = encodeURIComponent(q);
      const filterParam = rh.length > 0 ? `&rh=${rh.join(',')}` : '';
      window.location.href = `${base}?k=${encodedQuery}${filterParam}`;
    }); // end form.submit listener

  } // end runCore()

})(); // end IIFE
