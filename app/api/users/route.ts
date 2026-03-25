import { NextRequest, NextResponse } from "next/server"
import { getIndustryPrismaClient } from "@/lib/database-setup"
import bcrypt from "bcryptjs"

const userSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const idParam = searchParams.get("id")
    const limitParam = searchParams.get("limit")

    const vertical = process.env.INDUSTRY_VERTICAL || "energy"
    const prisma = await getIndustryPrismaClient(vertical)

    if (idParam !== null) {
      const id = parseInt(idParam)
      if (isNaN(id)) {
        await prisma.$disconnect()
        return NextResponse.json({ error: "Invalid id" }, { status: 400 })
      }
      const user = await prisma.customer.findUnique({ where: { id }, select: userSelect })
      await prisma.$disconnect()
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json(user)
    }

    const findManyOptions: { select: typeof userSelect; take?: number } = { select: userSelect }

    if (limitParam !== null) {
      const limit = parseInt(limitParam)
      if (isNaN(limit) || limit < 1) {
        await prisma.$disconnect()
        return NextResponse.json({ error: "Invalid limit" }, { status: 400 })
      }
      findManyOptions.take = limit
    }

    const users = await prisma.customer.findMany(findManyOptions)
    await prisma.$disconnect()
    return NextResponse.json(users)
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, email, password, firstName, lastName, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Email, password, first name, and last name are required" }, { status: 400 })
    }

    if (id !== undefined) {
      const parsedId = parseInt(String(id))
      if (isNaN(parsedId) || parsedId < 1) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 })
      }
    }

    const vertical = process.env.INDUSTRY_VERTICAL || "energy"
    const prisma = await getIndustryPrismaClient(vertical)

    const existingUser = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      await prisma.$disconnect()
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.customer.create({
      data: {
        ...(id !== undefined ? { id: parseInt(String(id)) } : {}),
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
      },
      select: userSelect,
    })

    await prisma.$disconnect()
    return NextResponse.json(user)
  } catch (error) {
    console.error("POST /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, email, firstName, lastName, phone } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const parsedId = parseInt(String(id))
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const data: { email?: string; firstName?: string; lastName?: string; phone?: string | null } = {}
    if (email !== undefined) data.email = email.toLowerCase()
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (phone !== undefined) data.phone = phone || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const vertical = process.env.INDUSTRY_VERTICAL || "energy"
    const prisma = await getIndustryPrismaClient(vertical)

    try {
      const user = await prisma.customer.update({
        where: { id: parsedId },
        data,
        select: userSelect,
      })
      await prisma.$disconnect()
      return NextResponse.json(user)
    } catch (updateError: unknown) {
      await prisma.$disconnect()
      if (
        typeof updateError === "object" &&
        updateError !== null &&
        "code" in updateError &&
        (updateError as { code: string }).code === "P2025"
      ) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      throw updateError
    }
  } catch (error) {
    console.error("PUT /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const idParam = body?.id

    if (!idParam) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const id = parseInt(String(idParam))
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const vertical = process.env.INDUSTRY_VERTICAL || "energy"
    const prisma = await getIndustryPrismaClient(vertical)

    try {
      await prisma.customer.delete({ where: { id } })
      await prisma.$disconnect()
      return NextResponse.json({ success: true, id })
    } catch (deleteError: unknown) {
      await prisma.$disconnect()
      if (
        typeof deleteError === "object" &&
        deleteError !== null &&
        "code" in deleteError &&
        (deleteError as { code: string }).code === "P2025"
      ) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      throw deleteError
    }
  } catch (error) {
    console.error("DELETE /api/users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
