export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-bullseye text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-text-primary">IntelliTarget</h1>
            </div>
            <span className="text-sm text-text-secondary bg-neutral-light px-2 py-1 rounded-full">
              AI-Powered Meta Ads Strategist
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/" 
              className="text-text-secondary hover:text-primary transition-colors"
              data-testid="link-dashboard"
            >
              Dashboard
            </a>
            <a 
              href="/data-management" 
              className="text-text-secondary hover:text-primary transition-colors"
              data-testid="link-data-management"
            >
              Data Management
            </a>
            <a 
              href="#" 
              className="text-text-secondary hover:text-primary transition-colors"
              data-testid="link-history"
            >
              History
            </a>
            <button 
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              data-testid="button-account"
            >
              <i className="fas fa-user-circle mr-2"></i>
              Account
            </button>
          </nav>
          
          <button 
            className="md:hidden text-text-secondary"
            data-testid="button-mobile-menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
