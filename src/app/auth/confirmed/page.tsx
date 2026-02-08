'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EmailConfirmedPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/intake')
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email verified!</CardTitle>
          <CardDescription>
            Your email has been confirmed. You will be redirected to get started in a few seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/intake">
            <Button>Continue to Intake</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
