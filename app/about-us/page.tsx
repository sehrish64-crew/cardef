import { Metadata } from 'next'
import AboutUsClient from './about-us-client'

export const metadata: Metadata = {
  title: 'About Carreaders - Vehicle History Transparency',
  description:
    'Learn how Carreaders is driving transparency in the automotive industry with blockchain-powered vehicle history reports from 900+ global databases.',
  openGraph: {
    title: 'About Carreaders - Vehicle History Transparency',
    description:
      'Learn how Carreaders is driving transparency in the automotive industry with blockchain-powered vehicle history reports from 900+ global databases.',
    url: 'https://carreaders.com/about-us',
    type: 'website',
  },
}

export default function AboutUs() {
  return <AboutUsClient />
}
