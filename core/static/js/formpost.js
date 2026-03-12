class MagicFocus {

  constructor(parent) {
    this.parent = parent;
    if (!this.parent) return;

    this.focus = document.createElement("div");
    this.focus.classList.add("magic-focus");

    this.parent.classList.add("has-magic-focus");
    this.parent.appendChild(this.focus);

    const inputs = this.parent.querySelectorAll("input, textarea, select");

    inputs.forEach(input => {
      input.addEventListener("focus", () => {
        window.magicFocus.show();
      });

      input.addEventListener("blur", () => {
        window.magicFocus.hide();
      });
    });
  }

  show() {
    let el = document.activeElement;

    if (!["INPUT", "SELECT", "TEXTAREA"].includes(el.nodeName)) return;

    clearTimeout(this.reset);

    if (["checkbox", "radio"].includes(el.type)) {
      el = document.querySelector(`[for=${el.id}]`);
    }

    this.focus.style.top = (el.offsetTop || 0) + "px";
    this.focus.style.left = (el.offsetLeft || 0) + "px";
    this.focus.style.width = (el.offsetWidth || 0) + "px";
    this.focus.style.height = (el.offsetHeight || 0) + "px";
  }

  hide() {
    const el = document.activeElement;

    if (!["INPUT", "SELECT", "TEXTAREA", "LABEL"].includes(el.nodeName)) {
      this.focus.style.width = 0;
    }

    this.reset = setTimeout(() => {
      window.magicFocus.focus.removeAttribute("style");
    }, 200);
  }
}

/* Inicializar */
window.magicFocus = new MagicFocus(document.querySelector(".form"));

/* jQuery (para custom select) */
$(function () {
  $(".select").customSelect();
});

const upload = document.getElementById("file-upload");

upload.addEventListener("change", function(){
  const fileName = this.files[0].name;
  document.querySelector(".upload-text").textContent = fileName;
});