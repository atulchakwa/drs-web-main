import { clearTokenResponse } from "@/lib/auth";

export async function POST() {
    return clearTokenResponse();
}
