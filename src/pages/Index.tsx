
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Database, Bitcoin, Download, Plus, Trash2, Search, ArrowUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import InvitationGate from "@/components/InvitationGate";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  bin: string;
  city: string;
  country: string;
  type: string;
  price: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"country" | "price" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const btcWallet = "1MuCbBteMFrQpcXBNCftPRAwJ954LqZWjy";

  // Load products from Supabase on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter(product =>
      product.bin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "price") {
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
        } else {
          const aVal = a[sortBy] as string;
          const bVal = b[sortBy] as string;
          return sortOrder === "asc" 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProductsToDatabase = async (newProducts: Product[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(newProducts.map(p => ({
          bin: p.bin,
          city: p.city,
          country: p.country,
          type: p.type,
          price: p.price
        })));

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Saved ${newProducts.length} products to database permanently`,
      });
    } catch (error) {
      console.error('Error saving products:', error);
      toast({
        title: "Error",
        description: "Failed to save products to database",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return <InvitationGate onValidCode={() => setIsAuthenticated(true)} />;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
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
            id: String(Date.now() + index),
            bin: row.BIN || row.bin || row.Name || row.name || "Unknown BIN",
            city: row.City || row.city || row.Domain || row.domain || "Unknown City",
            country: row.Country || row.country || "Unknown",
            type: row.Type || row.type || row.Description || row.description || "Unknown Type",
            price: parseFloat(row.Price || row.price) || 0
          };
        });
        
        console.log("New products to add:", newProducts);
        
        // Save to database permanently
        await saveProductsToDatabase(newProducts);
        
        // Reload products from database
        await loadProducts();
        
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
        BIN: "424242",
        City: "New York",
        Country: "United States",
        Type: "Visa Credit",
        Price: 1000
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "DNV_Database_Template.xlsx");
  };

  const handleSort = (column: "country" | "price") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(true);
  };

  const completePurchase = () => {
    if (selectedProduct) {
      toast({
        title: "Purchase Initiated!",
        description: `Please send payment to complete your purchase of ${selectedProduct.bin} - ${selectedProduct.type}`,
      });
      
      setShowPayment(false);
      setSelectedProduct(null);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProducts();
      toast({
        title: "Product Removed",
        description: "Product has been removed from database permanently",
      });
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: "Failed to remove product from database",
        variant: "destructive"
      });
    }
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

        {/* Search Bar */}
        <Card className="border-border bg-white shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products by BIN, country, type, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
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
              <span>Available Databases ({filteredProducts.length})</span>
            </CardTitle>
            <CardDescription className="text-white/80">Browse our premium database collection</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-gradient-to-r from-dnv-red/10 to-dnv-orange/10">
                    <TableHead className="text-foreground font-bold">BIN</TableHead>
                    <TableHead className="text-foreground font-bold">City</TableHead>
                    <TableHead className="text-foreground font-bold">Type</TableHead>
                    <TableHead 
                      className="text-foreground font-bold cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => handleSort("country")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Country</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-foreground font-bold cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-foreground font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No products found matching your search." : "No products available. Upload some data to get started."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <TableRow 
                        key={product.id} 
                        className={`border-border hover:bg-gradient-to-r hover:from-dnv-orange/5 hover:to-dnv-red/5 transition-all ${
                          index % 2 === 0 ? 'bg-white' : 'bg-dnv-dark-blue/5'
                        }`}
                      >
                        <TableCell className="font-mono text-dnv-dark-blue font-semibold">{product.bin}</TableCell>
                        <TableCell className="text-foreground">{product.city}</TableCell>
                        <TableCell className="text-foreground">{product.type}</TableCell>
                        <TableCell className="text-foreground">{product.country}</TableCell>
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
                    ))
                  )}
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
                <CardDescription className="text-white/80">Complete your purchase of {selectedProduct.bin} - {selectedProduct.type}</CardDescription>
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
