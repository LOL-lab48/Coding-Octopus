// ===== Element References =====
const htmlBox = document.getElementById("html");
const cssBox = document.getElementById("css");
const jsBox = document.getElementById("js");
const preview = document.getElementById("preview");

// ===== Storage =====
const STORAGE_KEY = "code_editor_projects";
let currentProject = "My Project";

// ===== Defaults =====
const DEFAULT_PROJECT = {
  html: `<h1>Xcelerate Xtreme Studio</h1>
<p>Edit code or add blocks 🚀</p>
<button onclick="hello()">Test Button</button>`,

  css: `body {
  background: #222;
  color: white;
  text-align: center;
  padding: 40px;
}

button {
  padding: 12px;
  font-size: 16px;
}`,

  js: `function hello() {
  alert("Everything works perfectly!");
}`
};

// ===== Load Projects =====
function getProjects() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ===== Load Current Project =====
function loadProject(name) {
  const projects = getProjects();
  const project = projects[name] || DEFAULT_PROJECT;

  currentProject = name;
  htmlBox.value = project.html;
  cssBox.value = project.css;
  jsBox.value = project.js;

  updatePreview();
  updateProjectList();
}

// ===== Save Current Project =====
function saveCurrentProject() {
  const projects = getProjects();

  projects[currentProject] = {
    html: htmlBox.value,
    css: cssBox.value,
    js: jsBox.value
  };

  saveProjects(projects);
}

// ===== Live Preview (Debounced) =====
let debounceTimer;
function updatePreview() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
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
} catch (e) {
  document.body.innerHTML += "<pre style='color:red;white-space:pre-wrap'>" + e + "</pre>";
}
<\/script>
</body>
</html>
`;

    preview.srcdoc = src;
    saveCurrentProject();
  }, 300);
}

// ===== Input Listeners =====
[htmlBox, cssBox, jsBox].forEach(box => {
  box.addEventListener("input", updatePreview);
});

// ===== Block Insertion at Cursor =====
function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  textarea.value =
    textarea.value.substring(0, start) +
    text +
    textarea.value.substring(end);

  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

const blocks = {
  text: "<p>New text block</p>",
  button: "<button>New Button</button>",
  image: "<img src='https://via.placeholder.com/150' alt='Image'>"
};

document.querySelectorAll("[data-block]").forEach(btn => {
  btn.addEventListener("click", () => {
    insertAtCursor(htmlBox, "\n" + blocks[btn.dataset.block]);
    updatePreview();
  });
});

// ===== Project Controls =====
function createProject() {
  const name = prompt("Project name?");
  if (!name) return;

  const projects = getProjects();

  if (projects[name]) {
    alert("Project already exists!");
    return;
  }

  projects[name] = { ...DEFAULT_PROJECT };
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

// ===== Project List UI =====
function updateProjectList() {
  let list = document.getElementById("projectList");

  if (!list) {
    list = document.createElement("select");
    list.id = "projectList";
    list.style.margin = "10px";
    document.body.prepend(list);

    list.addEventListener("change", () => {
      loadProject(list.value);
    });
  }

  const projects = getProjects();
  list.innerHTML = "";

  Object.keys(projects).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (name === currentProject) option.selected = true;
    list.appendChild(option);
  });
}

// ===== Publish =====
function publishProject() {
  const blob = new Blob([preview.srcdoc], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// ===== Reset =====
function resetAll() {
  if (confirm("Reset ALL projects?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ===== Init =====
(function init() {
  const projects = getProjects();

  if (Object.keys(projects).length === 0) {
    projects["My Project"] = { ...DEFAULT_PROJECT };
    saveProjects(projects);
  }

  loadProject(Object.keys(projects)[0]);
})();
