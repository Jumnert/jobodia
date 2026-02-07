import { ReactNode, Suspense } from "react";

type Props = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

export function AsyncIf({
  children,
  condition,
  loadingFallback,
  otherwise,
}: Props) {
  return (
    <Suspense fallback={loadingFallback}>
      <SuspendedComponents condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponents>
    </Suspense>
  );
}

async function SuspendedComponents({
  children,
  condition,
  otherwise,
}: Omit<Props, "LoadingFallback">) {
  return (await condition()) ? children : otherwise;
}
