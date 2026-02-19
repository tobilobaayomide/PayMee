import Navbar from "@/components/landing/navbar"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import Transactions from "@/components/landing/transactions"
import Services from "@/components/landing/services"
import Testimonial from "@/components/landing/testimonial"
import FAQ from "@/components/landing/faq"
import CTA from "@/components/landing/cta"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main >
      <Navbar />
      <Hero />
      <Features />
      <Transactions />
      <Services />
      <Testimonial />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}