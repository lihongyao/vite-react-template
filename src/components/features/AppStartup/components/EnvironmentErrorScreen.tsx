import type { EnvironmentRequirement } from '../environment';

interface EnvironmentErrorScreenProps {
  requirement: EnvironmentRequirement;
}

export default function EnvironmentErrorScreen({ requirement }: EnvironmentErrorScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f9f9f9] px-6">
      <img src={requirement.icon} alt="" className="size-[52px]" />
      <p role="alert" className="text-center text-sm leading-6 text-[#666]">
        Please open this app within {requirement.name}.
      </p>
    </main>
  );
}
