import type { Metadata } from 'next'
import { Suspense } from 'react'
import ContactUsClient from './contact-us-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact Carreaders - Customer Support',
  description: 'Get in touch with Carreaders for any inquiries, support, or sales questions. Available 24/7 to help you.',
  openGraph: {
    title: 'Contact Carreaders',
    description: 'Reach out to our customer support team for assistance with vehicle history reports.',
    url: 'https://carreaders.com/contact-us',
    type: 'website',
  },
}

export default function ContactUsPage() {
  return <ContactUsClient />
}
