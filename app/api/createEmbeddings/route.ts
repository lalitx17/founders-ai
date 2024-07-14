import { NextRequest, NextResponse } from "next/server";

import { paulEssays } from "@/data/paul_graham_essays";


export async function GET(req: NextRequest, res: NextResponse) {
    return NextResponse.json({message: paulEssays.length})
}