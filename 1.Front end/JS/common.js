// ========================
// PAGE NAVIGATION
// ========================

function showPage(pageId) {

  const pages =
    document.querySelectorAll(".page")

  pages.forEach(page => {

    page.classList.add("hidden")
  })

  document
    .getElementById(pageId)
    .classList.remove("hidden")

  // clear effects

  document
    .querySelectorAll(".new-row")
    .forEach(row => {

      row.classList.remove("new-row")
    })

  document
    .querySelectorAll(".editable-cell")
    .forEach(cell => {

      cell.contentEditable = false

      cell.classList.remove(
        "editable-cell"
      )
    })
}

// ========================
// MENU
// ========================

function toggleMenu(menuId) {

  document
    .getElementById(menuId)
    .classList.toggle("hidden")
}

// ========================
// TABLE FUNCTIONS
// ========================

function toggleTableEdit(tableId) {

  const table =
    document.getElementById(tableId)

  const cells =
    table.querySelectorAll("tbody td")

  cells.forEach(cell => {

    if (
      !cell.classList.contains(
        "checkbox-cell"
      )
    ) {

      cell.contentEditable = true

      cell.classList.add(
        "editable-cell"
      )

      // quantity only number

      if (cell.cellIndex === 3) {

        cell.addEventListener(
          "keypress",
          onlyNumber
        )
      }
    }
  })
}

function saveTableEdit(tableId) {

  const table =
    document.getElementById(tableId)

  const cells =
    table.querySelectorAll("tbody td")

  cells.forEach(cell => {

    cell.contentEditable = false

    cell.classList.remove(
      "editable-cell"
    )
  })
}

function deleteSelectedRows(tableId) {

  const table =
    document.getElementById(tableId)

  table
    .querySelectorAll(".row-check:checked")
    .forEach(check => {

      check.closest("tr").remove()
    })

  setupPagination(
    tableId,
    tableId.replace(
      "-table",
      "-pagination"
    )
  )
}

function toggleSelectAll(source, tableId) {

  const table =
    document.getElementById(tableId)

  table
    .querySelectorAll(".row-check")
    .forEach(check => {

      check.checked = source.checked
    })
}

function onlyNumber(event) {

  const char =
    String.fromCharCode(event.which)

  if (!/[0-9]/.test(char)) {

    event.preventDefault()
  }
}

function addNewRow(
  tbodyId,
  columnCount
) {

  const tbody =
    document.getElementById(tbodyId)

  const row =
    document.createElement("tr")

  row.classList.add("new-row")

  let html = `

    <td class="checkbox-cell">

      <input
        type="checkbox"
        class="row-check">

    </td>
  `

  for (
    let i = 1;
    i < columnCount;
    i++
  ) {

    html += `<td></td>`
  }

  row.innerHTML = html

  tbody.prepend(row)

  const cells =
    row.querySelectorAll("td")

  for (
    let i = 1;
    i < cells.length;
    i++
  ) {

    cells[i].contentEditable = true

    cells[i].classList.add(
      "editable-cell"
    )
  }

  cells[1].focus()

  setTimeout(() => {

    row.classList.remove(
      "new-row"
    )

  }, 3000)
}

// ========================
// PAGINATION
// ========================

const rowsPerPage = 10

function setupPagination(
  tableId,
  paginationId
) {

  const table =
    document.getElementById(tableId)

  const tbody =
    table.querySelector("tbody")

  const rows =
    tbody.querySelectorAll("tr")

  const pagination =
    document.getElementById(
      paginationId
    )

  pagination.innerHTML = ""

  const pageCount =
    Math.ceil(
      rows.length / rowsPerPage
    )

  function showPaginationPage(page) {

    rows.forEach((row,index) => {

      row.style.display = "none"

      const start =
        (page - 1) * rowsPerPage

      const end =
        start + rowsPerPage

      if (
        index >= start &&
        index < end
      ) {

        row.style.display = ""
      }
    })

    const buttons =
      pagination.querySelectorAll(
        "button"
      )

    buttons.forEach(btn => {

      btn.classList.remove(
        "active"
      )
    })

    if (buttons[page - 1]) {

      buttons[page - 1]
        .classList.add("active")
    }
  }

  for (
    let i = 1;
    i <= pageCount;
    i++
  ) {

    const button =
      document.createElement(
        "button"
      )

    button.innerText = i

    button.addEventListener(
      "click",
      () => {

        showPaginationPage(i)
      }
    )

    pagination.appendChild(button)
  }

  if (pageCount > 0) {

    showPaginationPage(1)
  }
}