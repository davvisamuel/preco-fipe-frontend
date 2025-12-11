const vehicleTypeSelect = document.querySelector("#vehicle-type")
const brandSelect = document.querySelector("#brand");
const modelSelect = document.querySelector("#model");
const yearSelect = document.querySelector("#year");
const submitButton = document.querySelector(".submit");
const main = document.querySelector("main");

function checkCookie() {
  const cookies = document.cookie.split("; ");

  for (const c of cookies) {
    if (c.startsWith("token=")) {
      return c.substring(6);
    }
  }

  return null;
}

function getUrl() {
  const vehicleType = vehicleTypeSelect.value
  return `http://localhost:8080/v1/api/${vehicleType}`
}

async function getBrands() {
  const baseUrl = getUrl();
  const result = await fetch(baseUrl);
  return result.json();
  //return [{name: "BMW", code:1}, {name:"audi", code:2}]
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
};

async function getModels() {
  const response = await fetch(`${getUrl()}/brands/${brandSelect.value}/models`)
  return response.json()
  //return [{name: "320i", code:1}]
}

async function appendModelOptions() {
  const data = await getModels()
  modelSelect.innerHTML = "";
  data.forEach(model => {
    const option = document.createElement("option")
    option.innerText = model.name
    option.value = model.code
    modelSelect.appendChild(option)
  })
  yearSelect.removeAttribute("disabled")
}

async function getYears() {
  const response = await fetch(`${getUrl()}/brands/${brandSelect.value}/models/${modelSelect.value}/years`)
  return response.json()
  //return [{name: "2019-1", code:1}]
}

async function appendYearOptions() {
  const data = await getYears()
  yearSelect.innerHTML = "";
  data.forEach(year => {
    const option = document.createElement("option")
    option.innerText = year.name
    option.value = year.code
    yearSelect.appendChild(option)
  })
  submitButton.removeAttribute("disabled")
}

async function getFipeInformation(e, brandCode, modelCode, yearCode) {
  e.preventDefault()
  const baseUrl = getUrl()
  const brand = brandCode === undefined ? brandSelect.value : brand
  const model = modelCode === undefined ? modelSelect.value : model
  const year =  yearCode === undefined ? yearSelect.value : year

  const cookie = checkCookie()

  if(!cookie) {
    const response = await fetch(`${baseUrl}/brands/${brand}/models/${model}/years/${year}`);
    const data = await response.json()
    console.log(data)
    return
  }

  const response = await fetch(`${baseUrl}/brands/${brand}/models/${model}/years/${year}`, {
    headers: {
      "Authorization": cookie
    }
  });
  console.log(await response.json())
  
}

async function getFavoritesPaginated(page, size) {
  const token = checkCookie()
  
  if(!token) {
    return
  }
  const response = await fetch(`http://localhost:8080/v1/favorite/paginated?page=${page}&size=${size}&sort=id,desc`, {
    headers: {
      "Authorization": token
    }
  })
  return await response.json()
  //return {content: [{brand: "VW - VolksWagen", model: "AMAROK High.CD 2.0 16V TDI 4x4 Dies. Aut", codeFipe: "A"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}]}
}

async function appendFavorites(page, size) {
  const content = (await getFavoritesPaginated(0, 6)).content;

  if(content === "[]") {
    return
  }

  const template = document.createElement("template")
  template.innerHTML = `
    <section id="favorites">
        <h2>Consultas rápidas</h2>
        <div id="favorites-container">
        </div>
    </section>
  `;
  main.appendChild(template.content)

  const fc = document.querySelector("#favorites-container")

  content.forEach(vehicle => {
    const template = document.createElement("template")
    template.innerHTML = `
      <div class="favorite-box">
        <div class="title-box">
          <h3 class="title-car">${vehicle.vehicleData.brand} ${vehicle.vehicleData.model.substring(0, vehicle.vehicleData.model.indexOf(" "))}</h3>
        </div>
      </div>
    `
    fc.appendChild(template.content)
  })
}

if(brandSelect) {
  brandSelect.addEventListener("focus", appendBrandOptions)
  modelSelect.addEventListener("focus", appendModelOptions)
  yearSelect.addEventListener("focus", appendYearOptions)
  submitButton.addEventListener("click", getFipeInformation)
  document.addEventListener("DOMContentLoaded", appendFavorites(0, 6))
}


//login.html
const btnPrimaryLogin = document.querySelector(".btn-primary");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

async function login(e) {
    e.preventDefault()

    const payload = {
        email: emailInput.value,
        password: passwordInput.value
    };
  
    const response = await fetch("http://localhost:8080/v1/auth/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        
        body: JSON.stringify(payload)
    })
  
    const token = await response.json()
    document.cookie = `token=${token.token}`
    console.log(token)
}

if(btnPrimaryLogin) {
  btnPrimaryLogin.addEventListener("click", login)
}



//recentes.html
document.addEventListener("DOMContentLoaded", async () => {
  const recentesPage = document.querySelector("#recentes");
  if(!recentesPage) return
  
  const queryContainer = document.querySelector(".query-container");
  const deleteButton = document.querySelector(".remove-all-box");
  const pages = document.querySelector(".pages")
  const next = document.querySelector(".next")
  
  
  let page = 0;
  let size = 6;

  async function getConsultations() {
    const token = checkCookie();

    if(!token) {
      return
    }

    const result = await fetch(`http://localhost:8080/v1/consultation?page=${page}&size=${size}&sort=id,desc`, {
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

    if(page >= 0 && page < totalPages) {
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

      return
    }

    if(page === totalPages) {
      const template = document.createElement("template");
      template.innerHTML = `<div class="previous"><i class="fa-solid fa-arrow-left"></i>Anterior</div>
                            <div class="current">Página ${page + 1}</div>`
      pages.appendChild(template.content)
      
      pages.querySelector(".previous").addEventListener("click",  () => {
          page --;
          appendConsultations();
        })

        return
    }

    const template = document.createElement("template");
    template.innerHTML = `<div class="next">Próxima <i class="fa-solid fa-arrow-right"></i></div>`
    pages.appendChild(template.content)
    
    pages.querySelector(".next").addEventListener("click",  () => {
        page ++;
        appendConsultations();
      })
  }

  async function deleteConsultations() {
    const token = checkCookie();

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

  appendConsultations()

  deleteButton.addEventListener("click", deleteConsultations)
})

