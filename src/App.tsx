
import SignaturePad, { type SignaturePadRef } from './SignaturePad'
import {useRef} from 'react'
import './App.css'

export default function App() {
  const signatureRef = useRef<SignaturePadRef>(null);

  const handleClearClick = () => {
    signatureRef.current?.clear();
  };

  return (
    <div>
      <SignaturePad
      className='canvas-border'
        ref={signatureRef}
        height={300}
        width={400}
        onSignatureChange={(blob) => {
          console.log("Signature captured:", blob);
        }}
      />

      <button type='button'onClick={handleClearClick}>
        ✖ Clear Signature
      </button>
    </div>
  );
}
