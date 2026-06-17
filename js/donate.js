/* ============================================================
   הצדיק מעג׳ור — לוגיקת דף התרומה
   בחירת מטרה / סכום / תדירות / הקדשה, עדכון סיכום, ומעבר לסליקה
   ============================================================ */
(function () {
  "use strict";

  var state = {
    purpose: "הדלקת נר נשמה",
    amount: 100,
    freq: "once",
    dedType: "",
    dedName: ""
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function shekel(n) { return "₪" + Number(n || 0).toLocaleString("he-IL"); }

  /* ---------- מטרת התרומה ---------- */
  $all(".seg-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $all(".seg-tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      state.purpose = tab.getAttribute("data-purpose");
      render();
    });
  });

  /* ---------- סכום ---------- */
  var customInput = $("#customAmount");
  $all(".amount").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".amount").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.amount = parseInt(btn.getAttribute("data-amount"), 10);
      if (customInput) customInput.value = "";
      render();
    });
  });
  if (customInput) {
    customInput.addEventListener("input", function () {
      var v = parseInt(customInput.value, 10);
      if (v > 0) {
        $all(".amount").forEach(function (b) { b.classList.remove("active"); });
        state.amount = v;
        render();
      }
    });
  }

  /* ---------- תדירות ---------- */
  $all(".freq").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".freq").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.freq = btn.getAttribute("data-freq");
      render();
    });
  });

  /* ---------- הקדשה ---------- */
  var dedType = $("#dedType");
  var dedName = $("#dedName");
  if (dedType) dedType.addEventListener("change", function () { state.dedType = dedType.value; render(); });
  if (dedName) dedName.addEventListener("input", function () { state.dedName = dedName.value.trim(); render(); });

  /* ---------- עדכון הסיכום ---------- */
  function render() {
    var amountTxt = shekel(state.amount) + (state.freq === "monthly" ? " לחודש" : "");
    var freqTxt = state.freq === "monthly" ? "הוראת קבע חודשית" : "חד־פעמית";
    var dedTxt = state.dedType ? (state.dedType + " " + (state.dedName || "…")) : "—";

    setText("#sumPurpose", state.purpose);
    setText("#sumFreq", freqTxt);
    setText("#sumDed", dedTxt);
    setText("#sumAmount", amountTxt);
    setText("#submitAmount", amountTxt);
  }
  function setText(sel, txt) { var el = $(sel); if (el) el.textContent = txt; }

  /* ---------- שליחה / מעבר לסליקה ---------- */
  var form = $("#donateForm");
  var status = $("#donateStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#donorName");
      var phone = $("#donorPhone");

      if (!state.amount || state.amount < 1) {
        return showStatus("נא לבחור סכום תרומה 🙏", true);
      }
      if (!name.value.trim() || !phone.value.trim()) {
        return showStatus("נא למלא שם וטלפון כדי להמשיך 🙏", true);
      }

      /* ====================================================================
         נקודת חיבור לסליקה אמיתית
         --------------------------------------------------------------------
         כאן מחברים את ספק הסליקה (לדוגמה: נדרים פלוס / מסב / טרנזילה / משולם).
         בונים את כתובת התשלום עם הפרטים שנאספו ומפנים אליה את התורם:

         var params = new URLSearchParams({
           amount:  state.amount,
           freq:    state.freq,
           purpose: state.purpose,
           ded:     state.dedType + " " + state.dedName,
           name:    name.value,
           phone:   phone.value
         });
         window.location.href = "https://<עמוד-הסליקה-שלכם>?" + params.toString();
         ==================================================================== */

      var data = {
        purpose: state.purpose, amount: state.amount, freq: state.freq,
        dedication: state.dedType ? state.dedType + " " + state.dedName : "",
        name: name.value.trim(), phone: phone.value.trim(),
        email: ($("#donorEmail") || {}).value || ""
      };
      console.log("פרטי תרומה (להעברה לסליקה):", data);

      showStatus("מצוין! החיבור לעמוד הסליקה המאובטח יושלם לאחר הגדרת ספק התשלומים. הפרטים מוכנים ✓ 🕯️", false);
    });
  }

  function showStatus(msg, isError) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? "#f0b8b8" : "";
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  render();
})();
