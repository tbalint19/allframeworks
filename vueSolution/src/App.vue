<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { check, signup } from './http';
import { z } from "zod"

const existingEmails = ref<string[]>([])
const emailInput = ref("")
const emailWasVisited = ref(false)

const emailIsValid = computed(() => z.string().email().safeParse(emailInput.value).success)
const emailIsAvailable = computed(
  () => !existingEmails.value.some(email => email === emailInput.value),
)
const emailBorder = computed(
  () => emailIsValid.value && emailIsAvailable.value ? "input-success" : emailWasVisited.value ? "input-error" : "",
)

watch(emailInput, async (newValue) => {
  const response = await check(newValue)
  if (!response.success)
    return
  const exists = response.data.exists
  if (exists)
    existingEmails.value = [ ...existingEmails.value, newValue ]
})

const handleEmailBlur = () => {
  emailWasVisited.value = true
}

const passwordInput = ref("")
const passwordWasVisited = ref(false)

const passwordIsValid = computed(() => z.string().min(5).safeParse(passwordInput.value).success,)
const passwordBorder = computed(
  () => passwordIsValid.value ? "input-success" : passwordWasVisited.value ? "input-error" : "",
)

const handlePasswordBlur = () => {
  passwordWasVisited.value = true
}

const errorShown = ref(false)
const successShown = ref(false)

const passwordAgainInput = ref("")
const passwordAgainWasVisited = ref(false)

const passwordAgainIsValid = computed(
  () => passwordAgainInput.value === passwordInput.value,
)

const passwordAgainBorder = computed(
  () => !passwordAgainWasVisited.value ? "" : passwordAgainIsValid.value && passwordIsValid.value ? "input-success" : "input-error",
)

const handlePassworAgaindBlur = () => {
  passwordAgainWasVisited.value = true
}

const isDisabled = computed(
  () => !emailIsValid.value || !passwordIsValid.value || !passwordAgainIsValid.value,
)

const handleClick = async () => {
  const response = await signup({
      email: emailInput.value,
      password: passwordInput.value,
      passwordAgain: passwordAgainInput.value,
    })
    if (!response.success)
      return errorShown.value = true
    successShown.value = true
}
const handleErrorClick = () => {
  errorShown.value = false
}
const handleSuccessClick = () => {
  successShown.value = false
  emailInput.value = ""
  passwordInput.value = ""
  passwordAgainInput.value = ""
  emailWasVisited.value = false
  passwordWasVisited.value = false
  passwordAgainWasVisited.value = false
}

</script>

<template>
  <main className="flex flex-col items-center gap-10 pt-10">
      <div className="card card-body bg-base-300 max-w-[350px]">
        <h1 className="text-center font-bold text-xl pb-8">Signup</h1>
        <input
          v-model="emailInput"
          @blur="handleEmailBlur"
          type="text"
          :class="['input', 'input-bordered', emailBorder]"
          placeholder="Email" />
        <input
          v-model="passwordInput"
          @blur="handlePasswordBlur"
          type="password"
          :class="['input', 'input-bordered', passwordBorder]"
          placeholder="Password" />
        <input
          v-model="passwordAgainInput"
          @blur="handlePassworAgaindBlur"
          type="password"
          :class="['input', 'input-bordered', passwordAgainBorder]"
          placeholder="Password again" />
        <button
          :disabled="isDisabled"
          @click="handleClick"
          className="btn mt-8 btn-success">
          Signup
        </button>
      </div>

      <div v-if="errorShown" className="card card-body bg-error text-error-content max-w-[350px]">
        <h1>Could not create user!</h1>
        <button @click="handleErrorClick" className="btn">Try again</button>
      </div>
      
      <div v-if="successShown" className="absolute inset-0 z-10 bg-base-300 flex justify-center items-center">
        <div className="card card-body bg-success text-error-content max-w-[350px]">
          <h1>User created!</h1>
          <button @click="handleSuccessClick" className="btn">Ok</button>
        </div>
      </div>
    </main>
</template>
