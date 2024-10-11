import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import UserWrapper from '@/components/UserWrapper'
import { TransactionPanelProvider } from '@/contexts/TransactionPanelContext'
import TransactionPanel from '@/components/TransactionPanel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flow',
  description: 'Your app description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <TransactionPanelProvider>
        <UserWrapper>
          <body className={inter.className}>
            <Navbar />
            <main className="pt-16 min-h-screen">
              <div className="container mx-auto px-4 max-w-none h-full">
                <TransactionPanel />
                <div>
                  {children}
                </div>
              </div>
            </main>
          </body>
        </UserWrapper>
      </TransactionPanelProvider>
    </html>
  )
}
