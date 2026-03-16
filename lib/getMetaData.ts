import { getMessages } from "./getMessages"

type Messages = {
  [key: string]: {
    meta?: {
      title?: string
      description?: string
    }
  }
}

export async function generateMetadataHelper({
  locale,
  brand,
  slug,
}: {
  locale: string
  brand: string
  slug?: string[]
}) {
  const namespace = slug?.length ? slug.join("/") : "home"
  const messages: Messages = (await getMessages(brand, locale)) as Messages
  const meta = messages?.[namespace]?.meta ?? {}

  return {
    title: meta.title ?? brand,
    description: meta.description ?? "",
  }
}
