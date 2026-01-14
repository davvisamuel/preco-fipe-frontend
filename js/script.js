const navbarAuth = document.querySelector(".navbar-auth")

function getCookie(cookieName) {
  const cookies = document.cookie.split("; ");

  for (const c of cookies) {
    if (c.startsWith(cookieName)) {
      return c.substring(cookieName.length, c.length);
    }
  }
  return null;
}

function initUser() {
  if(!getCookie("token=")) return

  navbarAuth.innerHTML = `<i class="fa-solid fa-user-pen"></i> Minha conta`
  navbarAuth.removeAttribute("href")
  navbarAuth.addEventListener("click", modal)
}

function modal() {
  if (document.querySelector(".modal-container")) return;

  const template = document.createElement("template")
  template.innerHTML = `<div class="modal-container">
            <div class="user-container">
                <span class="close-modal">&times;</span>
                <section id="security">
                    <div class="email-change">
                        <h2>Email</h2>
                        <button type="button" class="credentials">Mudar email</button>
                     </div>
                    <div class="password-change">
                        <h2>Senha e autenticação</h2>
                        <button type="button" class="credentials">Mudar senha</button>
                    </div>
                    <div class="exit">
                      <h2>Sair</h2>
                      <button type="button" class="credentials">Sair da conta</button>
                    </div>
                    <div class="delete-account">
                        <h2>Deletar conta</h2>
                        <button type="button" class="delete">Deletar minha conta</button>
                    </div>
                </section>
            </div>
        </div>`

  document.body.appendChild(template.content)

  const modal = document.querySelector(".modal-container");
  const closeBtn = document.querySelector(".close-modal");
  const emailChange = document.querySelector(".email-change");
  const passwordChange = document.querySelector(".password-change");
  const exit = document.querySelector(".exit");
  const deleteAccount = document.querySelector(".delete-account");

  closeBtn.addEventListener("click", () => {
    modal.remove();
  })

  modal.addEventListener("click", (e) => {
    if(e.target === modal) {
      modal.remove()
    }
  })

  emailChange.addEventListener("click", () => {
    
  })

  passwordChange.addEventListener("click", () => {
    
  })

  exit.addEventListener("click", () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/precoFipe;";
    window.location.reload()
  })

  deleteAccount.addEventListener("click", () => {
    
  })
}

function baseUrl() {
  return `http://localhost:8080`
}

initUser();

//index.html
document.addEventListener("DOMContentLoaded", () => {
  const indexPage = document.querySelector("#index");
  if(!indexPage) return

  const vehicleTypeSelect = document.querySelector("#vehicle-type")
  const brandSelect = document.querySelector("#brand");
  const modelSelect = document.querySelector("#model");
  const yearSelect = document.querySelector("#year");
  const searchFipeButton = document.querySelector(".search-fipe-button");
  const main = document.querySelector("main");

  async function getBrands() {
    const result = await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}`);
    return result.json();
  };

  async function appendBrandOptions() {
    const brands = await getBrands();

    brandSelect.innerHTML = "";

    brands.forEach((brand) => {
      const option = document.createElement("option")
      option.innerText = brand.name
      option.value = brand.code
      brandSelect.appendChild(option);
    }) 

    modelSelect.removeAttribute("disabled")
    modelSelect.addEventListener("focus", appendModelOptions)
  };

  async function getModels() {
    const response = await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}/brands/${brandSelect.value}/models`)
    return await response.json()
  }

  async function appendModelOptions() {
    const models = await getModels()

    modelSelect.innerHTML = "";

    models.forEach(model => {
      const option = document.createElement("option")
      option.innerText = model.name
      option.value = model.code
      modelSelect.appendChild(option)
    })

    yearSelect.removeAttribute("disabled")
    yearSelect.addEventListener("focus", appendYearOptions)
  }

  async function getYears() {
    const response = await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}/brands/${brandSelect.value}/models/${modelSelect.value}/years`)
    return response.json()
  }

  async function appendYearOptions() {
    const years = await getYears()

    yearSelect.innerHTML = "";

    years.forEach(year => {
      const option = document.createElement("option")
      option.innerText = year.name
      option.value = year.code
      yearSelect.appendChild(option)
    })

    searchFipeButton.removeAttribute("disabled")
    searchFipeButton.addEventListener("click", appendFipeInformation)
  }

  async function appendFipeInformation(e) {
    e.preventDefault()
    
    const query = {
      vehicleType: vehicleTypeSelect.value,
      brand: brandSelect.value,
      model: modelSelect.value,
      modelYear: yearSelect.value,
    }
    localStorage.setItem("query", JSON.stringify(query))

    const fipeInformation = await getFipeInformation(vehicleTypeSelect.value, brandSelect.value, modelSelect.value, yearSelect.value)

    localStorage.setItem(
      "fipeInformation",
      JSON.stringify(fipeInformation)
    )

    window.location.href = "result.html"
  }

  async function getFipeInformation(vehicleType, brand, model, modelYear) {
    const token = getCookie("token=")

    if(!token) {
      const response = await fetch(`${baseUrl()}/v1/api/${vehicleType}/brands/${brand}/models/${model}/years/${modelYear}`);
      const data = await response.json()
      return data
    }

    const response = await fetch(`${baseUrl()}/v1/api/${vehicleType}/brands/${brand}/models/${model}/years/${modelYear}`, {
      headers: {
        "Authorization": token
      }
    });  

    return await response.json()
  }

  async function getFipeInformationByCodeFipeAndYear(vehicleType, codeFipe, modelYear) {
    const token = getCookie("token=")

    if(vehicleType === "Carro") {
      vehicleType = "cars"
    }
    if(vehicleType === "Moto") {
      vehicleType = "motorcycle"
    }

    const response = await fetch(`${baseUrl()}/v1/api/${vehicleType}/${codeFipe}/years/${modelYear}`, {
      headers: {
        "Authorization": token
      }
    });  

    return await response.json()
  }

  async function getFavoritesPaginated(page, size) {
    const token = getCookie("token=")

    if(!token) {
      return
    }

    const response = await fetch(`${baseUrl()}/v1/favorite/paginated?page=${page}&size=${size}&sort=id,desc`, {
      headers: {
        "Authorization": token
      }
    })
    return await response.json()
  }

  let page = 0
  async function appendFavorites() {
    if(!getCookie("token=")) return
    const favorites = (await getFavoritesPaginated(page, 6));
    console.log(favorites)
    const pageNumber = favorites.number + 1

    if(!favorites.content || favorites.content.length === 0) {
      return
    }

    const favoritesSection = document.querySelector("#favorites")
    if(favoritesSection) {
      favoritesSection.remove()
    }

    let template = document.createElement("template")
    if(favorites.totalPages === 1) {
       template.innerHTML = `
        <section id="favorites">
            <h2>Consultas rápidas</h2>
            <div id="favorites-container">
              <div id="favorite-boxes"></div>
            </div>
        </section>
        `;
    }
    if(pageNumber === 1 && favorites.totalPages > 1) {
      template.innerHTML = `
        <section id="favorites">
            <h2>Consultas rápidas</h2>
            <div id="favorites-container">
              <div id="favorite-boxes"></div>
              <i class="fa-solid fa-circle-chevron-right"></i>
            </div>
        </section>
        `;
    }
    if(pageNumber > 1 && (pageNumber < favorites.totalPages)) {
       template.innerHTML = `
        <section id="favorites">
            <h2>Consultas rápidas</h2>
            <div id="favorites-container">
              <i class="fa-solid fa-circle-chevron-left"></i>
              <div id="favorite-boxes"></div>
              <i class="fa-solid fa-circle-chevron-right"></i>
            </div>
        </section>
        `;
    }
    if(pageNumber > 1 && pageNumber === favorites.totalPages) {
       template.innerHTML = `
        <section id="favorites">
            <h2>Consultas rápidas</h2>
            <div id="favorites-container">
              <i class="fa-solid fa-circle-chevron-left"></i>
              <div id="favorite-boxes"></div>
            </div>
        </section>
        `;
    }
    
    main.appendChild(template.content)

    const favoriteBoxes = document.querySelector("#favorite-boxes")

    for(i=0; i < favorites.content.length; i++) {
      const favorite = favorites.content[i]
      const template = document.createElement("template")

      template.innerHTML = `
        <div class="favorite-box">
          <div class="title-box">
            <h3 class="title-car">${favorite.vehicleData.brand} ${favorite.vehicleData.model.substring(0, favorite.vehicleData.model.indexOf(" "))} ${favorite.vehicleData.modelYear}</h3>
          </div>
        </div>
      `

      const vehicle = {
        "codeFipe": favorite.vehicleData.codeFipe,
        "modelYear": favorite.vehicleData.modelYear,
        "vehicleType": favorite.vehicleData.vehicleType
      }

      const clone = template.content.cloneNode(true)
      const favoriteBox = clone.querySelector(".favorite-box");

      favoriteBox.addEventListener("click", async () => {

        const fipeInformation = await getFipeInformationByCodeFipeAndYear(favorite.vehicleData.vehicleType, favorite.vehicleData.codeFipe, favorite.vehicleData.modelYear)

        localStorage.setItem(
          "fipeInformation",
          JSON.stringify(fipeInformation)
        )

        window.location.href = "result.html"
      })

      favoriteBoxes.appendChild(clone)
     }

    const previous = document.querySelector(".fa-circle-chevron-left")
    if(previous) previous.addEventListener("click", () => {page--; appendFavorites(); console.log("Previous")})

    const next = document.querySelector(".fa-circle-chevron-right")
    if(next) next.addEventListener("click", () => {page++; appendFavorites(); console.log("Next")})
  }

  function resetForm() {
    brandSelect.innerHTML = `<option value="" disabled selected>Escolha a marca</option>`
    modelSelect.innerHTML = `<option value="" disabled selected>Escolha o modelo</option>`
    modelSelect.setAttribute("disabled", "")
    yearSelect.innerHTML = `<option value="" disabled selected>Escolha o ano</option>`
    yearSelect.setAttribute("disabled", "")

    modelSelect.removeEventListener("focus", appendModelOptions)
    yearSelect.removeEventListener("focus", appendYearOptions)
    searchFipeButton.removeEventListener("click", getFipeInformation)
  }


  vehicleTypeSelect.addEventListener("change", resetForm)
  brandSelect.addEventListener("focus", appendBrandOptions)
  appendFavorites();
})

//result
document.addEventListener("DOMContentLoaded", async () => {
  if(!document.querySelector("#result-page")) return

  const token = getCookie("token=")
  const fipeInformation = JSON.parse(localStorage.getItem("fipeInformation"))
  const query = JSON.parse(localStorage.getItem("query"))

  const resultContainer = document.querySelector(".result-container")
  
  let icon = "";

  let existsFavorite = false
  if(token != null) {
    existsFavoriteResponseBody = await existsFavoriteGet(fipeInformation.codeFipe, query.modelYear)
    existsFavorite = existsFavoriteResponseBody.exists
  }

  if( existsFavorite ) {
    icon = `<i class="fa-solid fa-heart"></i>`
    localStorage.setItem("favoriteId", existsFavoriteResponseBody.favoriteId)
  }
  else {
    icon = `<i class="fa-regular fa-heart"></i>`
  }
  
    
  resultContainer.innerHTML = `
  <section class="fipe-information">
    <h2 class="result-title">
        ${fipeInformation.brand}
        <span class="result-subtitle">${fipeInformation.model}</span>
    </h2>
    <p class="code-fipe">Código Fipe: <span>${fipeInformation.codeFipe}</span></p>
    <div class="fipe-price-container">
        <div class="flex">
          <img src="img/FIPE.png" alt="Logo da FIPE">
          ${icon}
        </div>
        <p class="fipe-price">${fipeInformation.price}</p>
        <p class="reference-month">Mês de referência: ${fipeInformation.referenceMonth}</p>
    </div>
  </section>  `

  const favoriteIcon = document.querySelector(".flex i")

  favoriteIcon.addEventListener("click", async () => {
    const isFavorited = favoriteIcon.classList.contains("fa-regular");

    if(isFavorited) {
      favoriteIcon.classList.replace("fa-regular", "fa-solid")
      postFavorite(fipeInformation.codeFipe, query.modelYear, fipeInformation.fuelAcronym)
      .then((favorite) => localStorage.setItem("favoriteId", JSON.stringify(favorite.id)))
    }

    else {
      favoriteIcon.classList.replace("fa-solid", "fa-regular")
      const id = JSON.parse(localStorage.getItem("favoriteId"))
      await deleteFavorite(id)
      localStorage.removeItem("favoriteId")
    }
  })

  async function postFavorite(codeFipe, modelYear, fuelAcronym) {
    const token = getCookie("token=")
    
    const payload = {
      codeFipe: codeFipe,
      modelYear: modelYear,
      fuelAcronym: fuelAcronym
    }

    const response = await fetch(`${baseUrl()}/v1/favorite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(payload)
    })
    return response.json()
  }

  async function deleteFavorite(favoriteId) {
    const token = getCookie("token=")
    
    await fetch(`${baseUrl()}/v1/favorite/${favoriteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      }
    })
  }

  async function existsFavoriteGet(codeFipe, modelYear) {
    const token = getCookie("token=")

    const response = await fetch(`${baseUrl()}/v1/favorite?codeFipe=${codeFipe}&modelYear=${modelYear}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      }
    })
    
    return await response.json()
  }
})

  //login.html
document.addEventListener("DOMContentLoaded", () => {
  const loginPage = document.querySelector("#login");
  if(!loginPage) return

  const loginExtra = document.querySelector(".login-extra")
  const btnPrimaryLogin = document.querySelector(".btn-primary");
  const btnSecondaryLogin = document.querySelector(".btn-secondary");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  let currentPage = "login"

  async function login() {
      const email = emailInput.value
      const password = passwordInput.value

      if(email === null || password === null) return
  
      const payload = {
          email: email,
          password: password
      };
    
      const response = await fetch("http://localhost:8080/v1/auth/login", {
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
      })
      
      if(response.status === 404 || response.status === 400) return

      const body = await response.json()
    
      document.cookie = `token=${body.token}`
      window.location.replace("/precoFipe/index.html")
  }

  async function register() {
    const payload = {
      email: emailInput.value,
      password: passwordInput.value
    }

    const response = await fetch(baseUrl() + "/v1/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if(response.status === 400) {
      console.log("ERRO")
    }
    
    window.location.reload()
  }

  function registerForm() {
    currentPage = "register"
    btnPrimaryLogin.removeEventListener("click", login)
    btnSecondaryLogin.remove()

    const template = document.createElement("template")
    template.innerHTML = `<a href="login.html">Já tem uma conta?</a>`
    loginExtra.appendChild(template.content)

    btnPrimaryLogin.innerText = "Criar conta"

    btnPrimaryLogin.addEventListener("click", register)
  }

  btnPrimaryLogin.addEventListener("click", login)
  btnSecondaryLogin.addEventListener("click", registerForm)

  passwordInput.addEventListener("keydown", (e) => {
    if(e.key !== "Enter") return

    if(currentPage === "login") {
      login()
    }
    else {
      register()
    }
    
  })
})

//recentes.html
document.addEventListener("DOMContentLoaded", async () => {
  const recentesPage = document.querySelector("#recentes");
  if(!recentesPage) return
  
  const queryContainer = document.querySelector(".query-container");
  const deleteButton = document.querySelector(".remove-all-box");
  const pages = document.querySelector(".pages")
  
  let page = 0;
  let size = 6;

  async function getConsultations() {
    const token = getCookie("token=");
    if(!token) {
      return
    }

    const result = await fetch(`${baseUrl()}/v1/consultation?page=${page}&size=${size}&sort=id,desc`, {
      headers: {
        "Authorization": token
      }
    })

    return await result.json();
  }

  async function appendConsultations() {
    queryContainer.innerHTML = ""
    pages.innerHTML = ""

    const consultations = await getConsultations();
    const totalPages = consultations.totalPages - 1;

    for(const c of consultations.content) {
      const template = document.createElement("template")
      template.innerHTML = `
        <div class="query-box">
          <div class="vehicle">
              <p class="data">${c.vehicleData.brand} ${c.vehicleData.model} ${c.vehicleData.year}</p>
              <p class="code-fipe">${c.vehicleData.codeFipe}</p>
          </div>
          <div class="info">
              <p class="price">${c.price}</p>
              <p class="reference-month">${c.referenceMonth}</p>
          </div>
        </div>`
      queryContainer.appendChild(template.content);
    }

    if(page === 0 && totalPages === 0) {
      const template = document.createElement("template")
      template.innerHTML = `
        <div class="current">Página ${page + 1}</div>
        `
      pages.appendChild(template.content)
    }

    if(page === 0 && totalPages > 0) {
      const template = document.createElement("template")
      template.innerHTML = `
        <div class="current">Página ${page + 1}</div>
        <div class="next">Próxima <i class="fa-solid fa-arrow-right"></i></div>
        `
      pages.appendChild(template.content)

      pages.querySelector(".next").addEventListener("click",  () => {
        page ++;
        appendConsultations();
      })
    }

    if(page > 0 && totalPages === page) {
      const template = document.createElement("template")
      template.innerHTML = `
        <div class="previous"><i class="fa-solid fa-arrow-left"></i> Anterior</div>
        <div class="current">Página ${page + 1}</div>
        `
      pages.appendChild(template.content)

      pages.querySelector(".previous").addEventListener("click",  () => {
        page --;
        appendConsultations();
      })
    }

    if(page > 0 && totalPages !== page) {
      const template = document.createElement("template")
      template.innerHTML = `
        <div class="previous"><i class="fa-solid fa-arrow-left"></i> Anterior</div>
        <div class="current">Página ${page + 1}</div>
        <div class="next">Próxima <i class="fa-solid fa-arrow-right"></i></div>
        `
      pages.appendChild(template.content)

      pages.querySelector(".previous").addEventListener("click",  () => {
        page --;
        appendConsultations();
      })

      pages.querySelector(".next").addEventListener("click",  () => {
        page ++;
        appendConsultations();
      })
    }
  }

  async function deleteConsultations() {
    const token = getCookie("token=");

    if(!token) {
      return
    }

    fetch(`http://localhost:8080/v1/consultation`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    })
  }

  async function deleteConsultationsAndRefresh() {
    await deleteConsultations()

    window.location.reload()
  }

  appendConsultations()
  deleteButton.addEventListener("click", deleteConsultationsAndRefresh)
})

