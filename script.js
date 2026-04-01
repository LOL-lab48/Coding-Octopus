const htmlBox = document.getElementById("html");
const cssBox = document.getElementById("css");
const jsBox = document.getElementById("js");
const preview = document.getElementById("preview");

const STORAGE_KEY = "projects";
let currentProject = "My Project";

// DEFAULT
const DEFAULT = {
  html: "<h1>Hello World</h1>",
  css: "body { text-align:center; }",
  js: "console.log('Ready');"
};

// STORAGE
function getProjects() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveProjects(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// LOAD
function loadProject(name) {
  const p = getProjects()[name] || DEFAULT;
  currentProject = name;

  htmlBox.value = p.html;
  cssBox.value = p.css;
  jsBox.value = p.js;

  updatePreview();
  updateList();
}

// SAVE
function saveCurrent() {
  const projects = getProjects();
  projects[currentProject] = {
    html: htmlBox.value,
    css: cssBox.value,
    js: jsBox.value
  };
  saveProjects(projects);
}

// PREVIEW
function updatePreview() {
  const code = `
<html>
<style>${cssBox.value}</style>
<body>
${htmlBox.value}
<script>${jsBox.value}<\/script>
</body>
</html>
`;
  preview.srcdoc = code;
  saveCurrent();
}

// EVENTS
[htmlBox, cssBox, jsBox].forEach(el =>
  el.addEventListener("input", updatePreview)
);

// PROJECTS
function createProject() {
  const name = prompt("Name?");
  if (!name) return;

  const p = getProjects();
  p[name] = DEFAULT;
  saveProjects(p);
  loadProject(name);
}

function deleteProject() {
  const p = getProjects();
  delete p[currentProject];
  saveProjects(p);
  loadProject(Object.keys(p)[0] || "My Project");
}

function renameProject() {
  const name = prompt("New name?");
  if (!name) return;

  const p = getProjects();
  p[name] = p[currentProject];
  delete p[currentProject];
  saveProjects(p);
  loadProject(name);
}

// LIST
function updateList() {
  const list = document.getElementById("projectList");
  list.innerHTML = "";

  Object.keys(getProjects()).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === currentProject) opt.selected = true;
    list.appendChild(opt);
  });

  list.onchange = () => loadProject(list.value);
}

// BLOCKS
const blocks = {
  text: "<p>Text</p>",
  button: "<button>Click</button>",
  image: "<img src='https://via.placeholder.com/150'>"
};

document.querySelectorAll("[data-block]").forEach(btn => {
  btn.onclick = () => {
    htmlBox.value += "\n" + blocks[btn.dataset.block];
    updatePreview();
  };
});

// DOWNLOAD
function downloadProject() {
  const blob = new Blob([preview.srcdoc], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentProject + ".html";
  a.click();
}

// PUBLISH
function publishProject() {
  const blob = new Blob([preview.srcdoc], { type: "text/html" });
  window.open(URL.createObjectURL(blob));
}

// RESET
function resetAll() {
  localStorage.clear();
  location.reload();
}

// INIT
(function () {
  const p = getProjects();
  if (!Object.keys(p).length) {
    p["My Project"] = DEFAULT;
    saveProjects(p);
  }
  loadProject(Object.keys(p)[0]);
})();
