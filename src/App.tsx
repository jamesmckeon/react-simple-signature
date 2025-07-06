import { useState } from 'react'
import Component from './component.tsx'
import './app.css'

function App() {
  const [signature, setSignature] = useState<Blob | null>(null);
  return (<>

    {/* {signature !== null && <img src={URL.createObjectURL(signature!)} />} */}

    <div className="component-container">
      <Component onSignatureChange={setSignature} />
    </div >
    {/* {signature !== null && <img src={URL.createObjectURL(signature!)} />
    } */}
  </>
  )
}

export default App
