document.addEventListener("DOMContentLoaded", function () {
  const burgerButton = document.getElementById("burgerToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const burgerIcon = burgerButton.querySelector("i");
  burgerButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    updateBurgerIcon();
  });

  function updateBurgerIcon() {
    if (!burgerIcon) return;
    burgerIcon.className = mobileMenu.classList.contains("active")
      ? "ri-close-line"
      : "ri-menu-line";
  }

  document.addEventListener("click", (event) => {
    if (
      !mobileMenu.contains(event.target) &&
      !burgerButton.contains(event.target)
    ) {
      if (mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        updateBurgerIcon();
      }
    }
  });
});
