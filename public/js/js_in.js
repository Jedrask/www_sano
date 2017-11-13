var dzis = new Date();
console.log(dzis.toLocaleString());
var tekst = document.getElementById("zegar");
tekst.textContent = dzis.toLocaleString();

var myVar = setInterval(myTimer, 1000);

function myTimer() {
  dzis = new Date();
  tekst.textContent = dzis.toLocaleString();
}

function onLogo() {
  alert("To jest SANO :)");
}

function showHide(id) {
  if (id.style.display === 'none') {
    id.style.display = 'block';
  } else {
    id.style.display = 'none';
  }
}

var logo = document.getElementById("logo_sano");
logo.addEventListener("click", onLogo);
