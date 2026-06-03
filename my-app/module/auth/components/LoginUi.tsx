"use client"
import React, { useState } from "react"
import { signIn } from "@/lib/auth-client"

export default function LoginUi() {
   const [isLoading, setIsLoading] = useState(false)

   const handleGithubLogin = async () => {
      setIsLoading(true)
      try {
         await signIn.social({ provider: "github" })
      } catch (error) {
         console.log("LOGIN ERROR:: ", error)
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className="min-h-screen bg-linear-to-br from-black via-black to-zinc-900 text-white dark flex">

         {/* Left Section - Hero Content */}
         <div className="flex-1 flex flex-col justify-center px-12 py-16">
            <div className="max-w-lg">

               {/* Logo */}
               <div className="mb-16">
                  <div className="inline-flex items-center gap-2 text-2xl font-bold">
                     <div className="w-8 h-8 bg-primary rounded-full" />
                     <span>CodeRabbit</span>
                  </div>
               </div>

               {/* Main Content */}
               <h1 className="text-5xl font-bold mb-6 leading-tight text-balance">
                  AI-powered code reviews for modern teams
               </h1>
               <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                  Improve code quality, catch bugs early, and ship faster with
                  intelligent, automated code review that understands your codebase.
               </p>

               {/* Feature highlights */}
               <ul className="space-y-3 text-sm text-zinc-400">
                  {[
                     "Line-by-line AI code review",
                     "Integrates with GitHub, GitLab & Bitbucket",
                     "Customizable review rules & tone",
                  ].map((feature) => (
                     <li key={feature} className="flex items-center gap-2">
                        <svg
                           className="w-4 h-4 text-primary shrink-0"
                           fill="none"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           strokeWidth={2.5}
                        >
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                     </li>
                  ))}
               </ul>
            </div>
         </div>

         {/* Right Section - Login Form */}
         <div className="flex-1 flex flex-col justify-center items-center px-12 py-16">
            <div className="w-full max-w-sm">

               {/* Heading */}
               <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-zinc-400">Login using one of the following providers:</p>
               </div>

               {/* GitHub Login Button */}
               <button
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 mb-8"
               >
                  <GithubIcon size={20} />
                  {isLoading ? "Signing in..." : "GitHub"}
               </button>

               {/* Footer Links */}
               <div className="space-y-4 text-center text-sm text-zinc-400">
                  <div>
                     New to CodeRabbit?{" "}
                     <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                        Sign Up
                     </a>
                  </div>
                  <div>
                     <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                        Self-Hosted Services
                     </a>
                  </div>
               </div>

               {/* Bottom Links */}
               <div className="mt-12 pt-8 border-t border-zinc-700 flex justify-center gap-4 text-xs text-zinc-500">
                  <a href="#" className="hover:text-zinc-400">Terms of Use</a>
                  <span>and</span>
                  <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
               </div>
            </div>
         </div>
      </div>
   )
}

function GithubIcon({ size = 24 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="currentColor"
         aria-hidden="true"
      >
         <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
   )
}