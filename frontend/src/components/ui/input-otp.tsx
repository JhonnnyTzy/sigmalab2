import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = ({ className, containerClassName, ref, ...props }: React.ComponentPropsWithoutRef<typeof OTPInput> & { ref?: React.Ref<React.ElementRef<typeof OTPInput>> }) =>  (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
)
InputOTP.displayName = "InputOTP";

export { InputOTPGroup } from './input-otp-group';
export { InputOTPSlot } from './input-otp-slot';
export { InputOTPSeparator } from './input-otp-separator';

export { InputOTP };
