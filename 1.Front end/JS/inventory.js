// ========================
// SKU
// ========================

const skuTbody =
  document.getElementById(
    "sku-tbody"
  )

for (let i = 1; i <= 100; i++) {

  skuTbody.innerHTML += `

    <tr>

      <td class="checkbox-cell">

        <input
          type="checkbox"
          class="row-check">

      </td>

      <td>SKU${1000 + i}</td>

      <td>Product ${i}</td>

      <td>${10 + i}</td>

      <td>${5 + i}</td>

      <td>${3 + i}</td>

      <td>PCS</td>

    </tr>
  `
}

function addSkuRow() {

  addNewRow(
    "sku-tbody",
    7
  )

  setupPagination(
    "sku-table",
    "sku-pagination"
  )
}

setupPagination(
  "sku-table",
  "sku-pagination"
)

// ========================
// LOCATION
// ========================

const locationTbody =
  document.getElementById(
    "location-tbody"
  )

const locationTypes = [

  "Storage",
  "Pick Face",
  "IB Staging",
  "OB Staging"
]

for (let i = 1; i <= 25; i++) {

  locationTbody.innerHTML += `

    <tr>

      <td class="checkbox-cell">

        <input
          type="checkbox"
          class="row-check">

      </td>

      <td>LOC-0${i}</td>

      <td>${locationTypes[i % 4]}</td>

    </tr>
  `
}

function addLocationRow() {

  addNewRow(
    "location-tbody",
    3
  )

  setupPagination(
    "location-table",
    "location-pagination"
  )
}

setupPagination(
  "location-table",
  "location-pagination"
)