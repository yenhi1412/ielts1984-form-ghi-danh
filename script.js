// ===== Class data =====
const CLASSES = [
  { code: "ROOT 06.26 ONL A", mode: "ONLINE",  start: "01/06/2026", session: "Chiều 2-4-6", time: "17:45 - 19:45", fee: "8,900,000 đ", status: "open" },
  { code: "ROOT 06.26 ONL E", mode: "ONLINE",  start: "08/06/2026", session: "Tối 2-4-6",   time: "20:00 - 22:00", fee: "8,900,000 đ", status: "open" },
  { code: "ROOT 06.26 ONL F", mode: "ONLINE",  start: "09/06/2026", session: "Tối 3-5-7",   time: "20:00 - 22:00", fee: "8,900,000 đ", status: "full" },
  { code: "ROOT 06.26 ONL L", mode: "ONLINE",  start: "15/06/2026", session: "Chiều 2-4-6", time: "17:45 - 19:45", fee: "8,900,000 đ", status: "open" },
  { code: "ROOT 06.26 ONL K", mode: "ONLINE",  start: "16/06/2026", session: "Chiều 3-5-7", time: "17:45 - 19:45", fee: "8,900,000 đ", status: "open" },
  { code: "ROOT 06.26 ONL P", mode: "ONLINE",  start: "23/06/2026", session: "Tối 3-5-7",   time: "20:00 - 22:00", fee: "8,900,000 đ", status: "full" },
  { code: "ROOT 05.26 OFF M", mode: "OFFLINE", start: "26/05/2026", session: "Chiều 3-5-7", time: "17:45 - 19:45", fee: "9,200,000 đ", status: "open" },
  { code: "ROOT 05.26 OFF L", mode: "OFFLINE", start: "26/05/2026", session: "Tối 3-5-7",   time: "20:00 - 22:00", fee: "9,200,000 đ", status: "open" },
  { code: "ROOT 06.26 OFF E", mode: "OFFLINE", start: "08/06/2026", session: "Chiều 2-4-6", time: "17:45 - 19:45", fee: "9,200,000 đ", status: "open" },
  { code: "ROOT 06.26 OFF F", mode: "OFFLINE", start: "09/06/2026", session: "Tối 3-5-7",   time: "20:00 - 22:00", fee: "9,200,000 đ", status: "open" },
  { code: "ROOT 06.26 OFF K", mode: "OFFLINE", start: "16/06/2026", session: "Chiều 3-5-7", time: "17:45 - 19:45", fee: "9,200,000 đ", status: "full" },
  { code: "ROOT 06.26 OFF P", mode: "OFFLINE", start: "22/06/2026", session: "Tối 2-4-6",   time: "20:00 - 22:00", fee: "9,200,000 đ", status: "open" },
];

function renderClassRows() {
  const tbody = document.getElementById("class-rows");
  tbody.innerHTML = CLASSES.map((c, i) => {
    const full = c.status === "full";
    return `
    <tr data-index="${i}" class="${full ? "full" : ""}">
      <td>
        <div class="code-cell">
          <input type="radio" name="class" value="${c.code}" id="class-${i}" ${full ? "data-full=\"1\"" : ""} />
          <label for="class-${i}">${c.code}</label>
          <button type="button" class="copy-btn" data-code="${c.code}" title="Sao chép mã lớp" aria-label="Sao chép mã lớp">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </td>
      <td><span class="mode-pill ${c.mode === "OFFLINE" ? "offline" : ""}">${c.mode}</span></td>
      <td>${c.start}</td>
      <td>${c.session}</td>
      <td>${c.time}</td>
      <td><span class="${full ? "status-full" : "status-ok"}">${full ? "Hết chỗ" : "Còn chỗ"}</span></td>
      <td>${c.fee}</td>
    </tr>
  `;
  }).join("");

  tbody.addEventListener("click", (e) => {
    // Copy button: copy code to clipboard without selecting row
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      e.stopPropagation();
      const code = copyBtn.dataset.code;
      const finish = () => {
        copyBtn.classList.add("copied");
        copyBtn.setAttribute("title", "Đã sao chép!");
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.setAttribute("title", "Sao chép mã lớp");
        }, 1200);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(finish, finish);
      } else {
        // Fallback for non-secure contexts
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        document.body.removeChild(ta);
        finish();
      }
      return;
    }

    const tr = e.target.closest("tr");
    if (!tr) return;

    const idx = parseInt(tr.dataset.index, 10);

    // Dòng Hết chỗ: CHỈ khi click vào radio (hoặc label dẫn vào radio) mới bật popup.
    // Click vào cell/text khác không phản ứng.
    if (tr.classList.contains("full")) {
      const targetsRadio =
        e.target.matches('input[type="radio"]') ||
        e.target.closest(`label[for="class-${idx}"]`);
      if (targetsRadio) {
        e.preventDefault(); // ngăn radio bị check
        openFullClassModal(CLASSES[idx]);
      }
      return;
    }

    const radio = document.getElementById(`class-${idx}`);
    if (radio && !radio.disabled) {
      radio.checked = true;
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");
      // Nếu waitlist đang mở → clear & đóng lại
      collapseWaitlist();
    }
    validateForm();
  });
}

// ===== Month picker =====
const VI_MONTHS = Array.from({ length: 12 }, (_, i) => `Th ${i + 1}`);
let mpYear = 2026;
let mpSelected = null; // {month: 1-12, year}

function renderMonthGrid() {
  const grid = document.getElementById("mp-grid");
  document.getElementById("mp-year").textContent = mpYear;
  grid.innerHTML = VI_MONTHS.map((label, i) => {
    const m = i + 1;
    const isSel = mpSelected && mpSelected.month === m && mpSelected.year === mpYear;
    return `<button type="button" class="mp-month ${isSel ? "selected" : ""}" data-month="${m}">${label}</button>`;
  }).join("");
  grid.querySelectorAll(".mp-month").forEach(btn => {
    btn.addEventListener("click", () => {
      mpSelected = { month: parseInt(btn.dataset.month, 10), year: mpYear };
      const value = `Tháng ${mpSelected.month}/${mpSelected.year}`;
      const valEl = document.getElementById("mp-value");
      const input = document.getElementById("month-picker-input");
      valEl.textContent = value;
      input.classList.add("has-value");
      document.getElementById("waitMonth").value = value;
      closeMonthPicker();
      validateForm();
    });
  });
}

function openMonthPicker() {
  document.getElementById("month-picker-popover").hidden = false;
  document.getElementById("month-picker").classList.add("open");
  renderMonthGrid();
}
function closeMonthPicker() {
  document.getElementById("month-picker-popover").hidden = true;
  document.getElementById("month-picker").classList.remove("open");
}
function toggleMonthPicker() {
  const popover = document.getElementById("month-picker-popover");
  if (popover.hidden) openMonthPicker();
  else closeMonthPicker();
}

function setupMonthPicker() {
  document.getElementById("month-picker-input").addEventListener("click", toggleMonthPicker);
  document.getElementById("mp-prev").addEventListener("click", (e) => { e.stopPropagation(); mpYear--; renderMonthGrid(); });
  document.getElementById("mp-next").addEventListener("click", (e) => { e.stopPropagation(); mpYear++; renderMonthGrid(); });
  document.addEventListener("click", (e) => {
    if (!document.getElementById("month-picker").contains(e.target)) closeMonthPicker();
  });
}

// ===== Waitlist expand/collapse + popup =====
// Map class session+time → wait-time option value
function mapClassToWaitTime(c) {
  // sessions: "Tối 2-4-6", "Tối 3-5-7" (no Chiều case)
  const isT246 = /2-4-6/.test(c.session);
  const isT357 = /3-5-7/.test(c.session);
  const is1745 = /17:45/.test(c.time);
  const is2000 = /20:00/.test(c.time);
  if (isT246 && is1745) return "T246-1745";
  if (isT357 && is1745) return "T357-1745";
  if (isT246 && is2000) return "T246-2000";
  if (isT357 && is2000) return "T357-2000";
  return null;
}

function expandWaitlist(triggerClass) {
  document.getElementById("waitlist-toggle").hidden = true;
  const card = document.getElementById("waitlist-card");
  card.hidden = false;

  // Reset checkboxes
  document.querySelectorAll('input[name="waitMode"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="waitTime"]').forEach(cb => cb.checked = false);

  if (triggerClass) {
    document.querySelector('input[name="waitClass"]').value = triggerClass.code;
    // Tick mode of that class only
    const modeCb = document.querySelector(`input[name="waitMode"][value="${triggerClass.mode}"]`);
    if (modeCb) modeCb.checked = true;
    // Tick matching time
    const tv = mapClassToWaitTime(triggerClass);
    if (tv) {
      const timeCb = document.querySelector(`input[name="waitTime"][value="${tv}"]`);
      if (timeCb) timeCb.checked = true;
    }
  }

  validateForm();
  setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

// Clear all waitlist fields + collapse the card back to the toggle button.
// Called when user picks a still-open class while the waitlist is expanded.
function collapseWaitlist() {
  const card = document.getElementById("waitlist-card");
  if (card.hidden) return;
  // Clear text + checkboxes + month
  document.querySelector('input[name="waitClass"]').value = "";
  document.querySelectorAll('input[name="waitMode"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="waitTime"]').forEach(cb => cb.checked = false);
  document.getElementById("waitMonth").value = "";
  const mpVal = document.getElementById("mp-value");
  if (mpVal) mpVal.textContent = "Chọn tháng bạn muốn đi học";
  const mpInput = document.getElementById("month-picker-input");
  if (mpInput) mpInput.classList.remove("has-value");
  mpSelected = null;
  // Hide card, show button again
  card.hidden = true;
  document.getElementById("waitlist-toggle").hidden = false;
  validateForm();
}

function setupWaitlistToggle() {
  document.getElementById("waitlist-toggle").addEventListener("click", () => expandWaitlist(null));
}

// ===== Modal: lớp Hết chỗ =====
function openFullClassModal(classItem) {
  document.getElementById("modal-class-code").textContent = classItem.code;
  const modal = document.getElementById("full-class-modal");
  modal.hidden = false;
  modal.dataset.classCode = classItem.code;
  modal.dataset.classIndex = CLASSES.indexOf(classItem);
  document.body.style.overflow = "hidden";
}

function closeFullClassModal() {
  document.getElementById("full-class-modal").hidden = true;
  document.body.style.overflow = "";
}

function setupFullClassModal() {
  document.getElementById("modal-close").addEventListener("click", closeFullClassModal);
  document.getElementById("full-class-modal").addEventListener("click", (e) => {
    if (e.target.id === "full-class-modal") closeFullClassModal();
  });
  document.getElementById("modal-fill-waitlist").addEventListener("click", () => {
    const modal = document.getElementById("full-class-modal");
    const idx = parseInt(modal.dataset.classIndex, 10);
    const cls = CLASSES[idx];
    closeFullClassModal();
    expandWaitlist(cls);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("full-class-modal").hidden) {
      closeFullClassModal();
    }
  });
}

// ===== Validation =====
function validateForm() {
  const requiredText = ["fullname", "dob", "phone", "facebook", "address"];
  const allFilled = requiredText.every(
    (name) => document.querySelector(`input[name="${name}"]`).value.trim() !== ""
  );
  const classSelected = !!document.querySelector('input[name="class"]:checked');
  const vneid = document.getElementById("confirm-vneid").checked;
  const agreed = document.getElementById("agree").checked;

  // Waitlist fields are required ONLY if no class is selected
  let waitOk = true;
  if (!classSelected) {
    const waitClass = document.querySelector('input[name="waitClass"]').value.trim();
    const waitMode = document.querySelectorAll('input[name="waitMode"]:checked').length > 0;
    const waitTime = document.querySelectorAll('input[name="waitTime"]:checked').length > 0;
    const waitMonth = document.getElementById("waitMonth").value;
    waitOk = !!(waitClass && waitMode && waitTime && waitMonth);
  }

  const formValid = allFilled && (classSelected || waitOk) && vneid && agreed;
  const btn = document.getElementById("submit-btn");
  btn.disabled = !formValid;
  btn.classList.toggle("enabled", formValid);
  document.getElementById("form-error").classList.remove("show");
  return formValid;
}

document.addEventListener("DOMContentLoaded", () => {
  renderClassRows();
  setupMonthPicker();
  setupWaitlistToggle();
  setupFullClassModal();

  document.querySelectorAll('input[type="text"], input[type="checkbox"], input[type="radio"]').forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });

  document.getElementById("registration-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validateForm();
    const errEl = document.getElementById("form-error");
    if (!ok) {
      errEl.classList.add("show");
      const requiredText = ["fullname", "dob", "phone", "facebook", "address"];
      requiredText.forEach((name) => {
        const input = document.querySelector(`input[name="${name}"]`);
        const wrap = input.closest(".field");
        if (!input.value.trim()) wrap.classList.add("invalid");
        else wrap.classList.remove("invalid");
      });
      return;
    }
    const data = {
      fullname: document.querySelector('input[name="fullname"]').value,
      dob:      document.querySelector('input[name="dob"]').value,
      phone:    document.querySelector('input[name="phone"]').value,
      facebook: document.querySelector('input[name="facebook"]').value,
      address:  document.querySelector('input[name="address"]').value,
      classCode: document.querySelector('input[name="class"]:checked')?.value,
      waitClass: document.querySelector('input[name="waitClass"]').value,
      waitMonth: document.getElementById("waitMonth").value,
    };
    console.log("Submitted:", data);
    alert("Đăng ký thành công!\n\n" + (data.classCode ? "Lớp: " + data.classCode : "Đăng ký chờ lớp: " + data.waitClass));
  });

  validateForm();
});
