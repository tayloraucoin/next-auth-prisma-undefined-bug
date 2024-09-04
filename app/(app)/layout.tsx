import Providers from '@/components/providers/Providers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
