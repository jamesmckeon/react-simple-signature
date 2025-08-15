import {
  createElement 
} from "react";
import type {
  ComponentType, Ref, ReactElement 
} from "react";
import Inner, {
  type SimpleSignatureProps,
  type SignatureRef
} from "./component/SimpleSignature";

/** Public entry: accepts a React ref prop and passes it to the inner component */
export function SimpleSignature(
  {
    ref, ...props 
  }: 
  Omit<SimpleSignatureProps, "ref"> & {
    ref?: Ref<SignatureRef> 
  }
): ReactElement | null {
  // eslint-disable-next-line max-len
  return createElement(Inner as unknown as ComponentType<SimpleSignatureProps>, {
    ...(props as SimpleSignatureProps),
    ref
  });
}

export type {
  SimpleSignatureProps, SignatureRef 
};