import '../style.css';

export default function Home({ user, onNavigateTo, isAdminMode, onLogout }) {
  console.log('Home component - user object:', user);
  console.log('Home component - username:', user?.username);

  return (
    <div className="homepage-container">
      <header>
        <div className="logo">
          <a href="#" onClick={(e) => { e.preventDefault(); }}>
            <img 
              src="/images/image.png" 
              alt="Privacy Quest Logo"
              style={{
                height: '60px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'transform 0.3s ease, filter 0.3s ease',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.filter = 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))';
              }}
            />
          </a>
        </div>
        <button className="btn" onClick={() => window.location.href = 'leaderboard.html'}>
          <a href="leaderboard.html">Leaderboard</a>
        </button>
        <button className="btn" onClick={() => onNavigateTo("account")}>
          <a href="#">Account</a>
        </button>
        {isAdminMode && (
          <button className="btn" onClick={() => onNavigateTo("admin")}>
            <a href="#">Admin Dashboard</a>
          </button>
        )}
        <button className="btn" onClick={onLogout}>
          <a href="#">Uitloggen</a>
        </button>
      </header>

      <div className="container">
        <h1 id="welcome-message" className="welcome">
          Welkom {user?.username || '[gebruiker]'}
        </h1>

        <div className="circle-container">
          <div className="circle-item">
            <div className="circle-title">Papers Please</div>
            <div className="circle">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateTo("papers-please"); }}>
                <img src="/images/papers.jpg" alt="Papers Please" />
              </a>
            </div>
          </div>

          <div className="circle-item">
            <div className="circle-title">Consequenties</div>
            <div className="circle">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateTo("consequenties");
                }}
              >
                <img src="/images/consequenties.jpg" alt="Consequenties" />
              </a>
            </div>
          </div>

          <div className="circle-item">
            <div className="circle-title">Fruit Ninja</div>
            <div className="circle">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateTo("fruitninja");
                }}
              >
                <img src="/images/fruit.jpg" alt="Fruit Ninja" />
              </a>
            </div>
          </div>
        </div>

        <div className="settings">
          <a className="setting" href="settings.html">
            <img src="/images/settings.png" alt="Settings" />
          </a>
        </div>
      </div>
    </div>
  );
}
