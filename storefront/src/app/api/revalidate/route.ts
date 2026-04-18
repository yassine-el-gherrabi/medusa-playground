import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret")
  const envSecret = process.env.REVALIDATE_SECRET

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json(
      { error: "Invalid secret", hasEnvSecret: !!envSecret },
      { status: 401 }
    )
  }

  const body = await request.json()
  const tag = body.tag as string

  if (!tag) {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 })
  }

  revalidateTag(tag)

  return NextResponse.json({ revalidated: true, tag })
}
