import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

const verifiedDatabases = new Set<string>()
const postgresContainerChecked = { value: false }

export async function ensureSharedPostgreSQL() {
  if (postgresContainerChecked.value) {
    return
  }

  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT

  if (isProduction) {
    try {
      console.log("Checking PostgreSQL connection in production...")
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      if (testResult) {
        console.log("PostgreSQL database is accessible")
        postgresContainerChecked.value = true
        return
      }
    } catch (error) {
      console.error("PostgreSQL connection failed in production:", error)
      throw new Error("Database connection failed. Please check your DATABASE_URL configuration.")
    }
  }

  try {
    console.log("Ensuring shared PostgreSQL container is available...")

    try {
      const { stdout } = await execAsync('docker ps --format "{{.Names}}" | grep -E "(postgres|shared-postgres)"')
      if (stdout.trim()) {
        console.log("PostgreSQL container is already running:", stdout.trim())
        postgresContainerChecked.value = true
        return
      }
    } catch {
      try {
        const testResult = await prisma.$queryRaw`SELECT 1 as test`
        if (testResult) {
          console.log("PostgreSQL database is accessible directly")
          postgresContainerChecked.value = true
          return
        }
      } catch {
        console.log("PostgreSQL not accessible, will try to start container...")
      }
    }

    console.log("Starting shared PostgreSQL container...")

    try {
      await execAsync("./manage-shared-db.sh start")
      console.log("Shared PostgreSQL container started successfully")
    } catch {
      console.log("Management script not found, trying Docker Compose directly...")

      try {
        try {
          await execAsync("docker compose -f docker-compose.shared-db.yml up -d shared-postgres")
          console.log("Shared PostgreSQL container started via Docker Compose (new)")
        } catch {
          await execAsync("docker-compose -f docker-compose.shared-db.yml up -d shared-postgres")
          console.log("Shared PostgreSQL container started via Docker Compose (legacy)")
        }
      } catch (composeError) {
        console.error("Failed to start shared PostgreSQL container")
        throw composeError
      }
    }

    await new Promise(resolve => setTimeout(resolve, 5000))

    postgresContainerChecked.value = true
  } catch (error) {
    console.error("Error ensuring shared PostgreSQL:", error)
    throw error
  }
}

export async function ensureIndustryDatabase(vertical: string = "energy") {
  const databaseName = vertical

  if (verifiedDatabases.has(databaseName)) {
    return
  }

  try {
    await ensureSharedPostgreSQL()

    const result = await prisma.$queryRaw`
      SELECT 1 FROM pg_database WHERE datname = ${databaseName}
    `

    const databaseExists = Array.isArray(result) && result.length > 0

    if (!databaseExists) {
      console.log(`Creating database: ${databaseName}`)
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`)
      console.log(`Database ${databaseName} created successfully`)
    } else {
      console.log(`Database ${databaseName} already exists`)
    }

    await ensureCustomerTable(vertical)

    verifiedDatabases.add(databaseName)
  } catch (error) {
    console.error(`Error ensuring database ${databaseName}:`, error)
    throw error
  }
}

export async function ensureCustomerTable(vertical: string = "energy") {
  const databaseName = vertical

  try {
    const industryClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, `/${databaseName}`) || "",
        },
      },
    })

    const result = await industryClient.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Customer'
      );
    `

    const tableExists = (result as { exists: boolean }[])[0]?.exists

    if (!tableExists) {
      console.log(`Creating customer table in ${databaseName}`)

      await industryClient.$executeRaw`
        CREATE TABLE "Customer" (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          "firstName" VARCHAR(255) NOT NULL,
          "lastName" VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `

      console.log(`Customer table created successfully in ${databaseName}`)
    } else {
      console.log(`Customer table already exists in ${databaseName}`)
    }

    await industryClient.$disconnect()
  } catch (error) {
    console.error(`Error ensuring customer table in ${databaseName}:`, error)
    throw error
  }
}

export async function getIndustryPrismaClient(vertical: string = "energy") {
  const databaseName = vertical

  if (!verifiedDatabases.has(databaseName)) {
    await ensureIndustryDatabase(vertical)
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, `/${databaseName}`) || "",
      },
    },
  })
}

export function resetDatabaseVerificationCache() {
  verifiedDatabases.clear()
  postgresContainerChecked.value = false
  console.log("Database verification cache reset")
}
