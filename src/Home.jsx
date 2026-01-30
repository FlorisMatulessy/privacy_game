import '../style.css';

export default function Home({ user, onNavigateTo, isAdminMode, onLogout }) {
  console.log('Home component - user object:', user);
  console.log('Home component - username:', user?.username);
  
  return (
    <div>
      <header>
        <div className="logo">
          <a href="#" onClick={(e) => { e.preventDefault(); }}>
            <img src="/images/logo.png" alt="Logo" />
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
              <a href="papersPlease.html">
                <img src="/images/papers.jpg" alt="Papers Please" />
              </a>
            </div>
          </div>

          <div className="circle-item">
            <div className="circle-title">Consequenties</div>
            <div className="circle">
              <a href="consequenties.html">
                <img src="/images/consequenties.jpg" alt="Consequenties" />
              </a>
            </div>
          </div>

          <div className="circle-item">
            <div className="circle-title">Fruit Ninja</div>
            <div className="circle">
              <a href="fruitNinja.html">
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
