const dnTbody =
  document.getElementById(
    "dn-tbody"
  )

for (let i = 1; i <= 25; i++) {

  dnTbody.innerHTML += `

    <tr>

      <td class="checkbox-cell">

        <input
          type="checkbox"
          class="row-check">

      </td>

      <td>2026-05-23</td>

      <td>DN${2000 + i}</td>

      <td>120</td>

      <td>Product ${i}</td>

      <td>AEON Mall HCM</td>

      <td>AEON Bình Tân</td>

      <td>2026-05-25</td>

    </tr>
  `
}

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

setupPagination(
  "dn-table",
  "dn-pagination"
)