'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      flexDirection:'column', alignItems:'center',
      justifyContent:'center', fontFamily:'sans-serif',
      background:'#f8f9fa', padding:'20px',
      textAlign:'center'
    }}>
      <div style={{
        background:'#fff', borderRadius:'16px',
        padding:'48px 40px', maxWidth:'480px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width:'56px', height:'56px',
          background:'rgba(193,0,10,0.08)',
          borderRadius:'50%',
          display:'flex', alignItems:'center',
          justifyContent:'center',
          margin:'0 auto 20px', fontSize:'24px'
        }}>⚠️</div>
        <h2 style={{
          fontSize:'20px', fontWeight:700,
          color:'#0f1523', marginBottom:'8px'
        }}>
          Something went wrong
        </h2>
        <p style={{
          fontSize:'14px', color:'#8a9ab5',
          marginBottom:'28px', lineHeight:'1.6'
        }}>
          We hit a temporary error. 
          Please try again in a moment.
        </p>
        <div style={{
          display:'flex', gap:'12px',
          justifyContent:'center'
        }}>
          <button
            onClick={reset}
            style={{
              padding:'11px 24px',
              background:'#c1000a', color:'#fff',
              border:'none', borderRadius:'8px',
              fontSize:'14px', fontWeight:600,
              cursor:'pointer'
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              padding:'11px 24px',
              background:'#f0f2f8', color:'#0f1523',
              borderRadius:'8px', fontSize:'14px',
              fontWeight:600, textDecoration:'none',
              display:'inline-block'
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
