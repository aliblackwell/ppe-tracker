const form = document.querySelector("form#onboarding-form")
const formWrapper = document.querySelector(".form-wrapper")
const submitSuccess = document.querySelector(".submission-success")
const doubleSubmitSuccess = document.querySelector("#double-submit-success")
const loading = document.querySelector(".loading")
const humanErrorMessages = document.querySelector("#human-error")
const databaseErrorMessages = document.querySelector("#database-error")
const errorList = document.querySelector("#error-list")

var hospital1 = new autoComplete({
  selector: "#hospital",
  minChars: 1,
  source: function (term, suggest) {
    term = term.toLowerCase()
    var suggestions = []
    for (i = 0; i < hospitals.length; i++)
      if (~hospitals[i].toLowerCase().indexOf(term)) suggestions.push(hospitals[i])
    suggest(suggestions)
  },
})

var grade1 = new autoComplete({
  selector: "#specialty",
  minChars: 1,
  source: function (term, suggest) {
    term = term.toLowerCase()
    var suggestions = []
    for (i = 0; i < specialties.length; i++)
      if (~specialties[i].toLowerCase().indexOf(term)) suggestions.push(specialties[i])
    suggest(suggestions)
  },
})

function showEl(el) {
  el.classList.remove("hidden")
  el.setAttribute("aria-hidden", "false")
}

function hideEl(el) {
  el.classList.add("hidden")
  el.setAttribute("aria-hidden", "true")
}

function handleDatabaseError(error) {
  console.error(error)
  hideEl(formWrapper)
  showEl(databaseErrorMessages)
  resetButton = databaseErrorMessages.querySelector("button")
  resetButton.addEventListener("click", () => {
    hideEl(databaseErrorMessages)
    showEl(formWrapper)
  })
}

function handleHumanErrors(errors) {
  let errorsClosed = 0
  showEl(humanErrorMessages)
  showEl(formWrapper)
  errors.map((error) => {
    let element = document.querySelector(`#${error.param}`)
    let parentId = element.getAttribute("data-parent")
    parentElement = document.querySelector(`#${parentId}`)
    const hasErr = element.getAttribute("data-has-err")
    if (parseInt(hasErr) != 1) {
      element.setAttribute("data-has-err", 1)
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
      if (error.param === "area-code" || error.param === "mobile") {
        parentElement.querySelector("legend").insertAdjacentElement("afterend", errorMessage)
      } else if (error.param === "grade") {
        parentElement
          .querySelector(".styled-select")
          .insertAdjacentElement("beforebegin", errorMessage)
      } else {
        element.insertAdjacentElement("beforebegin", errorMessage)
      }

      element.classList.add("error")
      let addedMsg = document.querySelectorAll(`.msg-${error.param}`)
      element.addEventListener("change", () => {
        errorsClosed++
        element.classList.remove("error")
        element.setAttribute("data-has-err", 0)
        addedMsg.forEach((el) => el.remove())
        if (errors.length === errorsClosed) {
          hideEl(humanErrorMessages)
        }
      })
    }
  })
}

form.addEventListener("submit", (evt) => {
  showEl(loading)
  hideEl(formWrapper)
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
        handleHumanErrors(result.errors)
      } else if (result.error) {
        handleDatabaseError(result.error)
      } else {
        if (result.update) {
          let updateErrors = result.update.map(update => update.error)
          if (updateErrors.includes('conflict')) {
            showEl(doubleSubmitSuccess)
          } 
        }
        showEl(submitSuccess)
        hideEl(humanErrorMessages)
        
      }
    })
})
