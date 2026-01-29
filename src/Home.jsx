export default function Home({ user, onNavigateTo, isAdminMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-border text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">🏠 Home</h1>
        <p className="text-muted-foreground mb-8">Welkom {user?.username}!</p>
        
        <div className="space-y-4">
          <button
            onClick={() => onNavigateTo("account")}
            className="w-full py-3 px-4 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all"
          >
            👤 Account
          </button>
          
          {isAdminMode && (
            <button
              onClick={() => onNavigateTo("admin")}
              className="w-full py-3 px-4 rounded-lg font-semibold bg-purple-500 hover:bg-purple-600 text-white transition-all"
            >
              ⚙️ Admin Panel
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Placeholder Home pagina - wordt verder ingewerkt
        </p>
      </div>
    </div>
  );
}
