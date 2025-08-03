import SignaturePad, {
  type SignaturePadRef 
} 
  from '../src/component/SignaturePad'
import {
  useRef, useState, useEffect 
} from 'react'

import './example.css'

export default function Example() {
  const signatureRef = useRef<SignaturePadRef>(null);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [stroke, setStroke] = useState<`#${string}`>('#000000');

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
    <div className='mt-5 d-flex flex-column align-items-center'>
      <div className='mb-3 input-group '
        style={{
          width: '200px' 
        }}>
        <div className='input-group-prepend'>
          <span className='input-group-text'>Stroke Color</span>
        </div>
        <input className='form-control  form-control-color'
          onChange={(e) => { setStroke(e.target.value as `#${string}`); }}
          type="color" 
          value={stroke} /></div>
      <SignaturePad
        blobFormat='png'
        className='canvas-border'
        height={300}
        onChange={(blob) => {
          setSignatureBlob(blob);
        }}
        ref={signatureRef}
        strokeColor={stroke}
        width={400}
      />

      <button 
        className='btn btn-outline-secondary mt-4'
        onClick={handleClearClick}
        type='button'>
        Clear
      </button>

      {imageUrl && (
        <div  style={{
          marginTop: '1rem' , width: '400px'
        }}>
          <strong>Signature Preview:</strong>
          <img alt="Signature preview"
            className="signature-preview" 
            src={imageUrl} />
        </div>
      )} 
    </div>
  );
}
