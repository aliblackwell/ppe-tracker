const form = document.querySelector("form#onboarding-form")
const formWrapper = document.querySelector(".form-wrapper")
const submitSuccess = document.querySelector(".submission-success")
const loading = document.querySelector(".loading")
const messages = document.querySelector(".messages")
const errorList = document.querySelector("#error-list")

function showEl(el) {
  el.classList.remove("hidden")
  el.setAttribute("aria-hidden", "false")
}

function hideEl(el) {
  el.classList.add("hidden")
  el.setAttribute("aria-hidden", "true")
}

function handleErrors(errors) {
  let errorsClosed = 0
  showEl(messages)
  errors.map((error) => {
    let element = document.querySelector(`#${error.param}`)
    let parentId = element.getAttribute("data-parent")
    const hasErr = element.getAttribute("data-has-err")
    if (!hasErr) {
      element.setAttribute("data-has-err", true)
      let errorMessage = document.createElement("span")

      let errorListItem = document.createElement("li")
      errorListItem.setAttribute("class", `msg-${error.param}`)
      let errorLink = document.createElement("a")
      errorLink.innerHTML = error.param
      errorLink.setAttribute("href", `#${parentId}`)
      errorListItem.innerHTML = errorLink.outerHTML
      errorList.insertAdjacentElement("beforeend", errorListItem)

      errorMessage.classList.add(`msg`)
      errorMessage.classList.add(`msg-${error.param}`)
      errorMessage.setAttribute("role", "alert")
      errorMessage.innerHTML = error.msg
      element.insertAdjacentElement("beforebegin", errorMessage)
      element.classList.add("error")
      let addedMsg = document.querySelectorAll(`.msg-${error.param}`)
      element.addEventListener("change", () => {
        errorsClosed++
        element.classList.remove("error")
        element.setAttribute("data-has-err", false)
        addedMsg.forEach((el) => el.remove())
        if (errors.length === errorsClosed) {
          hideEl(messages)
        }
      })
    }
  })
}

form.addEventListener("submit", (evt) => {
  showEl(loading)
  window.scrollTo(0, 0)
  evt.preventDefault()

  const FD = new FormData(form)
  fetch(form.getAttribute("action"), {
    method: "POST",
    body: FD,
  })
    .then((response) => response.json())
    .then((result) => {
      hideEl(loading)
      if (result.errors) {
        handleErrors(result.errors)
      } else {
        hideEl(formWrapper)
        showEl(submitSuccess)
      }
    })
})
