import Image from 'next/image';

export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex items-center justify-end">
        <Image src="/images/logo.png" alt="Baunow GJT" height={300} width={400} />
      </div>
    </footer>
  );
}
