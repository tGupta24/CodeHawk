import LoginUi from "@/module/auth/components/LoginUi"
import { requireUnAuth } from "@/module/auth/utils/auth-utils"
import React from "react"

export default async function LoginPage() {

    await requireUnAuth();
    return (
        <div>
            <LoginUi />
        </div>
    )
}