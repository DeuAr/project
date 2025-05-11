document.addEventListener("DOMContentLoaded", function () {
  let productsData = [];
  let cart = [];
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }

  // Загрузка данных из XML
  fetch("products.xml")
    .then((res) => res.text())
    .then((xmlText) => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const products = [...xml.querySelectorAll("product")];

      productsData = products.map((p) => ({
        title: p.querySelector("title").textContent,
        subtitle: p.querySelector("subtitle").textContent,
        size: p.querySelector("size")?.textContent || "",
        price: parseFloat(p.querySelector("price").textContent),
        image: p.querySelector("image").textContent,
        color: p.querySelector("color")?.textContent || "",
        description: p.querySelector("description")?.textContent || "",
      }));

      renderProducts(productsData);
    });
  function getSizeValue(sizeStr) {
    const parts = sizeStr.split("x");
    if (parts.length !== 2) return 0;
    const width = parseFloat(parts[0]);
    const length = parseFloat(parts[1]);
    return width * length; // площадь рулона
  }

  function renderProducts(data) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";
    data.forEach((p, index) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.index = index;
      card.innerHTML = `
  <div class="image-wrapper">
    <img src="${p.image}" alt="${p.title}" />
  </div>
  <div class="content">
    <div class="card-header">
      <span class="subtitle">${p.subtitle}</span>
      <div class="size"><span>${p.size}</span></div>
    </div>
    <div class="title">${p.title}</div>
    <div class="card-buttons">
      <button class="more-button">Подробнее</button>
      <button class="cart-button">
        <i class="ri-shopping-cart-line"></i>
      </button>
    </div>
    <span class="price">${p.price.toFixed(2)} BYN</span>
  </div>`;
      card.querySelector(".more-button").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(p);
      });

      card.querySelector(".cart-button").addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(p);
        showNotification(`${p.title} добавлен в корзину`);
      });

      grid.appendChild(card);
    });
  }
  function applyFilters() {
    const selectedTypes = [
      ...document.querySelectorAll('input[name="type"]:checked'),
    ].map((cb) => cb.value);
    const selectedColors = [
      ...document.querySelectorAll('input[name="color"]:checked'),
    ].map((cb) => cb.value);
    const minPrice = parseFloat(
      document.querySelector(".min-value")?.value || 0
    );
    const maxPrice = parseFloat(
      document.querySelector(".max-value")?.value || 100000
    );
    const sortValue = document.querySelector(".sort-select")?.value;
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();

    let filtered = productsData.filter((p) => {
      const matchType =
        selectedTypes.length === 0 || selectedTypes.includes(p.subtitle);
      const matchColor =
        selectedColors.length === 0 || selectedColors.includes(p.color);
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm) ||
        p.subtitle.toLowerCase().includes(searchTerm);

      return matchType && matchColor && matchPrice && matchSearch;
    });

    if (sortValue === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === "size_asc") {
      filtered.sort((a, b) => getSizeValue(a.size) - getSizeValue(b.size));
    } else if (sortValue === "size_desc") {
      filtered.sort((a, b) => getSizeValue(b.size) - getSizeValue(a.size));
    }
    renderProducts(filtered);
  }

  const allInputs = document.querySelectorAll(
    'input[name="type"], input[name="color"], .min-value, .max-value'
  );
  allInputs.forEach((input) => input.addEventListener("input", applyFilters));
  document
    .querySelector(".sort-select")
    ?.addEventListener("change", applyFilters);

  const modal = document.getElementById("productModal");
  if (modal) {
    const closeButton = modal.querySelector(".close-button");
    closeButton?.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    });
    
    modal.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal") ||
        e.target.classList.contains("modal-overlay")
      ) {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });
  }

  function openModal(product) {
    const modal = document.getElementById("productModal");
    if (!modal) return;

    modal.querySelector("#modalImage").src = product.image;
    modal.querySelector("#modalTitle").textContent = product.title;
    modal.querySelector(
      "#modalSubtitle"
    ).textContent = `Тип обоев: ${product.subtitle}`;
    modal.querySelector(
      "#modalSize"
    ).textContent = `Размер рулона: ${product.size}м`;
    modal.querySelector(
      "#modalPrice"
    ).textContent = `Цена/рулон: ${product.price.toFixed(2)} BYN`;
    modal.querySelector("#modalDescription").textContent = product.description;

    // Обработчик кнопки "Добавить в корзину" в модалке
    const modalAddToCartBtn = document.getElementById("addToCartModalBtn");
    modalAddToCartBtn.onclick = () => {
      addToCart(product);
      showNotification(`${product.title} добавлен в корзину`);
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    };

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

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
      if (mobileMenu?.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        updateBurgerIcon();
      }
    }
  });

  const rangeInput = document.querySelectorAll(".range-input input");
  const priceInput = document.querySelectorAll(".price-inputs input");
  const progress = document.querySelector(".slider .progress");
  const priceGap = 1;

  function updateSliderProgress() {
    const minVal = parseInt(rangeInput[0].value);
    const maxVal = parseInt(rangeInput[1].value);
    const minMax = parseInt(rangeInput[0].max);
    progress.style.left = (minVal / minMax) * 100 + "%";
    progress.style.width = ((maxVal - minVal) / minMax) * 100 + "%";
  }

  priceInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let minVal = parseInt(priceInput[0].value);
      let maxVal = parseInt(priceInput[1].value);
      if (maxVal - minVal >= priceGap && maxVal <= 350) {
        if (e.target.classList.contains("min-value")) {
          rangeInput[0].value = minVal;
        } else {
          rangeInput[1].value = maxVal;
        }
        updateSliderProgress();
      } else if (maxVal - minVal < priceGap) {
        if (e.target.classList.contains("min-value")) {
          priceInput[0].value = maxVal - priceGap;
        } else {
          priceInput[1].value = minVal + priceGap;
        }
      }
    });
  });

  rangeInput.forEach((input) => {
    input.addEventListener("input", () => {
      let minVal = parseInt(rangeInput[0].value);
      let maxVal = parseInt(rangeInput[1].value);
      if (maxVal - minVal < priceGap) {
        if (input.classList.contains("min-range")) {
          rangeInput[0].value = maxVal - priceGap;
        } else {
          rangeInput[1].value = minVal + priceGap;
        }
      }
      priceInput[0].value = rangeInput[0].value;
      priceInput[1].value = rangeInput[1].value;
      updateSliderProgress();
      applyFilters();
    });
  });

  const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  const activeFiltersContainer = document.getElementById("activeFilters");
  const resetFiltersBtn = document.getElementById("resetFilters");

  filterCheckboxes.forEach((cb) =>
    cb.addEventListener("change", updateActiveFilters)
  );
  resetFiltersBtn?.addEventListener("click", () => {
    // Сброс чекбоксов
    filterCheckboxes.forEach((cb) => (cb.checked = false));

    // Сброс цены
    rangeInput[0].value = 0;
    rangeInput[1].value = 350;
    priceInput[0].value = 0;
    priceInput[1].value = 350;

    // Сброс сортировки
    const sortSelect = document.querySelector(".sort-select");
    if (sortSelect) sortSelect.value = "none";

    updateSliderProgress();
    updateActiveFilters();
    applyFilters();
  });

  function updateActiveFilters() {
    const activeFilters = Array.from(filterCheckboxes).filter(
      (cb) => cb.checked
    );
    if (activeFiltersContainer) {
      activeFiltersContainer.classList.toggle(
        "hidden",
        activeFilters.length === 0
      );
    }
  }
  window.addEventListener("DOMContentLoaded", () => {
    updateSliderProgress();
    applyFilters(); // запускаем фильтрацию при загрузке
  });

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

  function updateCartUI() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      if (item.price != null) {
        // Проверка, чтобы избежать ошибок
        total += item.price * item.quantity;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <div class="item-info">
            <strong>${item.title}</strong> — ${item.price.toFixed(2)} BYN
          </div>
          <div class="item-actions">
            <input type="number" min="1" value="${item.quantity}" data-title="${
          item.title
        }" />
            <button data-title="${item.title}">&times;</button>
          </div>
        `;
        cartItemsContainer.appendChild(div);
      } else {
        console.warn(`Товар без цены: ${item.title}`);
      }
    });

    cartTotal.textContent = `${total.toFixed(2)} BYN`;

    cartItemsContainer.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const title = e.target.dataset.title;
        const item = cart.find((i) => i.title === title);
        item.quantity = Math.max(1, parseInt(e.target.value));
        updateCartUI();
      });
    });

    cartItemsContainer.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const title = e.target.dataset.title;
        cart = cart.filter((i) => i.title !== title);
        updateCartUI();
      });
    });

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  const cartBtn = document.getElementById("cartBtn");
  const cartModal = document.getElementById("cartModal");
  const cartClose = document.querySelector(".cart-close");

  cartBtn.addEventListener("click", () => cartModal.classList.remove("hidden"));
  cartClose.addEventListener("click", () => cartModal.classList.add("hidden"));
  cartModal.querySelector(".modal").addEventListener("click", (e) => {
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
        setTimeout(() => document.body.removeChild(note), 300);
      }, 2000);
    }, 10);
  }
});
