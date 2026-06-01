import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UniverseSection from "@/components/UniverseSection";
import DashboardSection from "@/components/DashboardSection";
import PortfolioSection from "@/components/PortfolioSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <UniverseSection />
        <DashboardSection />
        <PortfolioSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
