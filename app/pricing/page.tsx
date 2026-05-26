import { Metadata } from 'next'
import PricingClient from './pricing-client'

export const metadata: Metadata = {
  title: 'Pricing Plans - Car Readers Vehicle History Reports',
  description:
    'Affordable vehicle history report pricing plans. Premium reports starting from $50. Find the perfect plan for your needs.',
  openGraph: {
    title: 'Pricing Plans - Carreaders Vehicle History Reports',
    description:
      'Affordable vehicle history report pricing plans. Premium reports starting from $50. Find the perfect plan for your needs.',
    url: 'https://carreaders.com/pricing',
    type: 'website',
  },
}

export default function Pricing() {
  return <PricingClient />
}
