// ========================
// SKU
// ========================

const skuTbody =
  document.getElementById(
    "sku-tbody"
  )

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

// ========================
// LOCATION
// ========================

const locationTbody =
  document.getElementById(
    "location-tbody"
  )

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
