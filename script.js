const VEREIN_NAME = "KleiderSpende e.V.";
const VEREIN_ADRESSE = "Herzog-Willhelm-Straße 1, 80331 München";
const VEREIN_PLZ = "80331"; // für Abholgebiet: werden ersten zwei Ziffern benötigt
const EUROPE_TZ = "Europe/Berlin";
const KLEIDUNGSLISTE = [
  "Jacken",
  "Hosen (kurz/lang)",
  "T-Shirts",
  "Pullover",
  "Unterwäsche",
  "Schuhe",
  "Kinderkleidung",
  "Bettwäsche",
  "Winterbekleidung",
  "Sonstiges",
];
const KRISENGEBIETE = [
  "Ukraine",
  "Sudan",
  "Syrien",
  "Afghanistan",
  "Jemen",
  "Haiti",
];
//Dom-Refs
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

const modusRadios = Array.from(document.querySelectorAll('input[name="modus"]'));
const adresseBox = document.getElementById("adresseBox");

const kleidungToggle = document.getElementById("kleidungToggle");
const kleidungPanel = document.getElementById("kleidungPanel");
const kleidungSummary = document.getElementById("kleidungSummary");
const selKleidungContainer = document.getElementById("kleidungContainer");
const selKrise = document.getElementById("krise");

const inpStrasse = document.getElementById("strasse");
const inpHausnr = document.getElementById("hausnr");
const inpPlz = document.getElementById("plz");
const inpOrt = document.getElementById("ort");

const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const sectionBestaetigung = document.getElementById("bestaetigung");
const outKleidung = document.getElementById("out-kleidung");
const outKrise = document.getElementById("out-krise");
const outDatetime = document.getElementById("out-datetime");
const outOrt = document.getElementById("out-ort");
const newEntryBtn = document.getElementById("newEntryBtn");

const err = {
  kleidung: document.getElementById("err-kleidung"),
  krise: document.getElementById("err-krise"),
  strasse: document.getElementById("err-strasse"),
  hausnr: document.getElementById("err-hausnr"),
  plz: document.getElementById("err-plz"),
  plzNaehe: document.getElementById("err-plz-naehe"),
  ort: document.getElementById("err-ort"),
};
document.getElementById("year").textContent = new Date().getFullYear();
//Mobilies Menü
if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const opened = mobileNav.classList.toggle("hidden") === false;
    menuBtn.setAttribute("aria-expanded", String(opened));
  });

  // Schließe Menü bei Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !mobileNav.classList.contains("hidden")) {
      mobileNav.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Schließe Menü, wenn ein Link im Mobile-Nav geklickt wird
  mobileNav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) {
      mobileNav.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

//Selects füllen
function fillSelect(select, items) {
  for (const v of items) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  }
}
// Checkbox-Rendering für Mehrfachauswahl
function renderKleidungCheckboxes(container, items) {
  container.innerHTML = "";
  items.forEach((v, i) => {
    const id = `kleidung-${i}`;
    const wrap = document.createElement("label");
    wrap.className = "flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50";
    const inp = document.createElement("input");
    inp.type = "checkbox";
    inp.name = "kleidung";
    inp.value = v;
    inp.id = id;
    inp.className = "h-4 w-4";
    const span = document.createElement("span");
    span.textContent = v;
    wrap.appendChild(inp);
    wrap.appendChild(span);
    container.appendChild(wrap);
  });
  // Update Summary on change
  container.addEventListener("change", updateKleidungSummary);
  updateKleidungSummary();
}
function updateKleidungSummary() {
  const chosen = Array.from(selKleidungContainer.querySelectorAll('input[name="kleidung"]:checked')).map(i => i.value);
  kleidungSummary.textContent = chosen.length ? chosen.join(", ") : "Bitte auswählen …";
}
renderKleidungCheckboxes(selKleidungContainer, KLEIDUNGSLISTE);
fillSelect(selKrise, KRISENGEBIETE);

// Toggle Panel
if (kleidungToggle && kleidungPanel) {
  kleidungToggle.addEventListener("click", () => {
    const open = kleidungPanel.classList.toggle("hidden") === false;
    kleidungToggle.setAttribute("aria-expanded", String(open));
  });
  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!kleidungPanel.classList.contains("hidden") && !kleidungPanel.contains(e.target) && !kleidungToggle.contains(e.target)) {
      kleidungPanel.classList.add("hidden");
      kleidungToggle.setAttribute("aria-expanded", "false");
    }
  });
}

//Modus-Änderung
function updateModusUI() {
  const modus = getModus();
  if (modus === "abholung") {
    adresseBox.classList.remove("hidden");
  } else {
    adresseBox.classList.add("hidden");
  }
  clearErrors();
}
function getModus() {
  const checked = modusRadios.find((r) => r.checked);
  return checked ? checked.value : "uebergabe";
}
modusRadios.forEach((r) => r.addEventListener("change", updateModusUI));
updateModusUI();
//Eingabe-Helfer
inpPlz.addEventListener("input", () => {
  inpPlz.value = inpPlz.value.replace(/\D/g, "").slice(0, 5);
  if (!/^\d{5}$/.test(inpPlz.value)) show(err.plz);
});
//Formular-Validierung
function clearErrors() {
  Object.values(err).forEach((el) => el.classList.add("hidden"));
}

function show(el) {
  el.classList.remove("hidden");
}

function validate() {
  clearErrors();
  let ok = true;

  // Mehrfachauswahl (Checkboxen): prüfen, ob mindestens ein Eintrag gewählt wurde
  const kleidungChecked = selKleidungContainer.querySelectorAll('input[name="kleidung"]:checked');
  if (!kleidungChecked || kleidungChecked.length === 0) {
    show(err.kleidung);
    ok = false;
  }
  if (!selKrise.value) {
    show(err.krise);
    ok = false;
  }

  if (getModus() === "abholung") {
    if (!inpStrasse.value.trim()) {
      show(err.strasse);
      ok = false;
    }
    if (!inpHausnr.value.trim()) {
      show(err.hausnr);
      ok = false;
    }
    if (!/^\d{5}$/.test(inpPlz.value)) {
      show(err.plz);
      ok = false;
    }
    if (!inpOrt.value.trim()) {
      show(err.ort);
      ok = false;
    }

    // PLZ Nähe prüfen
    if (/^\d{5}$/.test(inpPlz.value)) {
      const sameTwo = inpPlz.value.slice(0, 2) === VEREIN_PLZ.slice(0, 2);
      if (!sameTwo) {
        show(err.plzNaehe);
        ok = false;
      }
    }
  }

  return ok;
}
//Absenden
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const modus = getModus();
  // Checkboxen: gewählte Werte zusammenführen
  const kleidungArr = Array.from(selKleidungContainer.querySelectorAll('input[name="kleidung"]:checked')).map((i) => i.value);
  const kleidung = kleidungArr.join(", ");
  const krise = selKrise.value;

  const now = new Date();
  const datetimeStr = now.toLocaleString("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: EUROPE_TZ,
  });

  let ortText = "";
  if (modus === "uebergabe") {
    ortText = `Geschäftsstelle (${VEREIN_ADRESSE})`;
  } else {
    ortText = `${inpStrasse.value.trim()} ${inpHausnr.value.trim()}, ${inpPlz.value.trim()} ${inpOrt.value.trim()}`;
  }
  // Ausgabe befüllen
  outKleidung.textContent = kleidung;
  outKrise.textContent = krise;
  outDatetime.textContent = datetimeStr;
  // sichere Anzeige
  outOrt.textContent = ortText;
  //Formular-Bereich scrollt aus, Besätigung einblenden
  sectionBestaetigung.classList.remove("hidden");
  window.location.hash = "#bestaetigung";
});
//Reset
function resetForm() {
  document.querySelector('input[name="modus"][value="uebergabe"]').checked = true;
  // Alle Checkboxen abwählen und Summary zurücksetzen
  for (const cb of selKleidungContainer.querySelectorAll('input[name="kleidung"]')) cb.checked = false;
  updateKleidungSummary();
  selKrise.value = "";
  inpStrasse.value = "";
  inpHausnr.value = "";
  inpPlz.value = "";
  inpOrt.value = "";
  clearErrors();
  updateModusUI();
  sectionBestaetigung.classList.add("hidden");
  window.location.hash = "#spende";
}
resetBtn.addEventListener("click", resetForm);
newEntryBtn.addEventListener("click", resetForm);

// Optional: Modus via Query-Param (für Tablet an Geschäftsstelle)
// modus=uebergabe | modus=abholung
const params = new URLSearchParams(window.location.search);
const paramModus = params.get("modus");
if (paramModus === "abholung" || paramModus === "uebergabe") {
  const radios = Array.from(document.querySelectorAll('input[name="modus"]'));
  const match = radios.find(r => r.value === paramModus);
  if (match) match.checked = true;
  updateModusUI();
}