// React
import { ComponentProps } from "react";

// Custom Components
import { MotionButton } from "@/components/animations/motion-button";

export interface StepHeaderConfig {
  title: string;
  description: string;
}

export type StepIconConfig = React.ComponentType<{ className?: string }>;

export interface StepButtonConfig {
  label: string;
  key: string;
  className?: string;
  variant?: "default" | "destructive" | "link" | "secondary";
  showInDev?: boolean;
  buttonProps?: ComponentProps<typeof MotionButton>;
}

export interface StepConfig {
  header: StepHeaderConfig;
  Icon: StepIconConfig;
  notice: string;
  buttons: { [key: string]: StepButtonConfig };
}
