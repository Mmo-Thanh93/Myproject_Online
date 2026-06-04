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

let currentUser = null

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
    numberColumns: [
      "quantity"
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
    uniqueColumns: [
      "sku_number"
    ],
    numberColumns: [
      "length",
      "width",
      "height"
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
    numberColumns: [
      "quantity"
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

function loadSessionUser() {

  const storedUser =
    sessionStorage.getItem("wms-user")

  if (!storedUser) {

    return null
  }

  try {

    return JSON.parse(storedUser)
  } catch (error) {

    sessionStorage.removeItem("wms-user")

    return null
  }
}

function hasEditPermission() {

  return currentUser &&
    currentUser.can_edit === true
}

function requireEditPermission() {

  if (hasEditPermission()) {

    return true
  }

  showMessageBox(
    "No permission",
    "Your account does not have permission to edit this data.",
    "error"
  )

  return false
}

function setAuthenticatedUser(user) {

  currentUser = user

  sessionStorage.setItem(
    "wms-user",
    JSON.stringify(user)
  )

  document
    .getElementById("login-page")
    .classList.add("hidden")

  document
    .getElementById("app-root")
    .classList.remove("hidden")

  document
    .getElementById("current-user-label")
    .textContent =
      `${user.username} (${user.role})`

  loadInitialTables()
}

async function loginUser(event) {

  event.preventDefault()

  const username =
    document
      .getElementById("login-username")
      .value
      .trim()

  const password =
    document
      .getElementById("login-password")
      .value

  if (
    !username ||
    !password
  ) {

    showMessageBox(
      "Missing login",
      "Please enter user and password.",
      "error"
    )

    return
  }

  const client =
    getSupabaseClient()

  const { data, error } =
    await client.rpc(
      "login_app_user",
      {
        p_username: username,
        p_password: password
      }
    )

  if (error) {

    showMessageBox(
      "Login failed",
      error.message,
      "error"
    )

    return
  }

  if (
    !data ||
    data.length === 0
  ) {

    showMessageBox(
      "Login failed",
      "User or password is incorrect.",
      "error"
    )

    return
  }

  setAuthenticatedUser(data[0])
}

function logoutUser() {

  currentUser = null

  sessionStorage.removeItem("wms-user")

  document
    .getElementById("app-root")
    .classList.add("hidden")

  document
    .getElementById("login-page")
    .classList.remove("hidden")
}

function toggleLoginPassword(source) {

  document
    .getElementById("login-password")
    .type = source.checked
      ? "text"
      : "password"
}

async function loadInitialTables() {

  await Promise.all([
    loadTableFromSupabase("po-table"),
    loadTableFromSupabase("sku-table"),
    loadTableFromSupabase("location-table"),
    loadTableFromSupabase("dn-table")
  ])
}

document.addEventListener("DOMContentLoaded", () => {

  const storedUser =
    loadSessionUser()

  if (storedUser) {

    setAuthenticatedUser(storedUser)
  }
})

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

function isNumberColumn(
  config,
  column
) {

  return config &&
    config.numberColumns &&
    config.numberColumns.includes(column)
}

function showMessageBox(
  title,
  message,
  type = "info"
) {

  let overlay =
    document.querySelector(
      ".message-overlay"
    )

  if (!overlay) {

    overlay =
      document.createElement("div")

    overlay.className =
      "message-overlay hidden"

    overlay.innerHTML = `
      <div class="message-box">
        <div class="message-icon"></div>
        <div class="message-content">
          <h3></h3>
          <p></p>
        </div>
        <button type="button">OK</button>
      </div>
    `

    document.body.appendChild(overlay)

    overlay
      .querySelector("button")
      .addEventListener("click", () => {

        overlay.classList.add("hidden")
      })
  }

  overlay.className =
    `message-overlay message-${type}`

  overlay
    .querySelector("h3")
    .textContent = title

  overlay
    .querySelector("p")
    .textContent = message
}

function getSupabaseClient() {

  if (!window.supabaseClient) {

    showMessageBox(
      "Supabase missing",
      "Supabase is not configured. Check 1.Front end/JS/supabase-config.js",
      "error"
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
      normalizeTableValue(
        config,
        column,
        value
      )
  })

  if (row.dataset.id) {

    data.id = row.dataset.id
  }

  return data
}

function normalizeUniqueValue(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
}

function normalizeNumberValue(
  value,
  column
) {

  if (value === "") {

    return null
  }

  const normalized =
    String(value)
      .trim()
      .replaceAll(",", "")

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {

    throw new Error(
      `Invalid number for ${column}: ${value}`
    )
  }

  return Number(normalized)
}

function normalizeTableValue(
  config,
  column,
  value
) {

  const trimmed =
    String(value ?? "").trim()

  if (trimmed === "") {

    return null
  }

  if (
    isDateColumn(
      config,
      column
    )
  ) {

    return normalizeDateValue(trimmed)
  }

  if (
    isNumberColumn(
      config,
      column
    )
  ) {

    return normalizeNumberValue(
      trimmed,
      column
    )
  }

  return trimmed
}

async function validateUniqueItems(
  config,
  items
) {

  if (
    !config.uniqueColumns ||
    config.uniqueColumns.length === 0
  ) {

    return
  }

  const client =
    getSupabaseClient()

  for (const column of config.uniqueColumns) {

    const seen =
      new Map()

    const values =
      items
        .map(item => item[column])
        .filter(Boolean)

    for (const item of items) {

      const key =
        normalizeUniqueValue(item[column])

      if (!key) {

        continue
      }

      if (seen.has(key)) {

        throw new Error(
          `${item[column]} already exists in current data.`
        )
      }

      seen.set(
        key,
        item
      )
    }

    if (values.length === 0) {

      continue
    }

    const { data, error } =
      await client
        .from(config.tableName)
        .select(`id,${column}`)
        .in(column, values)

    if (error) {

      throw error
    }

    const duplicate =
      data.find(existing => {

        const current =
          seen.get(
            normalizeUniqueValue(
              existing[column]
            )
          )

        return current &&
          current.id !== existing.id
      })

    if (duplicate) {

      throw new Error(
        `${duplicate[column]} already exists in SKU Master.`
      )
    }
  }
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

    showMessageBox(
      "Load failed",
      error.message,
      "error"
    )

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

  if (!requireEditPermission()) {

    return
  }

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

  if (!requireEditPermission()) {

    return
  }

  const table =
    document.getElementById(tableId)

  const config =
    tableConfigs[tableId]

  if (
    config &&
    config.readOnly
  ) {

    showMessageBox(
      "Cannot edit",
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

    let payload

    try {

      payload =
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
    } catch (error) {

      showMessageBox(
        "Invalid data",
        error.message,
        "error"
      )

      return
    }

    const invalidItem =
      payload.find(item => {

        return (config.requiredColumns || [])
          .some(column => {

            return !item[column]
          })
      })

    if (invalidItem) {

      showMessageBox(
        "Missing data",
        "Please fill required fields before saving."
      )

      return
    }

    if (payload.length > 0) {

      try {

        await validateUniqueItems(
          config,
          payload
        )
      } catch (error) {

        showMessageBox(
          "Duplicate data",
          error.message,
          "error"
        )

        return
      }

      const newItems =
        payload.filter(item => !item.id)

      const existingItems =
        payload.filter(item => item.id)

      if (newItems.length > 0) {

        const { error } =
          await client
            .from(config.tableName)
            .insert(newItems)

        if (error) {

          showMessageBox(
            "Save failed",
            error.message,
            "error"
          )

          throw error
        }
      }

      for (const item of existingItems) {

        const { id, ...changes } =
          item

        const { error } =
          await client
            .from(config.tableName)
            .update(changes)
            .eq("id", id)

        if (error) {

          showMessageBox(
            "Save failed",
            error.message,
            "error"
          )

          throw error
        }
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

    showMessageBox(
      "Saved",
      "Data has been saved successfully.",
      "success"
    )

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

  if (!requireEditPermission()) {

    return
  }

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

    showMessageBox(
      "Cannot delete",
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

        showMessageBox(
          "Delete failed",
          error.message,
          "error"
        )

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

function escapeCsvValue(value) {

  const text =
    String(value ?? "")

  if (/[",\n\r]/.test(text)) {

    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

function downloadCsvTemplate(tableId) {

  const config =
    tableConfigs[tableId]

  if (
    !config ||
    config.readOnly
  ) {

    return
  }

  const example =
    config.columns.map(column => {

      if (
        isDateColumn(
          config,
          column
        )
      ) {

        return "2026-05-24"
      }

      if (column.includes("quantity")) {

        return "100"
      }

      if (column === "po_number") {

        return "PO1001"
      }

      if (column === "dn_number") {

        return "DN1001"
      }

      if (column === "sku_number") {

        return "SKU1001"
      }

      return ""
    })

  const csv =
    config.columns
      .map(escapeCsvValue)
      .join(",") + "\n" +
    example
      .map(escapeCsvValue)
      .join(",") + "\n"

  const blob =
    new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8"
      }
    )

  const link =
    document.createElement("a")

  link.href =
    URL.createObjectURL(blob)

  link.download =
    `${config.tableName}_template.csv`

  document.body.appendChild(link)

  link.click()

  link.remove()

  URL.revokeObjectURL(link.href)
}

function normalizeDateValue(value) {

  if (!value) {

    return null
  }

  const text =
    String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {

    return text
  }

  const parts =
    text.match(
      /^(\d{1,4})[\/.-](\d{1,2})[\/.-](\d{1,4})$/
    )

  if (!parts) {

    throw new Error(
      `Invalid date format: ${text}. Use yyyy-mm-dd or dd/mm/yyyy.`
    )
  }

  let first =
    Number(parts[1])

  const second =
    Number(parts[2])

  let third =
    Number(parts[3])

  let year
  let month
  let day

  if (parts[1].length === 4) {

    year = first
    month = second
    day = third
  } else {

    day = first
    month = second
    year = third
  }

  if (year < 100) {

    year += 2000
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    )

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {

    throw new Error(
      `Invalid date value: ${text}`
    )
  }

  return [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-")
}

function countEncodingErrors(text) {

  const badPatterns = [
    "\uFFFD",
    "Ã",
    "Â",
    "Ä",
    "áº",
    "á»",
    "Æ"
  ]

  return badPatterns.reduce((total, pattern) => {

    return total +
      text.split(pattern).length - 1
  }, 0)
}

function fixMojibakeText(value) {

  if (typeof value !== "string") {

    return value
  }

  if (!/[ÃÂÄÆáºá»]/.test(value)) {

    return value
  }

  try {

    const bytes =
      Uint8Array.from(
        value,
        char => char.charCodeAt(0) & 255
      )

    const fixed =
      new TextDecoder("utf-8", {
        fatal: false
      }).decode(bytes)

    if (
      countEncodingErrors(fixed) <
      countEncodingErrors(value)
    ) {

      return fixed
    }
  } catch (error) {

    return value
  }

  return value
}

async function readCsvText(file) {

  const buffer =
    await file.arrayBuffer()

  const utf8Text =
    new TextDecoder("utf-8")
      .decode(buffer)

  let vietnameseText =
    utf8Text

  try {

    vietnameseText =
      new TextDecoder("windows-1258")
        .decode(buffer)
  } catch (error) {

    vietnameseText =
      utf8Text
  }

  if (
    countEncodingErrors(vietnameseText) <
    countEncodingErrors(utf8Text)
  ) {

    return vietnameseText
  }

  return utf8Text
}

function triggerCsvUpload(tableId) {

  if (!requireEditPermission()) {

    return
  }

  const input =
    document.getElementById(
      `${tableId}-csv`
    )

  if (input) {

    input.value = ""

    input.click()
  }
}

function parseCsv(text) {

  const rows = []
  let row = []
  let value = ""
  let inQuotes = false

  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char =
      text[i]

    const nextChar =
      text[i + 1]

    if (
      char === '"' &&
      inQuotes &&
      nextChar === '"'
    ) {

      value += '"'

      i++
    } else if (char === '"') {

      inQuotes =
        !inQuotes
    } else if (
      char === "," &&
      !inQuotes
    ) {

      row.push(value.trim())

      value = ""
    } else if (
      (char === "\n" || char === "\r") &&
      !inQuotes
    ) {

      if (
        char === "\r" &&
        nextChar === "\n"
      ) {

        i++
      }

      row.push(value.trim())

      if (row.some(cell => cell !== "")) {

        rows.push(row)
      }

      row = []
      value = ""
    } else {

      value += char
    }
  }

  row.push(value.trim())

  if (row.some(cell => cell !== "")) {

    rows.push(row)
  }

  return rows
}

function csvRowsToObjects(
  rows,
  config
) {

  if (rows.length < 2) {

    return []
  }

  const headers =
    rows[0].map(header => {

      return header.replace(/^\uFEFF/, "")
    })

  const missingColumns =
    config.columns.filter(column => {

      return !headers.includes(column)
    })

  if (missingColumns.length > 0) {

    throw new Error(
      `Missing CSV columns: ${missingColumns.join(", ")}`
    )
  }

  return rows
    .slice(1)
    .map(row => {

      const item = {}

      config.columns.forEach(column => {

        const index =
          headers.indexOf(column)

        const value =
          row[index] ?? ""

        if (
          value !== "" &&
          isDateColumn(
            config,
            column
          )
        ) {

          item[column] =
            normalizeDateValue(value)

          return
        }

        item[column] =
          value === ""
            ? null
            : fixMojibakeText(value)
      })

      return item
    })
    .filter(item => {

      return config.columns.some(column => {

        return item[column] !== null
      })
    })
}

async function uploadCsvFile(
  event,
  tableId
) {

  if (!requireEditPermission()) {

    return
  }

  const file =
    event.target.files[0]

  if (!file) {

    return
  }

  const config =
    tableConfigs[tableId]

  if (
    !config ||
    config.readOnly
  ) {

    return
  }

  try {

    const text =
      await readCsvText(file)

    const items =
      csvRowsToObjects(
        parseCsv(text),
        config
      )

    if (items.length === 0) {

      showMessageBox(
        "No data",
        "CSV file has no data rows."
      )

      return
    }

    const invalidItem =
      items.find(item => {

        return (config.requiredColumns || [])
          .some(column => {

            return !item[column]
          })
      })

    if (invalidItem) {

      showMessageBox(
        "Missing data",
        "CSV has rows missing required fields."
      )

      return
    }

    try {

      await validateUniqueItems(
        config,
        items
      )
    } catch (error) {

      showMessageBox(
        "Duplicate data",
        error.message,
        "error"
      )

      return
    }

    const client =
      getSupabaseClient()

    const { error } =
      await client
        .from(config.tableName)
        .upsert(items)

    if (error) {

      showMessageBox(
        "Upload failed",
        error.message,
        "error"
      )

      throw error
    }

    await loadTableFromSupabase(tableId)

    if (
      tableId === "po-table" ||
      tableId === "dn-table"
    ) {

      await loadTableFromSupabase(
        "inventory-table"
      )
    }

    showMessageBox(
      "Upload complete",
      `Uploaded ${items.length} rows successfully.`,
      "success"
    )
  } catch (error) {

    showMessageBox(
      "Upload failed",
      error.message,
      "error"
    )
  }
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

  if (!requireEditPermission()) {

    return
  }

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
