<script lang="ts">
  import { check, signup } from "./lib/http";
  import { z } from "zod"

  let existingEmails: string[] = []
  let emailInput = ""
  let emailWasVisited = false

  $: emailIsValid = z.string().email().safeParse(emailInput).success
  $: emailIsAvailable = !existingEmails.some(email => email === emailInput)

  $: emailBorder = emailIsValid && emailIsAvailable ? "input-success" : emailWasVisited ? "input-error" : ""

  const checkEmail = async () => {
    const response = await check(emailInput)
    if (!response.success)
      return
    const exists = response.data.exists
    if (exists)
      existingEmails = [ ...existingEmails, emailInput ]
  }

  $: {
    if (emailInput) {
      checkEmail()
    }
  }

  const handleEmailBlur = () => {
    emailWasVisited = true
  }

  let passwordInput = ""
  let passwordWasVisited = false

  $: passwordIsValid = z.string().min(5).safeParse(passwordInput).success
  $: passwordBorder = passwordIsValid ? "input-success" : passwordWasVisited ? "input-error" : ""

  const handlePasswordBlur = () => {
    passwordWasVisited = true
  }

  let errorShown = false
  let successShown = false

  let passwordAgainInput = ""
  let passwordAgainWasVisited = false

  $: passwordAgainIsValid = passwordAgainInput === passwordInput

  $: passwordAgainBorder = !passwordAgainWasVisited ? "" : passwordAgainIsValid && passwordIsValid ? "input-success" : "input-error"

  const handlePassworAgaindBlur = () => {
    passwordAgainWasVisited = true
  }

  $: isDisabled = !emailIsValid || !passwordIsValid || !passwordAgainIsValid

  const handleSignupClick = async () => {
    const response = await signup({
        email: emailInput,
        password: passwordInput,
        passwordAgain: passwordAgainInput,
      })
      if (!response.success)
        return errorShown = true
      successShown = true
  }
  const handleErrorClick = () => {
    errorShown = false
  }
  const handleSuccessClick = () => {
    successShown = false
    emailInput = ""
    passwordInput = ""
    passwordAgainInput = ""
    emailWasVisited = false
    passwordWasVisited = false
    passwordAgainWasVisited = false
  }
</script>

<main class="flex flex-col items-center gap-10 pt-10">
  <div class="card card-body bg-base-300 max-w-[350px]">
    <h1 class="text-center font-bold text-xl pb-8">Signup</h1>
    <input
      bind:value={emailInput}
      on:blur={handleEmailBlur}
      type="text"
      class={`input input-bordered ${emailBorder}`}
      placeholder="Email" />
    <input
      bind:value={passwordInput}
      on:blur={handlePasswordBlur}
      type="password"
      class={`input input-bordered ${passwordBorder}`}
      placeholder="Password" />
    <input
      bind:value={passwordAgainInput}
      on:blur={handlePassworAgaindBlur}
      type="password"
      class={`input input-bordered ${passwordAgainBorder}`}
      placeholder="Password again" />
    <button
      disabled={isDisabled}
      on:click={handleSignupClick}
      class="btn mt-8 btn-success">
      Signup
    </button>
  </div>

  {#if errorShown}
  <div class="card card-body bg-error text-error-content max-w-[350px]">
    <h1>Could not create user!</h1>
    <button on:click={handleErrorClick} class="btn">Try again</button>
  </div>
  {/if}
  
  {#if successShown}
  <div class="absolute inset-0 z-10 bg-base-300 flex justify-center items-center">
    <div class="card card-body bg-success text-error-content max-w-[350px]">
      <h1>User created!</h1>
      <button on:click={handleSuccessClick} class="btn">Ok</button>
    </div>
  </div>
  {/if}
</main>