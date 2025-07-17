
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Database, Bitcoin, Download, Plus, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import InvitationGate from "@/components/InvitationGate";

interface Product {
  id: string;
  name: string;
  domain: string;
  description: string;
  country: string;
  size: string;
  price: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Customer Analytics DB",
      domain: "analytics.dnvdb.com",
      description: "Complete customer behavior analytics database with 10M+ records",
      country: "United States",
      size: "2.5 GB",
      price: 2500
    },
    {
      id: "2", 
      name: "E-commerce Transaction DB",
      domain: "ecommerce.dnvdb.com",
      description: "Comprehensive e-commerce transaction database with purchase patterns",
      country: "Germany",
      size: "1.8 GB",
      price: 1800
    },
    {
      id: "3",
      name: "Medical Research DB",
      domain: "medical.dnvdb.com",
      description: "Anonymized medical research database for healthcare analytics",
      country: "Canada",
      size: "4.2 GB",
      price: 4500
    }
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const btcWallet = "1MuCbBteMFrQpcXBNCftPRAwJ954LqZWjy";

  if (!isAuthenticated) {
    return <InvitationGate onValidCode={() => setIsAuthenticated(true)} />;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook;
        
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        console.log("Parsed data from file:", jsonData);
        
        const newProducts = jsonData.map((row, index) => {
          console.log("Processing row:", row);
          return {
            id: String(products.length + index + 1),
            name: row.Name || row.name || "Unnamed Product",
            domain: row.Domain || row.domain || "example.dnvdb.com",
            description: row.Description || row.description || "No description available",
            country: row.Country || row.country || "Unknown",
            size: row.Size || row.size || "N/A",
            price: parseFloat(row.Price || row.price) || 0
          };
        });
        
        console.log("New products to add:", newProducts);
        
        setProducts(prev => [...prev, ...newProducts]);
        toast({
          title: "Success!",
          description: `Added ${newProducts.length} products to inventory`,
        });
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("File processing error:", error);
        toast({
          title: "Error",
          description: "Failed to process file. Please check the format and column names.",
          variant: "destructive"
        });
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = [
      {
        Name: "Sample Database",
        Domain: "sample.dnvdb.com",
        Description: "This is a sample database description",
        Country: "United States",
        Size: "1.2 GB",
        Price: 1000
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "DNV_Database_Template.xlsx");
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(true);
  };

  const completePurchase = () => {
    if (selectedProduct) {
      toast({
        title: "Purchase Initiated!",
        description: `Please send payment to complete your purchase of ${selectedProduct.name}`,
      });
      
      setShowPayment(false);
      setSelectedProduct(null);
    }
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Product Removed",
      description: "Product has been removed from inventory",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-dnv-orange" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">DNV Databases</h1>
                <p className="text-muted-foreground">Premium Database Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-dnv-orange/20 text-dnv-orange border-dnv-orange/30">
                <Bitcoin className="h-4 w-4 mr-1" />
                BTC Accepted
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Admin Panel */}
        <Card className="border-dnv-dark-blue/30 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Upload className="h-5 w-5 text-dnv-orange" />
              <span>Inventory Management</span>
            </CardTitle>
            <CardDescription>Upload CSV or XLSX files to add products to your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload" className="text-foreground">Upload Product File</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="mt-1 border-border bg-input"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={downloadSampleFile}
                  variant="outline"
                  className="border-dnv-yellow text-dnv-yellow hover:bg-dnv-yellow/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Available Databases</CardTitle>
            <CardDescription>Browse our premium database collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Name</TableHead>
                    <TableHead className="text-foreground">Domain</TableHead>
                    <TableHead className="text-foreground">Description</TableHead>
                    <TableHead className="text-foreground">Country</TableHead>
                    <TableHead className="text-foreground">Size</TableHead>
                    <TableHead className="text-foreground">Price</TableHead>
                    <TableHead className="text-foreground">BUY NOW BUTTON</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="font-mono text-dnv-dark-blue">{product.domain}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        {product.description}
                      </TableCell>
                      <TableCell className="text-foreground">{product.country}</TableCell>
                      <TableCell className="text-foreground">{product.size}</TableCell>
                      <TableCell className="font-mono text-dnv-orange font-semibold">
                        ${product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(product)}
                            className="bg-dnv-orange hover:bg-dnv-orange/80 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Buy Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeProduct(product.id)}
                            className="border-dnv-red text-dnv-red hover:bg-dnv-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {showPayment && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-dnv-orange/30 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Bitcoin className="h-5 w-5 text-dnv-orange" />
                  <span>Bitcoin Payment</span>
                </CardTitle>
                <CardDescription>Complete your purchase of {selectedProduct.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-dnv-orange">${selectedProduct.price.toLocaleString()}</p>
                  <p className="text-muted-foreground">Send Bitcoin equivalent to:</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-mono text-sm break-all text-center text-foreground">{btcWallet}</p>
                </div>
                
                <div className="bg-dnv-yellow/10 border border-dnv-yellow/30 p-3 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Important:</strong> Send the Bitcoin equivalent of ${selectedProduct.price.toLocaleString()} to the address above. 
                    Your database access will be provided after 1 confirmation.
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={completePurchase}
                    className="flex-1 bg-dnv-orange hover:bg-dnv-orange/80 text-white"
                  >
                    Payment Sent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPayment(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
