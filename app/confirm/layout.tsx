import './confirm.css';

export default function ConfirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="confirm-body">
        <main className="confirm-main">{children}</main>
      </body>
    </html>
  );
}
