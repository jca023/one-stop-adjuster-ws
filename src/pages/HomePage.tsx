import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import About from '../components/About';
import Contact from '../components/Contact';

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <About />
      <Contact />
    </>
  );
}
