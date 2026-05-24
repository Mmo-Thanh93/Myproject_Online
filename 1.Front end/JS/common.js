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

const tableConfigs = {

  "po-table": {
    tableName: "purchase_orders",
    tbodyId: "po-tbody",
    paginationId: "po-pagination",
    dateColumns: [
      "inbound_date",
      "finalize_date"
    ],
    requiredColumns: [
      "po_number"
    ],
    columns: [
      "inbound_date",
      "po_number",
      "quantity",
      "product_name",
      "finalize_date"
    ]
  },

  "sku-table": {
    tableName: "skus",
    tbodyId: "sku-tbody",
    paginationId: "sku-pagination",
    requiredColumns: [
      "sku_number"
    ],
    columns: [
      "sku_number",
      "sku_name",
      "length",
      "width",
      "height",
      "uom"
    ]
  },

  "location-table": {
    tableName: "locations",
    tbodyId: "location-tbody",
    paginationId: "location-pagination",
    columns: [
      "location_name",
      "location_type"
    ]
  },

  "inventory-table": {
    tableName: "inventory_stock",
    tbodyId: "inventory-tbody",
    paginationId: "inventory-pagination",
    orderColumn: "product_name",
    readOnly: true,
    columns: [
      "product_name",
      "inbound_quantity",
      "outbound_quantity",
      "stock_quantity"
    ]
  },

  "dn-table": {
    tableName: "delivery_notes",
    tbodyId: "dn-tbody",
    paginationId: "dn-pagination",
    dateColumns: [
      "outbound_date",
      "finalize_date"
    ],
    requiredColumns: [
      "dn_number"
    ],
    columns: [
      "outbound_date",
      "dn_number",
      "quantity",
      "product_name",
      "delivery_address",
      "store_name",
      "finalize_date"
    ]
  }
}

function getConfigByTbodyId(tbodyId) {

  return Object
    .values(tableConfigs)
    .find(config => {

      return config.tbodyId === tbodyId
    })
}

function isDateColumn(
  config,
  column
) {

  return config &&
    config.dateColumns &&
    config.dateColumns.includes(column)
}

function getSupabaseClient() {

  if (!window.supabaseClient) {

    alert(
      "Supabase is not configured. Check 1.Front end/JS/supabase-config.js"
    )

    throw new Error(
      "Supabase client is missing"
    )
  }

  return window.supabaseClient
}

function createTableRow(
  config,
  data = {}
) {

  const row =
    document.createElement("tr")

  if (data.id) {

    row.dataset.id = data.id
  }

  let html = `

    <td class="checkbox-cell">

      <input
        type="checkbox"
        class="row-check">

    </td>
  `

  config.columns.forEach(column => {

    html += `<td>${data[column] ?? ""}</td>`
  })

  row.innerHTML = html

  return row
}

function getRowData(
  row,
  config
) {

  const cells =
    row.querySelectorAll("td")

  const data = {}

  config.columns.forEach((column,index) => {

    const input =
      cells[index + 1].querySelector(
        "input"
      )

    const value =
      input
        ? input.value.trim()
        : cells[index + 1].innerText.trim()

    data[column] =
      value === "" ? null : value
  })

  if (row.dataset.id) {

    data.id = row.dataset.id
  }

  return data
}

async function loadTableFromSupabase(tableId) {

  const config =
    tableConfigs[tableId]

  const client =
    getSupabaseClient()

  const { data, error } =
    await client
      .from(config.tableName)
      .select("*")
      .order(config.orderColumn || "created_at", {
        ascending: false
      })

  if (error) {

    alert(error.message)

    throw error
  }

  const tbody =
    document.getElementById(
      config.tbodyId
    )

  tbody.innerHTML = ""

  data.forEach(item => {

    tbody.appendChild(
      createTableRow(
        config,
        item
      )
    )
  })

  setupPagination(
    tableId,
    config.paginationId
  )
}

function toggleTableEdit(tableId) {

  const table =
    document.getElementById(tableId)

  const config =
    tableConfigs[tableId]

  const cells =
    table.querySelectorAll("tbody td")

  cells.forEach(cell => {

    if (
      !cell.classList.contains(
        "checkbox-cell"
      )
    ) {

      const column =
        config
          ? config.columns[cell.cellIndex - 1]
          : null

      if (
        isDateColumn(
          config,
          column
        ) &&
        !cell.querySelector("input")
      ) {

        const value =
          cell.innerText.trim()

        cell.innerHTML = `
          <input
            type="date"
            class="date-input"
            value="${value}">
        `
      } else {

        cell.contentEditable = true
      }

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

async function saveTableEdit(tableId) {

  const table =
    document.getElementById(tableId)

  const config =
    tableConfigs[tableId]

  if (
    config &&
    config.readOnly
  ) {

    alert(
      "Inventory is calculated from PO minus outbound and cannot be edited directly."
    )

    return
  }

  if (config) {

    const client =
      getSupabaseClient()

    const rows =
      Array.from(
        table.querySelectorAll("tbody tr")
      )

    const payload =
      rows
        .map(row => getRowData(
          row,
          config
        ))
        .filter(item => {

          return config.columns.some(column => {

            return item[column] !== null
          })
        })

    const invalidItem =
      payload.find(item => {

        return (config.requiredColumns || [])
          .some(column => {

            return !item[column]
          })
      })

    if (invalidItem) {

      alert(
        "Please fill required fields before saving."
      )

      return
    }

    if (payload.length > 0) {

      const { error } =
        await client
          .from(config.tableName)
          .upsert(payload)

      if (error) {

        alert(error.message)

        throw error
      }
    }
  }

  const cells =
    table.querySelectorAll("tbody td")

  cells.forEach(cell => {

    cell.contentEditable = false

    cell.classList.remove(
      "editable-cell"
    )
  })

  if (config) {

    await loadTableFromSupabase(tableId)

    if (
      tableId === "po-table" ||
      tableId === "dn-table"
    ) {

      await loadTableFromSupabase(
        "inventory-table"
      )
    }
  }
}

async function deleteSelectedRows(tableId) {

  const table =
    document.getElementById(tableId)

  const checkedRows =
    Array.from(
      table.querySelectorAll(
        ".row-check:checked"
      )
    ).map(check => {

      return check.closest("tr")
    })

  const config =
    tableConfigs[tableId]

  if (
    config &&
    config.readOnly
  ) {

    alert(
      "Inventory is calculated from PO minus outbound and cannot be deleted directly."
    )

    return
  }

  if (config) {

    const ids =
      checkedRows
        .map(row => row.dataset.id)
        .filter(Boolean)

    if (ids.length > 0) {

      const client =
        getSupabaseClient()

      const { error } =
        await client
          .from(config.tableName)
          .delete()
          .in("id", ids)

      if (error) {

        alert(error.message)

        throw error
      }
    }
  }

  checkedRows.forEach(row => {

    row.remove()
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

  const config =
    getConfigByTbodyId(tbodyId)

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

  const columns =
    config
      ? config.columns
      : Array(columnCount - 1).fill("")

  columns.forEach(column => {

    if (
      isDateColumn(
        config,
        column
      )
    ) {

      html += `
        <td>
          <input
            type="date"
            class="date-input">
        </td>
      `
    } else {

      html += `<td></td>`
    }
  })

  row.innerHTML = html

  tbody.prepend(row)

  const cells =
    row.querySelectorAll("td")

  for (
    let i = 1;
    i < cells.length;
    i++
  ) {

    if (!cells[i].querySelector("input")) {

      cells[i].contentEditable = true
    }

    cells[i].classList.add(
      "editable-cell"
    )
  }

  const firstInput =
    row.querySelector("input.date-input")

  if (firstInput) {

    firstInput.focus()
  } else {

    cells[1].focus()
  }

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
