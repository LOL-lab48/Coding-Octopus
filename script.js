const htmlBox = document.getElementById("html");
const cssBox = document.getElementById("css");
const jsBox = document.getElementById("js");
const preview = document.getElementById("preview");

/* ---------- DEFAULT CONTENT ---------- */
htmlBox.value = localStorage.html || `
<h1>Xcelerate Xtreme Studio</h1>
<p>Edit code or add blocks 🚀</p>
<button onclick="hello()">Test Button</button>
`;

cssBox.value = localStorage.css || `
body {
  background:#222;
  color:white;
  text-align:center;
  padding:40px;
}

button {
  padding:12px;
  font-size:16px;
}
`;

jsBox.value = localStorage.js || `
function hello() {
  alert("Everything works perfectly!");
}
`;

/* ---------- LIVE PREVIEW ---------- */
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

  localStorage.html = htmlBox.value;
  localStorage.css = cssBox.value;
  localStorage.js = jsBox.value;
}

htmlBox.oninput = cssBox.oninput = jsBox.oninput = updatePreview;
updatePreview();

/* ---------- BLOCK INSERTION (STABLE) ---------- */
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

/* ---------- PUBLISH ---------- */
function publishProject() {
  const blob = new Blob([preview.srcdoc], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url);
}

/* ---------- RESET ---------- */
function resetAll() {
  if (confirm("Reset everything?")) {
    localStorage.clear();
    location.reload();
  }
}
