export default function Home() {
  return (
    <div>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 320,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundImage: 'url(https://img.pikbest.com/wp/202408/website-online-shopping-in-denmark-an-impressive-3d-render-for-social-media-and-websites_9737255.jpg!w700wp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45))' }} />
        <div style={{ position:'absolute', bottom: 24, left: 24, color: 'white' }}>
          <h1 style={{ margin:0, fontSize: 32 }}>Welcome to ShopEase</h1>
          <p style={{ margin:'6px 0 0', opacity: 0.95 }}>Discover great deals across electronics, fashion, accessories and beauty.</p>
        </div>
      </div>
    </div>
  );
}
