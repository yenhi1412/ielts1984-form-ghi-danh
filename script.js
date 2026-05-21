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
          <input type="radio" name="class" value="${c.code}" id="class-${i}" ${full ? "disabled" : ""} />
          <label for="class-${i}">${c.code}</label>
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
    const tr = e.target.closest("tr");
    if (!tr || tr.classList.contains("full")) return;
    const idx = tr.dataset.index;
    const radio = document.getElementById(`class-${idx}`);
    if (radio && !radio.disabled) {
      radio.checked = true;
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");
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
