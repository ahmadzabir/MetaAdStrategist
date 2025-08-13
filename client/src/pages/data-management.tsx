import Header from "@/components/header";
import FirebaseUploader from "@/components/firebase-uploader";

export default function DataManagement() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Data Management
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl">
            Upload and manage your Meta targeting data in Firebase. This is where you can import 
            your comprehensive targeting categories database.
          </p>
        </div>

        <div className="space-y-8">
          <FirebaseUploader />
          
          {/* Additional data management tools can be added here */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-database text-secondary"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Database Status</h3>
                <p className="text-text-secondary text-sm">Monitor your data storage and connection</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Storage Type</p>
                    <p className="text-xs text-text-secondary">Current database</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral">In-Memory</p>
                    <p className="text-xs text-text-secondary">Dev Mode</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Categories</p>
                    <p className="text-xs text-text-secondary">Available targeting options</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent">Sample Data</p>
                    <p className="text-xs text-text-secondary">~10 categories</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Firebase</p>
                    <p className="text-xs text-text-secondary">Cloud database</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-secondary">Not Connected</p>
                    <p className="text-xs text-text-secondary">Config required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}