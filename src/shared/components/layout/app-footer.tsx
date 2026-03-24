export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} EU Project Manager. All rights reserved.</p>
          <p>European Project Analytics Platform</p>
        </div>
      </div>
    </footer>
  );
}
