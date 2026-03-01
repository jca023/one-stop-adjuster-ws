import { useEffect } from 'react';

interface LegalRedirectProps {
  pdf: string;
}

export default function LegalRedirect({ pdf }: LegalRedirectProps): React.JSX.Element {
  useEffect(() => {
    window.location.href = pdf;
  }, [pdf]);

  return (
    <section className="pt-32 pb-20">
      <div className="container text-center">
        <p className="text-[var(--color-mist)]">
          Opening PDF document...
        </p>
      </div>
    </section>
  );
}
