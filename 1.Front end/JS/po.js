const poTbody =
  document.getElementById(
    "po-tbody"
  )

function addPoRow() {

  addNewRow(
    "po-tbody",
    6
  )

  setupPagination(
    "po-table",
    "po-pagination"
  )
}

loadTableFromSupabase(
  "po-table"
)
