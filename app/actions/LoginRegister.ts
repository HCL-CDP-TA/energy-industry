interface ActionResult<T> {
  success: boolean
  error?: string
  consoleError?: string
  data?: T
}

interface LoginData {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
}

interface RegisterData {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
}

type RegisterInput = {
  email: string
  firstName: string
  lastName: string
  password: string
  phone?: string
}
type LoginInput = {
  email: string
  password: string
}

export async function login({ email, password }: LoginInput): Promise<ActionResult<LoginData>> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const { error, consoleError } = await res.json()
    return { success: false, error: error || "errors.genericError", consoleError }
  }

  const data = await res.json()
  return { success: true, data }
}

export async function register({
  email,
  password,
  firstName,
  lastName,
  phone,
}: RegisterInput): Promise<ActionResult<RegisterData>> {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName, phone }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    console.log(error)
    return { success: false, error: error || "errors.genericError" }
  }

  const data = await res.json()
  return { success: true, data }
}
