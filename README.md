# react-simple-signature

A lightweight React component for capturing, drawing, and exporting digital signatures on an HTML canvas. Supports touch, mouse, and stylus input for e-signature, signature pad, and handwriting capture in forms and apps.

---

## Background

I built `react-simple-signature` to provide a minimal, easy-to-use solution for capturing signatures in React applications without dealing with HTML canvas complexity. It works seamlessly with both touch and mouse input, supports high-DPI displays for crisp rendering, and exposes a simple `ref` API for programmatic clearing. The component is unopinionated about styling, letting you integrate it into any design system, and it outputs image data in common formats without requiring deep canvas knowledge.

---

## Installation

```bash
npm install react-simple-signature
```

---

## Usage

```tsx
import React, { useRef } from 'react'
import SimpleSignature, { SignatureRef } from 'react-simple-signature'

function MyForm() {
  const signatureRef = useRef<SignatureRef>(null)

  const handleSignature = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    console.log('Signature URL:', url)
  }

  const handleClear = () => {
    padRef.current?.clear()
  }

  return (
    <>
      <SimpleSignature
        ref={signatureRef}
        onSignatureChange={handleSignature}
        width={500}
        height={300}
        strokeColor="#0a0"
        className="border border-gray-300"
        blobFormat="jpeg"
      />
      <button onClick={handleClear}>Clear</button>
    </>
  )
}
```

---

## Props

| Prop         | Type                             | Default   | Description                                                   |
|--------------|----------------------------------|-----------|---------------------------------------------------------------|
| `onChange`   | `(blob: Blob) => void`           | —         | Callback fired when the user modifies the drawing; receives a blob of the updated image |
| `onStart`    | `() => void`                     | —         | Callback fired when the user starts drawing                   |
| `height`     | `number`                         | —         | Canvas height in pixels                                       |
| `width`      | `number`                         | —         | Canvas width in pixels                                        |
| `className`  | `string`                         | `""`      | Optional class name for styling the canvas                    |
| `ref`        | `Ref<SignatureRef>`              | —         | Ref exposing the `clear()` method for programmatic clearing   |
| `blobFormat` | `"png"` \| `"jpeg"`              | `"png"`   | Format of the exported signature image                        |
| `strokeColor`| `` `#${string}` ``               | `"#000"`  | Hex color for the signature stroke                            |

---

## Ref API

The component supports a `ref` so consumers can interact with it programmatically:

```ts
interface SignaturePadRef {
  clear: () => void
}
```

Use `ref.current?.clear()` to clear the canvas.

---

## Scripts

| Script        | Description                               |
|---------------|-------------------------------------------|
| `build`       | Type-check and build the project          |
| `lint`        | Run ESLint                                |
| `lint-fix`    | Auto-fix ESLint issues                    |
| `test`        | Run all tests with Vitest                 |
| `dev:example` | Start the example app in development mode |

---

## Testing

This project uses [Vitest](https://vitest.dev/) and [react-testing-library](https://github.com/testing-library/react-testing-library).  
Run tests with:

```bash
npx vitest
```

---

## Tech Stack

- React 19
- TypeScript
- Vite
- Vitest
- ESLint + Stylistic

---

## License

MIT

---

## Author

Maintained by [jamesmckeon](https://github.com/jamesmckeon).

---
