const onboardingFormWrapper = document.querySelector("#onboarding-form-wrapper")
const signupFormWrapper = document.querySelector("#signup-form-wrapper")
const submitSuccess = document.querySelector(".submission-success")
const verifyNumberFormWrapper = document.querySelector("#verify-number-form-wrapper")
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

function handleDatabaseError(error, startCallback, clickCallback) {
  console.error(error)
  startCallback()
  const resetButton = databaseErrorMessages.querySelector("button")
  resetButton.addEventListener("click", () => {
    clickCallback()
  })
}

function handlePhoneVerificationError() {
  const goBackButton = document.querySelectorAll(".go-back")
  goBackButton.forEach((button) => {
    button.addEventListener("click", () => {
      showEl(onboardingFormWrapper)
      hideEl(verifyNumberFormWrapper)
    })
  })
}

function handleHumanErrors(errors, beginCb, endCb) {
  let errorsClosed = 0
  beginCb()
  errors.map((error) => {
    let element = document.querySelector(`#${error.param}`)
    const labelSelector = element.getAttribute('data-label')
    const labelContent = document.querySelector(labelSelector).innerHTML

    let parentId = element.getAttribute("data-parent")
      ? element.getAttribute("data-parent")
      : error.param

    const parentElement = document.querySelector(`#${parentId}`)

    const hasErr = element.getAttribute("data-has-err")
    if (parseInt(hasErr) != 1) {
      element.setAttribute("data-has-err", 1)
      let errorMessage = document.createElement("span")

      let errorListItem = document.createElement("li")
      errorListItem.setAttribute("class", `msg-${error.param}`)
      let errorLink = document.createElement("a")
      errorLink.innerHTML = labelContent
      errorLink.setAttribute("href", `#${parentId}`)
      errorListItem.innerHTML = errorLink.outerHTML
      errorList.insertAdjacentElement("beforeend", errorListItem)

      errorMessage.classList.add(`msg`)
      errorMessage.classList.add(`msg-${error.param}`)
      errorMessage.setAttribute("role", "alert")
      errorMessage.innerHTML = error.msg
      if (error.param === "area-code" || error.param === "mobile") {
        parentElement.querySelector("legend").insertAdjacentElement("afterend", errorMessage)
      } else if (error.param === "grade" || error.param === "care") {
        parentElement
          .querySelector(`#styled-select-${error.param}`)
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
          endCb()
        }
      })
    }
  })
}

function setMobile(mobile) {
  const mobileHolder = document.querySelector("span.mobile-number")
  const mobileInput = document.querySelector("#hidden-mobile")
  mobileInput.value = mobile
  mobileHolder.innerHTML = mobile
}

const verifyNumberForm = {
  formEl: document.querySelector("form#verify-number-form"),
  loadingEl: loading,
  wrapperEl: verifyNumberFormWrapper,
  humanErrorStart: () => {
    showEl(humanErrorMessages)
    showEl(verifyNumberFormWrapper)
  },
  humanErrorEnd: () => hideEl(humanErrorMessages),
  databaseErrorStart: () => {},
  databaseErrorEnd: () => {},
  handleConflict: () => {},
  handleSuccess: (result) => {
    if (result.message === "approved") {
      showEl(submitSuccess)
    } else {
      showEl(verifyNumberFormWrapper)
      showEl(document.querySelector("#got-pending"))
    }

    hideEl(humanErrorMessages)
  },
}

const signupForm = {
  formEl: document.querySelector("form#signup-form"),
  loadingEl: loading,
  wrapperEl: signupFormWrapper,
  humanErrorStart: () => {
    showEl(humanErrorMessages)
    showEl(signupFormWrapper)
  },
  humanErrorEnd: () => hideEl(humanErrorMessages),
  databaseErrorStart: () => {
    hideEl(signupFormWrapper)
    showEl(databaseErrorMessages)
  },
  databaseErrorEnd: () => {
    hideEl(databaseErrorMessages)
    showEl(signupFormWrapper)
  },
  handleConflict: () => showEl(document.querySelector("#duplicate-email")),
  handleSuccess: () => {
    showEl(document.querySelector("#signup-success"))
    hideEl(humanErrorMessages)
    hideEl(doubleSubmitSuccess)
  },
}

const onboardingForm = {
  formEl: document.querySelector("form#onboarding-form"),
  loadingEl: loading,
  wrapperEl: onboardingFormWrapper,
  humanErrorStart: () => {
    showEl(humanErrorMessages)
    showEl(onboardingFormWrapper)
  },
  humanErrorEnd: () => hideEl(humanErrorMessages),
  databaseErrorStart: () => {
    hideEl(onboardingFormWrapper)
    showEl(databaseErrorMessages)
  },
  databaseErrorEnd: () => {
    hideEl(databaseErrorMessages)
    showEl(onboardingFormWrapper)
  },
  handleConflict: () => showEl(doubleSubmitSuccess),
  handleSuccess: (response) => {
    showEl(verifyNumberFormWrapper)
    setMobile(response.mobile)
    hideEl(humanErrorMessages)
  },
}

function handleForm(form) {
  form.formEl.addEventListener("submit", (evt) => {
    showEl(form.loadingEl)
    hideEl(form.wrapperEl)
    window.scrollTo(0, 0)
    evt.preventDefault()

    const FD = new FormData(form.formEl)
    fetch(form.formEl.getAttribute("action"), {
      method: "POST",
      body: FD,
    })
      .then((response) => response.json())
      .then((result) => {
        hideEl(form.loadingEl)
        if (result.errors) {
          handleHumanErrors(
            result.errors,
            () => {
              form.humanErrorStart()
            },
            () => form.humanErrorEnd()
          )
        } else if (result.error) {
          handleDatabaseError(
            result.error,
            () => {
              form.databaseErrorStart()
            },
            () => {
              form.databaseErrorEnd()
            }
          )
        } else {
          if (result.success && result.success.identifiers.length > 1) {
            form.handleConflict()
          }
          if (result.update) {
            let updateErrors = result.update.map((update) => update.error)
            if (updateErrors.includes("conflict")) {
              form.handleConflict()
            }
          }
          form.handleSuccess(result)
        }
      })
  })
}

handleForm(verifyNumberForm)
handleForm(signupForm)
handleForm(onboardingForm)
handlePhoneVerificationError()
