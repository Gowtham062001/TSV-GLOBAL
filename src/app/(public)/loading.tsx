export default function Loading() {
  return (
    <div style={{
      minHeight:'60vh', display:'flex',
      alignItems:'center', justifyContent:'center'
    }}>
      <div style={{
        width:'36px', height:'36px',
        border:'3px solid #f0f2f8',
        borderTopColor:'#c1000a',
        borderRadius:'50%',
        animation:'spin 0.7s linear infinite'
      }}/>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>
    </div>
  )
}
