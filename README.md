# react-simple-signature

A lightweight React component for capturing lines drawn via touch or mouse. Designed with smooth stroke rendering, high-DPI support, image export, and an exposed `ref` that allows consumers clear the component.

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

| Prop              | Type                             | Default   | Description                                               |
|-------------------|----------------------------------|-----------|-----------------------------------------------------------|
| `width`           | `number \| null`                 | `400`     | Canvas width in pixels                                    |
| `height`          | `number \| null`                 | `400`     | Canvas height in pixels                                   |
| `onSignatureChange` | `(blob: Blob) => void`         | `undefined` | Callback when user draws on canvas                        |
| `className`       | `string`                         | `""`      | Optional class name for styling the canvas                |
| `blobFormat`      | `"png"` \| `"jpeg"`              | `"png"`   | Format of exported signature image                        |
| `strokeColor`     | `` `#${string}` ``               | `"#000"`  | Hex color for the signature stroke                        |
| `ref`             | `React.Ref<SignaturePadRef>`     | `—`       | Exposes `clear()` for programmatic canvas clearing        |

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

## 🛠️ Scripts

| Script        | Description                     |
|---------------|---------------------------------|
| `npm run dev` | Start dev server with Vite      |
| `npm run build` | Type-check and build project |
| `npm run preview` | Preview the build locally   |
| `npm run lint` | Run ESLint                    |
| `npm run lint-fix` | Auto-fix ESLint issues     |

---

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and browser tests.  
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
