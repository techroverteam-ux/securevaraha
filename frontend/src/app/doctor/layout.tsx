import Layout from '@/components/layout/Layout';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}