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
  navbarAuth.addEventListener("click", () => {
    createMainModal()
    bindMainModalEvents()})
}


function createMainModal() {
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

  const clone = template.content.cloneNode(true)
  
  const modalConteiner = clone.querySelector(".modal-container")
  
  clone.querySelector(".close-modal").addEventListener("click", () => {
    modalConteiner.remove();
  })

  modalConteiner.addEventListener("click", (e) => {
    if(e.target === modalConteiner) {
      modalConteiner.remove()
    }
  })

  clone.querySelector(".close-modal").addEventListener("click", () => {
    modalConteiner.remove();
  })

  document.body.appendChild(clone)
}
function bindMainModalEvents() {
  document.querySelector(".email-change").addEventListener("click", initEmailChangeSubModal)
  document.querySelector(".password-change").addEventListener("click", initPasswordChangeSubModal)

  document.querySelector(".exit").addEventListener("click", () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/precoFipe;";
    window.location.reload()
  })
  document.querySelector(".delete-account").addEventListener("click", async () => {
    const token = getCookie("token=")

    const response = await fetch(baseUrl() + "/v1/user", {
      method: "DELETE",
      headers: {
        Content: "application/json",
        Authorization: token 
      }
    })

    if(response.status === 204) {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/precoFipe;"
      window.location.reload()
    }
  })
}


function initEmailChangeSubModal() {
    const userContainer = document.querySelector(".user-container");
    const template = document.createElement("template");

    template.innerHTML = `
      <div class="modal-secondary">
                    <section id="security-confirmation">
                      <h2>Atualize seu email</h2>
                    
                      <form class="email-form">
                        <div class="email-form-fields">
                        
                          <div class="form-group">
                            <label for="new-email">
                              Novo email <span class="required">*</span>
                            </label>
                            <input type="email" id="new-email" class="modal-input">
                          </div>
                      
                          <div class="form-group">
                            <label for="confirm-email">
                              Confirmar novo email <span class="required">*</span>
                            </label>
                            <input type="email" id="confirm-email" class="modal-input">
                          </div>

                          <div class="form-group">
                            <label for="current-password">
                              Senha atual <span class="required">*</span>
                            </label>
                            <input type="password" id="current-password" class="modal-input">
                          </div>
                      
                          <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancelar</button>
                            <button type="button" class="btn-ready">Pronto</button>
                          </div>
                      
                        </div>
                      </form>
                    </section>
                </div>
    `
    const clone = template.content.cloneNode(true)

    const modalSecondary = clone.querySelector(".modal-secondary")  

    clone.querySelector(".btn-cancel").addEventListener("click", () => {
      userContainer.removeChild(modalSecondary)
    })

    clone.querySelector(".btn-ready").addEventListener("click", handleEmailChangeSubmit)

    clone.querySelector("#current-password").addEventListener("keydown", (e) => {
      if(e.key !== "Enter") return
      handleEmailChangeSubmit()
    })

    userContainer.appendChild(modalSecondary)
}
function initPasswordChangeSubModal() {
    const userContainer = document.querySelector(".user-container");
    const template = document.createElement("template");

    template.innerHTML = `
      <div class="modal-secondary">
                    <section id="security-confirmation">
                      <h2>Atualize sua senha</h2>
                    
                      <form class="password-form">
                        <div class="password-form-fields">

                          <div class="form-group">
                            <label for="current-password">
                              Senha atual <span class="required">*</span>
                            </label>
                            <input type="password" id="current-password" class="modal-input"> 
                          </div>

                          <div class="form-group">
                            <label for="new-password">
                              Nova senha <span class="required">*</span>
                            </label>
                            <input type="password" id="new-password" class="modal-input">
                          </div>
                      
                          <div class="form-group">
                            <label for="confirm-password">
                              Confirmar nova senha <span class="required">*</span>
                            </label>
                            <input type="password" id="confirm-password" class="modal-input">
                          </div>
                      
                          <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancelar</button>
                            <button type="button" class="btn-ready">Pronto</button>
                          </div>
                      
                        </div>
                      </form>
                    </section>
                </div>
    `
    const clone = template.content.cloneNode(true);
    const modalSecondary = clone.querySelector(".modal-secondary")  

    clone.querySelector(".btn-cancel").addEventListener("click", () => {
      userContainer.removeChild(modalSecondary)
    })

    clone.querySelector(".btn-ready").addEventListener("click", handlePasswordChangeSubmit)

    clone.querySelector("#confirm-password").addEventListener("keydown", (e) => {
      if(e.key !== "Enter") return
      handlePasswordChangeSubmit()
    })

    userContainer.appendChild(modalSecondary)
}


function handleEmailChangeSubmit() {
  const newEmail = document.querySelector("#new-email")
  const confirmEmail = document.querySelector("#confirm-email")
  const currentPassword = document.querySelector("#current-password")

  if(newEmail.value !== confirmEmail.value) {
    confirmEmail.classList.add("error")
    p.textContent = "Os emails não coincidem"
    confirmEmail.after(p)
    return
  }

  modalSecondary.querySelectorAll(".error").forEach(e => e.classList.remove("error"));
  modalSecondary.querySelectorAll(".error-message").forEach(e => e.remove())
  const p = document.createElement("p")
  p.className = "error-message"

  updateEmail(newEmail.value, currentPassword.value)

  switch(response.status) {
    case 204: 
    userContainer.removeChild(modalSecondary) 
    break
    case 409:
      newEmail.classList.add("error")
      p.textContent = "Este email já esta sendo usado"
      newEmail.after(p)
      break
    case 403: 
      currentPassword.classList.add("error")
      p.textContent = "Senha incorreta"
      currentPassword.after(p)
      break
    case 400:
      newEmail.classList.add("error")
      p.textContent = "Insira um email válido"
      newEmail.after(p)
      break
  }
}
async function handlePasswordChangeSubmit() {
  const newPassword = document.querySelector("#new-password")
  const confirmPassword = document.querySelector("#confirm-password")
  const currentPassword = document.querySelector("#current-password")

  document.querySelectorAll(".error").forEach(e => e.classList.remove("error"));
  document.querySelectorAll(".error-message").forEach(e => e.remove())
  const p = document.createElement("p")
  p.className = "error-message"

  if(newPassword.value !== confirmPassword.value) {
    confirmPassword.classList.add("error")
    p.textContent= "As senhas não coincidem"
    confirmPassword.after(p)
    return
  }
  
  const response = await updatePassword(currentPassword.value, newPassword.value)

  switch(response.status) {
    case 204:
      userContainer.removeChild(modalSecondary)
      break

    case 403:
      currentPassword.classList.add("error")
      p.textContent = "Senha incorreta"
      currentPassword.after(p)
      break

    case 400:
      newPassword.classList.add("error")
      p.textContent = "Insira uma senha válida"
      newPassword.after(p)
      break
  }
}


async function updateEmail(newEmail, currentPassword) {
  const token = getCookie("token=")

  const payload = {
    newEmail: newEmail,
    currentPassword: currentPassword
  }

  return await fetch(baseUrl() + "/v1/user/email", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(payload)
  })
}
async function updatePassword(currentPassword, newPassword) {
  const token = getCookie("token=")

  const payload = {
    currentPassword: currentPassword,
    newPassword: newPassword
  }
  
  return await fetch(baseUrl() + "/v1/user/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(payload)
  })
}


function baseUrl() {
  return `http://localhost:8080`
}

initUser();

//index.html
document.addEventListener("DOMContentLoaded", () => {
  if(!document.querySelector("#index")) return;

  const vehicleTypeSelect = document.querySelector("#vehicle-type")
  const brandSelect = document.querySelector("#brand");
  const modelSelect = document.querySelector("#model");
  const yearSelect = document.querySelector("#year");
  const searchFipeButton = document.querySelector(".search-fipe-button");
  const main = document.querySelector("main");

  async function getBrands() {
    return await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}`);
  };
  async function appendBrandOptions() {
    const response = await getBrands();

    switch(response.status) {
      case 200:
        const brands = await response.json()
        brandSelect.innerHTML = "";

        brands.forEach((brand) => {
        const option = document.createElement("option")
        option.innerText = brand.name
        option.value = brand.code
        brandSelect.appendChild(option);
        })

        modelSelect.removeAttribute("disabled")
        modelSelect.addEventListener("focus", appendModelOptions)      
      break
    } 
  };

  async function getModels() {
    return await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}/brands/${brandSelect.value}/models`)
  }
  async function appendModelOptions() {
    const response = await getModels()

    switch(response.status) {
      case 200:
        const models = await response.json()
        modelSelect.innerHTML = "";

        models.forEach(model => {
          const option = document.createElement("option")
          option.innerText = model.name
          option.value = model.code
          modelSelect.appendChild(option)
        })

        yearSelect.removeAttribute("disabled")
        yearSelect.addEventListener("focus", appendYearOptions)
      break
    }
  }

  async function getYears() {
    return await fetch(`${baseUrl()}/v1/api/${vehicleTypeSelect.value}/brands/${brandSelect.value}/models/${modelSelect.value}/years`)
  }
  async function appendYearOptions() {
    const response = await getYears()
    switch(response.status) {
      case 200:
        const years = await response.json()
        yearSelect.innerHTML = "";

        years.forEach(year => {
          const option = document.createElement("option")
          option.innerText = year.name
          option.value = year.code
          yearSelect.appendChild(option)
        })
      
        searchFipeButton.removeAttribute("disabled")
        searchFipeButton.addEventListener("click", appendFipeInformation)
      break
        }
  }

  async function getFipeInformation(vehicleType, brand, model, modelYear) {
    const token = getCookie("token=")

    if(!token) {
      return await fetch(`${baseUrl()}/v1/api/${vehicleType}/brands/${brand}/models/${model}/years/${modelYear}`);
    }

    return await fetch(`${baseUrl()}/v1/api/${vehicleType}/brands/${brand}/models/${model}/years/${modelYear}`, {
      headers: {
        "Authorization": token
      }
    });  
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

    const response = await getFipeInformation(vehicleTypeSelect.value, brandSelect.value, modelSelect.value, yearSelect.value)

    switch(response.status) {
      case 200:
        const fipeInformation = await response.json()

        localStorage.setItem(
        "fipeInformation",
        JSON.stringify(fipeInformation)
        )

        window.location.href = "result.html"
    }
  }

  async function getFipeInformationByCodeFipeAndYear(vehicleType, codeFipe, modelYear) {
    const token = getCookie("token=")

    switch(vehicleType) {
      case "Carro":
        vehicleType = "cars"
      break

      case "Moto":
        vehicleType = "motorcycle"
      break

      case "Caminhão":
        vehicleType = "trucks"
      break
    }

    return await fetch(`${baseUrl()}/v1/api/${vehicleType}/${codeFipe}/years/${modelYear}`, {
      headers: {
        "Authorization": token
      }
    });  
  }

  async function getFavoritesPaginated(page, size) {
    const token = getCookie("token=")
    if(!token) return

    return await fetch(`${baseUrl()}/v1/favorite/paginated?page=${page}&size=${size}&sort=id,desc`, {
      headers: {
        "Authorization": token
      }
    })
  }
  let page = 0
  let loading = false
  async function appendFavorites() {
    if(loading || !getCookie("token=")) return
    loading = true

    const response = await getFavoritesPaginated(page, 6)

    switch(response.status) {
      case 200:
        const favorites = await response.json()

        if(!favorites.content) {
          loading = false
           return
        }

        if(document.querySelector(".favorites")) document.querySelector(".favorites").remove()

        let template = document.createElement("template")
        template.innerHTML = `
          <section class="favorites">
              <h2>Consultas rápidas</h2>
              <div id="favorites-container">
                <div class="favorite-section"></div>
              </div>
          </section>
          `;

        const clone = template.content.cloneNode(true)
        const favoriteSection = clone.querySelector(".favorite-section")

        if (page > 0) {
          const left = document.createElement("i")
          left.className = "fa-solid fa-circle-chevron-left"

          left.addEventListener("click", () => {page--; appendFavorites(); console.log("Previous")})

          favoriteSection.before(left)
        }

        if (page + 1 < favorites.totalPages) {
          const right = document.createElement("i")
          right.className = "fa-solid fa-circle-chevron-right"

          right.addEventListener("click", () => {page++; appendFavorites(); console.log("Next")})

          favoriteSection.after(right)
        }
        
        main.appendChild(clone)

        for(let i = 0; i < favorites.content.length; i++) {
          const favorite = favorites.content[i]
          const template = document.createElement("template")
        
          template.innerHTML = `
            <div class="favorite-box">
              <div class="title-box">
                <h3 class="title-car">${favorite.vehicleData.brand} ${favorite.vehicleData.model.substring(0, favorite.vehicleData.model.indexOf(" "))} ${favorite.vehicleData.modelYear}</h3>
              </div>
            </div>
          `
  
          const clone = template.content.cloneNode(true)
          const favoriteBox = clone.querySelector(".favorite-box");
        
          const query = {
            vehicleType: null,
            brand: null,
            model: null,
            modelYear: favorite.vehicleData.modelYear
          }
        
          favoriteBox.addEventListener("click", async () => {
            localStorage.setItem("query", JSON.stringify(query))
            const response = await getFipeInformationByCodeFipeAndYear(favorite.vehicleData.vehicleType, favorite.vehicleData.codeFipe, favorite.vehicleData.modelYear)
            
            switch(response.status) {
              case 200:
                const fipeInformation = await response.json()
                localStorage.setItem(
                "fipeInformation",
                JSON.stringify(fipeInformation)
                )
                window.location.href = "result.html"
            }
          })
        
          favoriteSection.appendChild(clone)
        }
      break
    }
    loading = false
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
  const loginForm = document.querySelector(".login-form")
  const btnPrimaryLogin = document.querySelector(".btn-primary");
  const btnSecondaryLogin = document.querySelector(".btn-secondary");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  let currentPage = "login"

  async function login() {
      const email = emailInput.value
      const password = passwordInput.value

      if(!email || !password) return
  
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

      loginForm.querySelectorAll(".error")
      .forEach((e) => e.classList.remove("error"))

      loginForm.querySelectorAll("p.error-message")
      .forEach((e) => e.remove())
      
      let p = document.createElement("p")
      p.className = "error-message"

      switch(response.status) {
        case 404:
          emailInput.classList.add("error")
          p.textContent = "O email que você inseriu não está conectado a uma conta."
          emailInput.after(p)
          return

        case 403:
          passwordInput.classList.add("error")
          p.textContent = "A senha que você inseriu está incorreta."
          passwordInput.after(p)
          return
      }

      const body = await response.json()
    
      document.cookie = `token=${body.token}`
      window.location.replace("/precoFipe/index.html")
  }

  async function register() {
    const payload = {
      email: emailInput.value,
      password: passwordInput.value
    }

    const p = document.createElement("p")
    p.classList.add("error-message")

    const response = await fetch(baseUrl() + "/v1/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    loginForm.querySelectorAll(".error").forEach(e => e.classList.remove("error"))
    loginForm.querySelectorAll("p.error-message").forEach(p => p.remove())

    switch(response.status) {
      case 201: 
      window.location.reload()

      case 409:
        emailInput.classList.add("error")
        p.innerText = "O email que você inseriu já está sendo usado ou é inválido."
        emailInput.after(p)
        break

      case 400:
        emailInput.classList.add("error")
        emailInput.after(p)
        password.classList.add("error")
        p.textContent = "Email ou senha inválidos"
        password.after(p)
        break
    } 
  }

  function registerForm() {
    document.querySelectorAll(".error").forEach(e => e.classList.remove("error"));
    document.querySelectorAll(".error-message").forEach(e => e.remove())

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

