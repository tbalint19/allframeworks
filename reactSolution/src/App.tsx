import { useState, useMemo } from "react"
import { ChangeEventHandler } from "react"
import { z } from "zod"
import { signup, check } from "./http"

const App = () => {

  const [ existingEmails, setExistingEmails ] = useState<string[]>([])
  const [ emailWasVisited, setEmailWasVisited ] = useState(false)
  const [ emailInput, setEmailInput ] = useState("")
  const emailIsValid = useMemo(
    () => z.string().email().safeParse(emailInput).success,
    [ emailInput ]
    )
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const newValue = e.target.value
    setEmailInput(newValue)
    const response = await check(newValue)
    if (!response.success)
      return
    const exists = response.data.exists
    if (exists)
      setExistingEmails((emails => [ ...emails, newValue ]))
  }
  const emailIsAvailable = useMemo(
    () => !existingEmails.some(email => email === emailInput),
    [existingEmails, emailInput]
  )
    
  const [ passwordWasVisited, setPasswordWasVisited ] = useState(false)
  const [ passwordInput, setPasswordInput ] = useState("")
  const passwordIsValid = useMemo(
    () => z.string().min(5).safeParse(passwordInput).success,
    [ passwordInput ]
    )
    
  const [ passwordAgainWasVisited, setPasswordAgainWasVisited ] = useState(false)
  const [ passwordAgainInput, setPasswordAgainInput ] = useState("")
  const passwordAgainIsValid = useMemo(
    () => passwordAgainInput === passwordInput,
    [ passwordInput, passwordAgainInput ]
  )

  const isDisabled = useMemo(
    () => !emailIsValid || !passwordIsValid || !passwordAgainIsValid,
    [ emailInput, passwordInput, passwordAgainIsValid ]
  )

  const [ errorShown, setErrorShown ] = useState(false)
  const [ successShown, setSuccessShown ] = useState(false)

  const handleClick = async () => {
    const response = await signup({
      email: emailInput,
      password: passwordInput,
      passwordAgain: passwordAgainInput
    })
    if (!response.success)
      return setErrorShown(true)
    setSuccessShown(true)
  }

  const emailBorder = useMemo(
    () => emailIsValid && emailIsAvailable ? "input-success" : emailWasVisited ? "input-error" : "",
    [ emailInput, emailWasVisited, emailIsAvailable, emailIsValid ]
  )

  const passwordBorder = useMemo(
    () => passwordIsValid ? "input-success" : passwordWasVisited ? "input-error" : "",
    [ passwordIsValid, passwordWasVisited ]
  )

  const passwordAgainBorder = useMemo(
    () => !passwordAgainWasVisited ? "" : passwordAgainIsValid && passwordIsValid ? "input-success" : "input-error",
    [passwordAgainWasVisited, passwordAgainIsValid, passwordIsValid, ]
  )

  const handleSuccessClick = () => {
    setSuccessShown(false)
    setEmailInput("")
    setPasswordInput("")
    setPasswordAgainInput("")
    setEmailWasVisited(false)
    setPasswordWasVisited(false)
    setPasswordAgainWasVisited(false)
  }

  return (
    <main className="flex flex-col items-center gap-10 pt-10">
      <div className="card card-body bg-base-300 max-w-[350px]">
        <h1 className="text-center font-bold text-xl pb-8">Signup</h1>
        <input
          value={emailInput}
          onChange={handleInputChange}
          onBlur={() => setEmailWasVisited(true)}
          type="text"
          className={`input input-bordered ${emailBorder}`}
          placeholder="Email" />
        <input
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          onBlur={() => setPasswordWasVisited(true)}
          type="password"
          className={`input input-bordered ${passwordBorder}`}
          placeholder="Password" />
        <input
          value={passwordAgainInput}
          onChange={e => setPasswordAgainInput(e.target.value)}
          onBlur={() => setPasswordAgainWasVisited(true)}
          type="password"
          className={`input input-bordered ${passwordAgainBorder}`}
          placeholder="Password again" />
        <button
          disabled={isDisabled}
          onClick={handleClick}
          className="btn mt-8 btn-success">
          Signup
        </button>
      </div>

      {errorShown && (
        <div className="card card-body bg-error text-error-content max-w-[350px]">
          <h1>Could not create user!</h1>
          <button onClick={() => setErrorShown(false)} className="btn">Try again</button>
        </div>
      )}
      
      {successShown && (
        <div className="absolute inset-0 z-10 bg-base-300 flex justify-center items-center">
          <div className="card card-body bg-success text-error-content max-w-[350px]">
            <h1>User created!</h1>
            <button onClick={handleSuccessClick} className="btn">Ok</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
