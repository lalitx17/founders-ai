import { NextRequest, NextResponse } from "next/server";

import { paulEssays } from "@/data/paul_graham_essays";

import { createEmbeddings } from "./embeddings";


export async function GET(req: NextRequest, res: NextResponse) {
    const embeds = createEmbeddings();
    return NextResponse.json({message: embeds});
}