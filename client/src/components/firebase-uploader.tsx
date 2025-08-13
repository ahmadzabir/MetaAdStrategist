import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface UploadResponse {
  message: string;
  count: number;
}

export default function FirebaseUploader() {
  const [jsonData, setJsonData] = useState("");
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (categories: any[]) => {
      const response = await apiRequest("POST", "/api/targeting-categories/bulk-upload", { categories });
      return response.json() as Promise<UploadResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: data.message,
      });
      setJsonData("");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload data to Firebase",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      const categories = Array.isArray(parsedData) ? parsedData : [parsedData];
      uploadMutation.mutate(categories);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format and try again",
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    const sampleJson = JSON.stringify([
      {
        "id": "interests-technology",
        "name": "Technology",
        "parent_id": "interests",
        "level": 1,
        "size": "125M",
        "category_type": "interests"
      },
      {
        "id": "interests-technology-artificial_intelligence",
        "name": "Artificial Intelligence",
        "parent_id": "interests-technology",
        "level": 2,
        "size": "8.5M",
        "category_type": "interests"
      }
    ], null, 2);
    setJsonData(sampleJson);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-cloud-upload-alt text-accent"></i>
          </div>
          <div>
            <CardTitle>Firebase Data Uploader</CardTitle>
            <CardDescription>
              Upload your Meta targeting data JSON file to Firebase database
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            JSON Data
          </label>
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Paste your Meta targeting categories JSON data here..."
            rows={15}
            className="font-mono text-sm"
            data-testid="textarea-json-data"
          />
          <p className="text-xs text-text-secondary mt-2">
            Expected format: Array of objects with id, name, parent_id, level, size, and category_type fields
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleUpload}
            disabled={!jsonData.trim() || uploadMutation.isPending}
            className="bg-accent text-white hover:bg-accent/90"
            data-testid="button-upload-firebase"
          >
            {uploadMutation.isPending ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Upload to Firebase
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={loadSampleData}
            data-testid="button-load-sample"
          >
            <i className="fas fa-file-code mr-2"></i>
            Load Sample Data
          </Button>

          <Button
            variant="outline"
            onClick={() => setJsonData("")}
            disabled={!jsonData.trim()}
            data-testid="button-clear-data"
          >
            <i className="fas fa-trash mr-2"></i>
            Clear
          </Button>
        </div>

        {uploadMutation.isPending && (
          <div className="bg-neutral-light rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Uploading to Firebase...</p>
                <p className="text-xs text-text-secondary">This may take a few moments for large datasets</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">Firebase Configuration Required</h4>
          <p className="text-xs text-text-secondary mb-3">
            To use Firebase, you'll need to set these environment variables:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-text-secondary">
            <div>• FIREBASE_API_KEY</div>
            <div>• FIREBASE_AUTH_DOMAIN</div>
            <div>• FIREBASE_PROJECT_ID</div>
            <div>• FIREBASE_STORAGE_BUCKET</div>
            <div>• FIREBASE_MESSAGING_SENDER_ID</div>
            <div>• FIREBASE_APP_ID</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}