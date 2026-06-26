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

  /* ====================================================================
     הגדרות סליקה — נדרים פלוס
     --------------------------------------------------------------------
     לאחר פתיחת חשבון בנדרים פלוס מדביקים כאן את כתובת עמוד הסליקה של המוסד
     (מתקבלת מנדרים פלוס לפי "מספר מוסד"). כל עוד הערך ריק — הכפתור יציג
     הודעה ידידותית ולא יפנה לסליקה, כך שהאתר תקין גם לפני החיבור.
     ==================================================================== */
  var NEDARIM_PAY_URL = "https://nedar.im/cwwQ"; // עמוד הסליקה בנדרים פלוס — מוסדות אור תורת שלום (המאורות)

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

      var data = {
        purpose: state.purpose, amount: state.amount, freq: state.freq,
        dedication: state.dedType ? state.dedType + " " + state.dedName : "",
        name: name.value.trim(), phone: phone.value.trim(),
        email: ($("#donorEmail") || {}).value || ""
      };

      /* כל עוד לא הוגדרה כתובת הסליקה של נדרים פלוס — הודעה ידידותית (האתר נשאר תקין) */
      if (!NEDARIM_PAY_URL) {
        console.log("פרטי תרומה (מוכנים להעברה לנדרים פלוס):", data);
        return showStatus("הפרטים מוכנים ✓ — חיבור הסליקה המאובטח של נדרים פלוס יופעל מיד עם קבלת פרטי החשבון של העמותה 🕯️", false);
      }

      /* מעבר לעמוד הסליקה המאובטח של נדרים פלוס (קישור המוסד).
         הסכום והפרטים נבחרים ומשולמים בעמוד המאובטח של נדרים פלוס. */
      showStatus("הפרטים נשמרו ✓ מעבירים אותך לעמוד הסליקה המאובטח של נדרים פלוס… 🔒", false);
      setTimeout(function () { window.location.href = NEDARIM_PAY_URL; }, 700);
    });
  }

  function showStatus(msg, isError) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? "#f0b8b8" : "";
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- מסלולי התרמה (כרטיסים שממלאים את הטופס) ---------- */
  function setAmount(amt) {
    state.amount = amt;
    var matched = false;
    $all(".amount").forEach(function (b) {
      var on = parseInt(b.getAttribute("data-amount"), 10) === amt;
      b.classList.toggle("active", on); if (on) matched = true;
    });
    if (customInput) customInput.value = matched ? "" : amt;
  }
  function setFreq(f) {
    state.freq = f;
    $all(".freq").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-freq") === f); });
  }
  $all(".track-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".track-card");
      $all(".track-card").forEach(function (c) { c.classList.remove("picked"); });
      if (card) card.classList.add("picked");
      $all(".seg-tab").forEach(function (t) { t.classList.remove("active"); });
      state.purpose = btn.getAttribute("data-purpose");
      setAmount(parseInt(btn.getAttribute("data-amount"), 10) || 100);
      setFreq(btn.getAttribute("data-freq") || "once");
      render();
      var f = $("#donateForm"); if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  $all(".seg-tab").forEach(function (tab) {
    tab.addEventListener("click", function () { $all(".track-card").forEach(function (c) { c.classList.remove("picked"); }); });
  });

  render();
})();
