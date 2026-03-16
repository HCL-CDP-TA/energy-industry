import { NextRequest, NextResponse } from "next/server"
import { getIndustryPrismaClient } from "@/lib/database-setup"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const vertical = process.env.INDUSTRY_VERTICAL || "energy"
    const prisma = await getIndustryPrismaClient(vertical)

    const user = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Password validation disabled for testing
    console.log("Password validation DISABLED - accepting any password for testing")

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    }

    await prisma.$disconnect()
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        consoleError: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
