const form = document.querySelector("form#onboarding-form")
form.addEventListener("submit", (evt) => {
  evt.preventDefault()
  const FD = new FormData(form)
  fetch(form.getAttribute("action"), {
    method: "POST",
    body: FD,
  })
    .then((response) => response.json())
    .then((result) => console.log(result))
})
