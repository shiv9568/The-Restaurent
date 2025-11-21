import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Check, X, Eye, EyeOff } from 'lucide-react';
import { FoodItem } from '@/types';
import { adminFoodService, adminCategoryService } from '@/utils/adminService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function FoodManagement() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    categoryId: '',
    isVeg: false,
    isAvailable: true,
    displayOnHomepage: false,
    image: '',
  });

  // Image helpers
  const [imageMode, setImageMode] = useState<'link' | 'byname' | 'upload'>('link');
  const [imageQuery, setImageQuery] = useState('');
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [items, cats] = await Promise.all([
        adminFoodService.getAll(),
        adminCategoryService.getAll()
      ]);
      setFoodItems(items);
      setCategories(cats.map((cat: any) => ({ id: cat.id || cat._id, name: cat.name })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      categoryId: '',
      isVeg: false,
      isAvailable: true,
      displayOnHomepage: false,
      image: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      categoryId: (item as any).categoryId || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      displayOnHomepage: item.displayOnHomepage || false,
      image: item.image,
    });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Find categoryId if not set
      let categoryId = formData.categoryId;
      if (!categoryId) {
        const matchedCategory = categories.find(cat => cat.name === formData.category);
        categoryId = matchedCategory?.id || '';
      }

      const itemData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        category: formData.category,
        categoryId: categoryId,
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        displayOnHomepage: formData.displayOnHomepage,
        image: formData.image.trim() || '/placeholder.svg',
        rating: editingItem?.rating || 0,
      };

      if (editingItem) {
        await adminFoodService.update(editingItem.id, itemData);
        toast.success('Food item updated successfully!');
      } else {
        await adminFoodService.create(itemData);
        toast.success(formData.displayOnHomepage 
          ? 'Food item added! It will appear on the homepage.' 
          : 'Food item added successfully!');
      }

      await loadData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error saving food item:', error);
      toast.error(error.message || 'Failed to save food item');
    }
  };

  const generateImageSuggestions = async () => {
    if (!imageQuery.trim()) {
      toast.error('Type a dish name first');
      return;
    }
    try {
      setIsGeneratingImage(true);
      // Use Unsplash official API (requires Access Key)
      const UNSPLASH_ACCESS_KEY = (import.meta as any)?.env?.VITE_UNSPLASH_ACCESS_KEY || 'ZZKk1UgyRoE4o6e4Ijkyj5Kihpd86U-zHf4vFrTWV5M';
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageQuery)}&per_page=3&content_filter=high&orientation=squarish&client_id=${UNSPLASH_ACCESS_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Unsplash request failed');
      const data = await res.json();
      const urls: string[] = (data?.results || [])
        .map((r: any) => r?.urls?.small || r?.urls?.regular)
        .filter(Boolean)
        .slice(0, 3);
      if (urls.length === 0) {
        throw new Error('No images found');
      }
      setImageOptions(urls);
      toast.success('Image options ready');
    } catch (e) {
      console.error(e);
      // Fallback to source endpoint if API fails
      const base = `https://source.unsplash.com/600x600/?${encodeURIComponent(imageQuery)}`;
      const fallback = [
        `${base}&sig=1`,
        `${base}+food&sig=2`,
        `${base}+dish&sig=3`,
      ];
      setImageOptions(fallback);
      toast.error('Unsplash API failed, using fallback images');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const onUploadFile = async (file?: File) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = (reader.result as string) || '';
        setFormData(prev => ({ ...prev, image: result }));
        toast.success('Image selected');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to read image');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await adminFoodService.delete(id);
      toast.success('Item deleted successfully!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const item = foodItems.find(i => i.id === id);
      if (!item) return;
      
      await adminFoodService.update(id, {
        ...item,
        isAvailable: !item.isAvailable,
      });
      await loadData();
      toast.success(`Item ${!item.isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Failed to update availability');
    }
  };

  const toggleHomepage = async (id: string) => {
    try {
      const item = foodItems.find(i => i.id === id);
      if (!item) return;
      
      await adminFoodService.update(id, {
        ...item,
        displayOnHomepage: !item.displayOnHomepage,
      });
      await loadData();
      toast.success(`Item ${!item.displayOnHomepage ? 'added to' : 'removed from'} homepage`);
    } catch (error: any) {
      toast.error('Failed to update homepage display');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Management</h1>
          <p className="text-gray-600">Control what food items appear on your website</p>
          <div className="mt-2 text-sm text-gray-500">
            Total: {foodItems.length} | 
            Available: {foodItems.filter(item => item.isAvailable).length} | 
            On Homepage: {foodItems.filter(item => item.displayOnHomepage).length}
          </div>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Food Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Food Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Food Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Homepage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No food items found. Click "Add Food Item" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{item.price}</TableCell>
                    <TableCell>
                      <Badge variant={item.isVeg ? "default" : "destructive"}>
                        {item.isVeg ? "Veg" : "Non-veg"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleAvailability(item.id)}
                        />
                        {item.isAvailable ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.displayOnHomepage || false}
                          onCheckedChange={() => toggleHomepage(item.id)}
                        />
                        {item.displayOnHomepage ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter food item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-2 text-sm">
                <Button type="button" variant={imageMode==='link'?'default':'outline'} onClick={() => setImageMode('link')}>Link</Button>
                <Button type="button" variant={imageMode==='byname'?'default':'outline'} onClick={() => setImageMode('byname')}>By name</Button>
                <Button type="button" variant={imageMode==='upload'?'default':'outline'} onClick={() => setImageMode('upload')}>Upload</Button>
              </div>
              {imageMode === 'link' && (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
              )}
              {imageMode === 'byname' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Chicken biryani"
                      value={imageQuery}
                      onChange={(e) => setImageQuery(e.target.value)}
                    />
                    <Button type="button" onClick={generateImageSuggestions} disabled={isGeneratingImage}>
                      {isGeneratingImage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Generating</> : 'Generate'}
                    </Button>
                  </div>
                  {imageOptions.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imageOptions.map((url) => (
                        <button key={url} type="button" className={`border rounded overflow-hidden ${formData.image===url?'ring-2 ring-primary':''}`} onClick={() => setFormData(prev => ({ ...prev, image: url }))}>
                          <img src={url} alt="option" className="w-full h-20 object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.svg'}}/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {imageMode === 'upload' && (
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={(e)=> onUploadFile(e.target.files?.[0] || undefined)} />
                  <p className="text-xs text-muted-foreground">We store the uploaded image as a data URL for quick preview.</p>
                </div>
              )}
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-yellow-600">No categories available. Add categories in Menu Management.</p>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const cat = categories.find(c => c.name === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        category: value,
                        categoryId: cat?.id || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isVeg"
                checked={formData.isVeg}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVeg: checked }))}
              />
              <Label htmlFor="isVeg">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
              />
              <Label htmlFor="isAvailable">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="displayOnHomepage"
                checked={formData.displayOnHomepage}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, displayOnHomepage: checked }))}
              />
              <Label htmlFor="displayOnHomepage">Display on Homepage (What customers see)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
