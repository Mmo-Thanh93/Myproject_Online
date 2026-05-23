const poTbody =
  document.getElementById(
    "po-tbody"
  )

for (let i = 1; i <= 25; i++) {

  poTbody.innerHTML += `

    <tr>

      <td class="checkbox-cell">

        <input
          type="checkbox"
          class="row-check">

      </td>

      <td>2026-05-23</td>

      <td>PO${1000 + i}</td>

      <td>100</td>

      <td>Product ${i}</td>

      <td>2026-05-25</td>

    </tr>
  `
}

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

setupPagination(
  "po-table",
  "po-pagination"
)