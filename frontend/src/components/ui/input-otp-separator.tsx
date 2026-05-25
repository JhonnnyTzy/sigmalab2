import * as React from "react";

const InputOTPSeparator = (props: React.ComponentPropsWithoutRef<"hr"> & { ref?: React.Ref<React.ElementRef<"hr">> }) => (
  <hr {...props} />
)
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTPSeparator };
