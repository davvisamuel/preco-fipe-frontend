const vehicleTypeSelect = document.querySelector("#vehicle-type")
const brandSelect = document.querySelector("#brand");
const modelSelect = document.querySelector("#model");
const yearSelect = document.querySelector("#year");
const submitButton = document.querySelector(".submit");
const main = document.querySelector("main");

function getUrl() {
  const vehicleType = vehicleTypeSelect.value
  return `http://localhost:8080/v1/api/${vehicleType}`
}

async function getBrands() {
  const baseUrl = getUrl();
  //const result = await fetch(baseUrl);
  //return result.json();
  return [{name: "BMW", code:1}, {name:"audi", code:2}]
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
  // const response = await fetch("http://localhost:8080/v1/api/cars")
  // return response.json()
  return [{name: "320i", code:1}]
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
  // const response = await fetch("http://localhost:8080/v1/api/cars")
  // return response.json()
  return [{name: "2019-1", code:1}]
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

async function getFipeInformation(e) {
  e.preventDefault()
  const baseUrl = getUrl()
  const brand = brandSelect.value
  const model = modelSelect.value
  const year = yearSelect.value
  // await fetch(`${baseUrl}/brands/${brand}/models/${model}/years/${year}`);
}

async function getFavoritesPaginated(page, size) {
  //const response = await fetch(`http://localhost:8080/v1/favorite/paginated?page=${page}&size=${size}`)
  //return response.json()
  return {content: [{brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}, {brand: "BMW", model: "320i"}]}
}

async function appendFavorites(page, size) {
  const content = (await getFavoritesPaginated()).content;

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
          <h3 class="title-car">${vehicle.brand}</h3>
        </div>
      </div>
    `
    fc.appendChild(template.content)
  })
}

brandSelect.addEventListener("focus", appendBrandOptions)
modelSelect.addEventListener("focus", appendModelOptions)
yearSelect.addEventListener("focus", appendYearOptions)
submitButton.addEventListener("click", getFipeInformation)
document.addEventListener("DOMContentLoaded", appendFavorites(0, 6))


