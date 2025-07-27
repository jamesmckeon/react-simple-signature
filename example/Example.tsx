import SignaturePad, { type SignaturePadRef } from '../src/component/SignaturePad'
import { useRef, useState, useEffect } from 'react'

import './example.css'

export default function Example() {
  const signatureRef = useRef<SignaturePadRef>(null);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleClearClick = () => {
    signatureRef.current?.clear();
    setSignatureBlob(null);
  };

  useEffect(() => {
    if (!signatureBlob) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(signatureBlob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [signatureBlob]);

  return (
    <div>
      <SignaturePad
        blobFormat='png'
        className='canvas-border'
        height={300}
        onSignatureChange={(blob) => {
          setSignatureBlob(blob);
        }}
        ref={signatureRef}
        strokeColor='#FF0000'
        width={400}
      />

      <button 
        className='btn btn-outline-secondary'
        onClick={handleClearClick}
        type='button'>
        Clear
      </button>

      {imageUrl && (
        <div  style={{ marginTop: '1rem' , width: '400px'}}>
          <strong>Signature Preview:</strong>
          <img alt="Signature preview"
            className="signature-preview" 
            src={imageUrl} />
        </div>
      )} 
    </div>
  );
}
