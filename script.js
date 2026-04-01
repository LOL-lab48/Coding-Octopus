// ===== ELEMENTS =====
const htmlBox = document.getElementById("html");
const cssBox = document.getElementById("css");
const jsBox = document.getElementById("js");
const preview = document.getElementById("preview");

// ===== STORAGE =====
const STORAGE_KEY = "lol_lab_projects";
let currentProject = "My Project";

// ===== DEFAULT =====
const DEFAULT = {
  html: `<h1>Octopus Studio</h1>
<p>Edit code or add blocks 🚀</p>
<button onclick="hello()">Test Button</button>`,

  css: `body {
  background:#222;
  color:white;
  text-align:center;
  padding:40px;
}

button {
  padding:12px;
  font-size:16px;
}`,

  js: `function hello() {
  alert("Everything works perfectly!");
}`
};

// ===== STORAGE HELPERS =====
function getProjects() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveProjects(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ===== LOAD PROJECT =====
function loadProject(name) {
  const projects = getProjects();
  const project = projects[name] || DEFAULT;

  currentProject = name;

  htmlBox.value = project.html;
  cssBox.value = project.css;
  jsBox.value = project.js;

  updatePreview();
  updateProjectList();
}

// ===== SAVE CURRENT =====
function saveCurrentProject() {
  const projects = getProjects();

  projects[currentProject] = {
    html: htmlBox.value,
    css: cssBox.value,
    js: jsBox.value
  };

  saveProjects(projects);
}

// ===== LIVE PREVIEW =====
function updatePreview() {
  const src = `
<!DOCTYPE html>
<html>
<head>
<style>${cssBox.value}</style>
</head>
<body>
${htmlBox.value}
<script>
try {
${jsBox.value}
} catch(e) {
  document.body.innerHTML += "<pre style='color:red'>" + e + "</pre>";
}
<\/script>
</body>
</html>
`;

  preview.srcdoc = src;
  saveCurrentProject();
}

// ===== INPUT EVENTS =====
[htmlBox, cssBox, jsBox].forEach(el => {
  el.addEventListener("input", updatePreview);
});

// ===== BLOCKS =====
const blocks = {
  text: "<p>New text block</p>",
  button: "<button>New Button</button>",
  image: "<img src='https://via.placeholder.com/150'>"
};

document.querySelectorAll("[data-block]").forEach(btn => {
  btn.addEventListener("click", () => {
    htmlBox.value += "\n" + blocks[btn.dataset.block];
    updatePreview();
  });
});

// ===== PROJECT MANAGEMENT =====
function createProject() {
  const name = prompt("Project name?");
  if (!name) return;

  const projects = getProjects();

  if (projects[name]) {
    alert("Project already exists!");
    return;
  }

  projects[name] = { ...DEFAULT };
  saveProjects(projects);
  loadProject(name);
}

function deleteProject() {
  if (!confirm("Delete this project?")) return;

  const projects = getProjects();
  delete projects[currentProject];

  saveProjects(projects);

  const remaining = Object.keys(projects);
  loadProject(remaining[0] || "My Project");
}

function renameProject() {
  const newName = prompt("New project name?", currentProject);
  if (!newName || newName === currentProject) return;

  const projects = getProjects();

  if (projects[newName]) {
    alert("Name already exists!");
    return;
  }

  projects[newName] = projects[currentProject];
  delete projects[currentProject];

  saveProjects(projects);
  loadProject(newName);
}

// ===== PROJECT LIST UI =====
function updateProjectList() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";

  const projects = getProjects();

  Object.keys(projects).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === currentProject) opt.selected = true;
    list.appendChild(opt);
  });

  list.onchange = () => loadProject(list.value);
}

// ===== DOWNLOAD =====
function downloadProject() {
  const blob = new Blob([preview.srcdoc], { type: "text/html" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = currentProject.replace(/\s+/g, "_") + ".html";
  a.click();
}

// ===== PUBLISH (FIXED COPY + SHARE URL) =====
function publishProject() {
  const data = {
    name: currentProject,
    html: htmlBox.value,
    css: cssBox.value,
    js: jsBox.value
  };

  // Encode into URL
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const shareURL = `${location.origin}${location.pathname}?project=${encoded}`;

  // Copy properly
  navigator.clipboard.writeText(shareURL)
    .then(() => {
      alert("✅ Share URL copied to clipboard!");
    })
    .catch(() => {
      alert("❌ Failed to copy. Copy manually:\n" + shareURL);
    });

  console.log("Share URL:", shareURL);
}

// ===== RESET =====
function resetAll() {
  if (confirm("Reset ALL projects?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ===== LOAD FROM URL =====
(function init() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get("project");

  if (encoded) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      htmlBox.value = data.html;
      cssBox.value = data.css;
      jsBox.value = data.js;
      currentProject = data.name || "Shared Project";
      updatePreview();
      return;
    } catch {}
  }

  const projects = getProjects();

  if (Object.keys(projects).length === 0) {
    projects["My Project"] = { ...DEFAULT };
    saveProjects(projects);
  }

  loadProject(Object.keys(projects)[0]);
})();
