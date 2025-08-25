import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/HeroSection';
import TrendingByCategory from '@/components/TrendingByCategory';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <TrendingByCategory />
    </MainLayout>
  );
}
