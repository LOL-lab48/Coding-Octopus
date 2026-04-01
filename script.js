// ======= GET DOM ELEMENTS =======
const htmlBox = document.getElementById("html");
const cssBox = document.getElementById("css");
const jsBox = document.getElementById("js");
const preview = document.getElementById("preview");

// ======= DEFAULT CONTENT =======
const DEFAULT_HTML = `<h1>Octopus Studio</h1>
<p>Edit code or add blocks 🚀</p>
<button onclick="hello()">Test Button</button>`;

const DEFAULT_CSS = `body {
  background:#222;
  color:white;
  text-align:center;
  padding:40px;
}

button {
  padding:12px;
  font-size:16px;
}`;

const DEFAULT_JS = `function hello() {
  alert("Everything works perfectly!");
}`;

// ======= LOCAL STORAGE HELPERS =======
function saveProjects(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function getProjects() {
  return JSON.parse(localStorage.getItem("projects") || "{}");
}

function loadProject(name) {
  const projects = getProjects();
  const project = projects[name] || { html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS };
  htmlBox.value = project.html;
  cssBox.value = project.css;
  jsBox.value = project.js;
  updatePreview();
}

// ======= LIVE PREVIEW =======
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

  // Save current project to local storage
  const currentProject = prompt("Enter project name for local save:", "My Project") || "My Project";
  const projects = getProjects();
  projects[currentProject] = { html: htmlBox.value, css: cssBox.value, js: jsBox.value };
  saveProjects(projects);
}

// ======= BLOCK INSERTION =======
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

// ======= PUBLISH / SHARE PERSONAL URL =======
function publishProject() {
  const projectName = prompt("Enter project name:", "MyProject") || "UntitledProject";

  const data = {
    name: projectName,
    html: htmlBox.value,
    css: cssBox.value,
    js: jsBox.value
  };

  // Encode project into base64 and add to URL
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url = `${location.origin}${location.pathname}?project=${encoded}`;

  navigator.clipboard.writeText(url);
  alert(`Share link copied!\n\nURL:\n${url}`);
}

// ======= RESET EVERYTHING =======
function resetAll() {
  if (confirm("Reset everything?")) {
    localStorage.clear();
    location.reload();
  }
}

// ======= LOAD PROJECT FROM URL =======
(function loadSharedProject() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("project");

  if (encoded) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      htmlBox.value = data.html;
      cssBox.value = data.css;
      jsBox.value = data.js;
      updatePreview();
      alert(`Loaded project: "${data.name}"`);
    } catch (e) {
      console.error("Failed to load project:", e);
    }
  } else {
    // Load from local storage (pick first project if exists)
    const projects = getProjects();
    const firstProject = Object.keys(projects)[0];
    if (firstProject) {
      loadProject(firstProject);
    } else {
      htmlBox.value = DEFAULT_HTML;
      cssBox.value = DEFAULT_CSS;
      jsBox.value = DEFAULT_JS;
      updatePreview();
    }
  }
})();

// ======= EDITOR INPUT HANDLERS =======
htmlBox.oninput = cssBox.oninput = jsBox.oninput = updatePreview;
updatePreview();
