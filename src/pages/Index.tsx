
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
      {/* Enhanced Header with gradient */}
      <header className="border-b border-border bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-glow">
                <Database className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">DNV Databases</h1>
                <p className="text-white/80 text-lg">Premium Database Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-warm text-white border-0 px-4 py-2 shadow-warm">
                <Bitcoin className="h-5 w-5 mr-2" />
                BTC Accepted
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Admin Panel with solid colors */}
        <Card className="border-dnv-dark-blue/30 bg-gradient-to-r from-dnv-dark-blue/5 to-dnv-red/5 backdrop-blur-sm shadow-elegant">
          <CardHeader className="bg-gradient-accent rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-white">
              <div className="p-2 bg-white/20 rounded-lg">
                <Upload className="h-6 w-6" />
              </div>
              <span>Inventory Management</span>
            </CardTitle>
            <CardDescription className="text-white/80">Upload CSV or XLSX files to add products to your inventory</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-dnv-orange/30">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="file-upload" className="text-foreground font-semibold">Upload Product File</Label>
                  <Input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mt-2 border-dnv-dark-blue/30 bg-white shadow-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={downloadSampleFile}
                    className="bg-gradient-warm text-white hover:opacity-90 shadow-warm border-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Products Table */}
        <Card className="border-border bg-white shadow-elegant">
          <CardHeader className="bg-gradient-to-r from-dnv-dark-blue to-dnv-charcoal text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <span>Available Databases</span>
            </CardTitle>
            <CardDescription className="text-white/80">Browse our premium database collection</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-gradient-to-r from-dnv-red/10 to-dnv-orange/10">
                    <TableHead className="text-foreground font-bold">Name</TableHead>
                    <TableHead className="text-foreground font-bold">Domain</TableHead>
                    <TableHead className="text-foreground font-bold">Description</TableHead>
                    <TableHead className="text-foreground font-bold">Country</TableHead>
                    <TableHead className="text-foreground font-bold">Size</TableHead>
                    <TableHead className="text-foreground font-bold">Price</TableHead>
                    <TableHead className="text-foreground font-bold">BUY NOW BUTTON</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow 
                      key={product.id} 
                      className={`border-border hover:bg-gradient-to-r hover:from-dnv-orange/5 hover:to-dnv-red/5 transition-all ${
                        index % 2 === 0 ? 'bg-white' : 'bg-dnv-dark-blue/5'
                      }`}
                    >
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="font-mono text-dnv-dark-blue font-semibold">{product.domain}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        {product.description}
                      </TableCell>
                      <TableCell className="text-foreground">{product.country}</TableCell>
                      <TableCell className="text-foreground">{product.size}</TableCell>
                      <TableCell className="font-mono text-dnv-red font-bold text-lg">
                        ${product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(product)}
                            className="bg-gradient-accent hover:opacity-90 text-white border-0 shadow-warm"
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

        {/* Enhanced Payment Modal */}
        {showPayment && selectedProduct && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border-dnv-orange/30 bg-white shadow-2xl">
              <CardHeader className="bg-gradient-accent text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bitcoin className="h-6 w-6" />
                  </div>
                  <span>Bitcoin Payment</span>
                </CardTitle>
                <CardDescription className="text-white/80">Complete your purchase of {selectedProduct.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="text-center p-4 bg-gradient-warm rounded-lg">
                  <p className="text-3xl font-bold text-white mb-2">${selectedProduct.price.toLocaleString()}</p>
                  <p className="text-white/80">Send Bitcoin equivalent to:</p>
                </div>
                
                <div className="bg-dnv-charcoal p-4 rounded-lg border-2 border-dnv-orange/30">
                  <p className="font-mono text-sm break-all text-center text-white">{btcWallet}</p>
                </div>
                
                <div className="bg-gradient-to-r from-dnv-yellow/20 to-dnv-orange/20 border-2 border-dnv-orange/50 p-4 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong className="text-dnv-red">Important:</strong> Send the Bitcoin equivalent of ${selectedProduct.price.toLocaleString()} to the address above. 
                    Your database access will be provided after 1 confirmation.
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={completePurchase}
                    className="flex-1 bg-gradient-accent hover:opacity-90 text-white border-0 shadow-warm"
                  >
                    Payment Sent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPayment(false)}
                    className="border-dnv-dark-blue text-dnv-dark-blue hover:bg-dnv-dark-blue/10"
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
