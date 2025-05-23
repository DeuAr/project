document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartBtn = document.getElementById("cartBtn");
  const cartModal = document.getElementById("cartModal");
  const cartClose = document.querySelector(".cart-close");
  const offer = document.getElementById("offer-to-catalog");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length > 0) {
    updateCartUI();
  }

  // Баннер-слайдер
  const slider = document.querySelector("#Banner .slider");
  const slides = slider?.querySelectorAll(".slide") || [];
  const slideCount = slides.length;
  let currentIndex = 0;

  if (slideCount > 0) {
    const firstClone = slides[0].cloneNode(true);
    slider.appendChild(firstClone);
    slider.style.width = `${(slideCount + 1) * 100}vw`;

    function goToSlide(index) {
      slider.style.transition = "transform 1s ease-in-out";
      slider.style.transform = `translateX(-${index * 100}vw)`;
    }

    function nextSlide() {
      currentIndex++;
      goToSlide(currentIndex);
      if (currentIndex === slideCount) {
        setTimeout(() => {
          slider.style.transition = "none";
          slider.style.transform = "translateX(0)";
          currentIndex = 0;
        }, 1000);
      }
    }

    setInterval(nextSlide, 6000);
  }

  // Бургер меню
  const burgerButton = document.getElementById("burgerToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const burgerIcon = burgerButton?.querySelector("i");

  burgerButton?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("active");
    updateBurgerIcon();
  });

  function updateBurgerIcon() {
    if (!burgerIcon || !mobileMenu) return;
    burgerIcon.className = mobileMenu.classList.contains("active")
      ? "ri-close-line"
      : "ri-menu-line";
  }

  document.addEventListener("click", (event) => {
    if (
      !mobileMenu?.contains(event.target) &&
      !burgerButton?.contains(event.target)
    ) {
      mobileMenu?.classList.remove("active");
      updateBurgerIcon();
    }
  });

  // Кнопки "в корзину"
  document.querySelectorAll(".cart-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const price = parseFloat(btn.dataset.price);
      if (!title || isNaN(price)) return;

      addToCart({ title, price });
      showNotification("Товар добавлен в корзину");
      showOfferToCatalog();
    });
  });

  // Добавление товара
  function addToCart(product) {
    const existing = cart.find((item) => item.title === product.title);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Обновление корзины
  function updateCartUI() {
    if (!cartItemsContainer || !cartTotal) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      total += item.price * item.quantity;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="item-info">
          <strong>${
            item.title
          }</strong> — <span style="color:green">${item.price.toFixed(
        2
      )} BYN</span>
        </div>
        <div class="item-actions">
          <input type="number" min="1" value="${item.quantity}" data-title="${
        item.title
      }" />
          <button data-title="${item.title}">&times;</button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = `${total.toFixed(2)} BYN`;

    cartItemsContainer.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const title = e.target.dataset.title;
        const item = cart.find((i) => i.title === title);
        if (item) {
          item.quantity = Math.max(1, parseInt(e.target.value));
          updateCartUI();
        }
      });
    });

    cartItemsContainer.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const title = e.target.dataset.title;
        cart = cart.filter((i) => i.title !== title);
        updateCartUI();
      });
    });
  }

  // Открытие и закрытие корзины
  cartBtn?.addEventListener("click", () =>
    cartModal?.classList.remove("hidden")
  );
  cartClose?.addEventListener("click", () =>
    cartModal?.classList.add("hidden")
  );
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.classList.add("hidden");
  });

  // Уведомление
  function showNotification(message) {
    const note = document.createElement("div");
    note.className = "cart-notification";
    note.textContent = message;
    document.body.appendChild(note);

    setTimeout(() => {
      note.classList.add("visible");
      setTimeout(() => {
        note.classList.remove("visible");
        setTimeout(() => note.remove(), 300);
      }, 2000);
    }, 10);
  }

  // Предложение перейти в каталог
  function showOfferToCatalog() {
    if (!offer) return;
    offer.classList.remove("hidden");

    // Закрыть при клике вне offer-box
    offer.addEventListener("click", (e) => {
      if (!e.target.closest(".offer-box")) {
        offer.classList.add("hidden");
      }
    });
    setTimeout(() => {
      offer.classList.add("hidden");
    }, 7000);
  }
});
