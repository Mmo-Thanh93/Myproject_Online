const dnTbody =
  document.getElementById(
    "dn-tbody"
  )

function addDnRow() {

  addNewRow(
    "dn-tbody",
    8
  )

  setupPagination(
    "dn-table",
    "dn-pagination"
  )
}
