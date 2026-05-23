function showPage(pageId) {

  // lấy tất cả page

  const pages = document.querySelectorAll(".page")

  // ẩn toàn bộ

  pages.forEach(page => {

    page.classList.add("hidden")

  })

  // hiện page được click

  document
    .getElementById(pageId)
    .classList.remove("hidden")
}

function toggleMenu(menuId) {

  const menu = document.getElementById(menuId)

  menu.classList.toggle("hidden")
}

function searchTable() {

  const input =
    document.getElementById("search-input")

  const filter =
    input.value.toLowerCase()

  const column =
    document.getElementById("search-column").value

  const rows =
    document.querySelectorAll("#po-page tbody tr")

  rows.forEach(row => {

    const cells = row.querySelectorAll("td")

    let text = ""

    // search all column

    if (column === "all") {

      text = row.innerText.toLowerCase()

    }

    // search specific column

    else {

      text =
        cells[column].innerText.toLowerCase()
    }

    // hide/show

    if (text.includes(filter)) {

      row.style.display = ""

    } else {

      row.style.display = "none"
    }

  })
}