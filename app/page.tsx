import Banner from '@/components/Banner'
import WhyCarreaders from '@/components/WhyCarreaders'
import FeaturesGrid from '@/components/FeaturesGrid'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import VinChecker from '@/components/VinChecker'
import Support from '@/components/Support'
import SampleReportSection from '@/components/SampleReportSection'

export default function Home() {
  return (
    <>
      <Banner />
      <SampleReportSection />
      <FeaturesGrid />
      <HowItWorks />
      <Testimonials />
      <VinChecker />
      <Support />
      <WhyCarreaders />
    </>
  );
}
