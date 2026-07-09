// ---------------- ACTION DROPDOWN ----------------
const DROPDOWN_TRANSITION_MS = 180;

function closeMenu(menu, home) {
  menu.classList.remove("open-fixed");

  window.setTimeout(() => {
    if (!menu.classList.contains("open-fixed")) {
      menu.style.position = "";
      menu.style.top = "";
      menu.style.bottom = "";
      menu.style.right = "";
      menu.style.left = "";
      menu.style.visibility = "";
      menu.style.display = "none"; 

      if (home && menu.parentElement !== home) {
        home.appendChild(menu);
      }
    }
  }, DROPDOWN_TRANSITION_MS);
}

function openMenu(btn, menu) {
  document.body.appendChild(menu); 

  menu.style.position = "fixed";
  menu.style.visibility = "hidden";
  menu.style.display = "block";
  menu.classList.add("open-fixed");

  const rect = btn.getBoundingClientRect();
  const menuHeight = menu.offsetHeight;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  menu.style.right = `${window.innerWidth - rect.right}px`;
  menu.style.left = "auto";

  if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
    menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    menu.style.top = "auto";
  } else {
    menu.style.top = `${rect.bottom + 8}px`;
    menu.style.bottom = "auto";
  }

  menu.style.visibility = "visible";
}


const dropdownPairs = [];

document.querySelectorAll(".action-dropdown").forEach((dropdown) => {
  const btn = dropdown.querySelector(".action-btn");
  const menu = dropdown.querySelector(".action-menu");

  if (!btn || !menu) {
    return;
  }

  dropdownPairs.push({ btn, menu, home: dropdown });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    dropdownPairs.forEach(({ menu: m, home }) => {
      if (m !== menu) closeMenu(m, home);
    });

    if (menu.classList.contains("open-fixed")) {
      closeMenu(menu, dropdown);
    } else {
      openMenu(btn, menu);
    }
  });
});

document.addEventListener("click", () => {
  dropdownPairs.forEach(({ menu, home }) => closeMenu(menu, home));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    dropdownPairs.forEach(({ menu, home }) => closeMenu(menu, home));
  }
});

window.addEventListener(
  "scroll",
  () => {
    document.querySelectorAll(".action-menu.open-fixed").forEach((menu) => {
      closeMenu(menu, menu._dropdownHome);
    });
  },
  true 
);