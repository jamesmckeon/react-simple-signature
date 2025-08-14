// src/index.ts
import {
  createElement , type ComponentType, type Ref
} from "react";
import Inner, {
  type SimpleSignatureProps,
  type SignatureRef
} from "./component/SimpleSignature";

/**
 * Adapter: exposes a real React ref to consumers while keeping the
 * inner component's current "ref as prop" API unchanged.
 */
const SimpleSignature = (
  {
    ref, ...props 
  }: Omit<SimpleSignatureProps, "ref"> & {
    ref?: Ref<SignatureRef> 
  }
) => createElement(Inner as unknown as ComponentType<SimpleSignatureProps>, {
  ...(props as SimpleSignatureProps),
  ref
});

 
export {
  SimpleSignature 
};
export type {
  SimpleSignatureProps, SignatureRef 
};