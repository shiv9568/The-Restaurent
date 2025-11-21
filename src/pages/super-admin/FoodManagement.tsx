import React, { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Check, X } from 'lucide-react';
import { MenuItem } from '@/types';

// Mock data
const mockFoodItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken and aromatic spices',
    price: 299,
    image: '/placeholder.svg',
    category: 'Main Course',
    isVeg: false,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese with spices and herbs',
    price: 249,
    image: '/placeholder.svg',
    category: 'Appetizer',
    isVeg: true,
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Butter Chicken',
    description: 'Creamy tomato curry with tender chicken pieces',
    price: 329,
    image: '/placeholder.svg',
    category: 'Main Course',
    isVeg: false,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Dal Makhani',
    description: 'Rich and creamy black lentils slow-cooked to perfection',
    price: 199,
    image: '/placeholder.svg',
    category: 'Main Course',
    isVeg: true,
    rating: 4.3,
  },
];

const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup'];

// Extended MenuItem type with availability
interface FoodItem extends MenuItem {
  isAvailable: boolean;
}

// Convert mock data to include availability
const initialFoodItems: FoodItem[] = mockFoodItems.map(item => ({
  ...item,
  isAvailable: Math.random() > 0.3, // Randomly set some items as unavailable
}));

export default function FoodManagement() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: false,
    isAvailable: true,
  });

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      isVeg: false,
      isAvailable: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    });
    setIsDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      // Update existing item
      setFoodItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, price: parseFloat(formData.price) }
          : item
      ));
    } else {
      // Add new item
      const newItem: FoodItem = {
        id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price),
        image: '/placeholder.svg',
        rating: 0,
        isAvailable: formData.isAvailable,
      };
      setFoodItems(prev => [...prev, newItem]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setFoodItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isAvailable: !item.isAvailable }
        : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Management</h1>
          <p className="text-gray-600">Add, edit, or remove food items and control their availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter item description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isVeg">Vegetarian</Label>
                  <Switch
                    id="isVeg"
                    checked={formData.isVeg}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVeg: checked }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isAvailable">Available</Label>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                  />
                </div>
              </div>
              <Button onClick={handleSaveItem} className="w-full">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search food items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>
                    <Badge variant={item.isVeg ? "success" : "destructive"}>
                      {item.isVeg ? "Veg" : "Non-Veg"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.rating || "N/A"}</TableCell>
                  <TableCell>
                    <Button 
                      variant={item.isAvailable ? "outline" : "destructive"} 
                      size="sm"
                      onClick={() => toggleAvailability(item.id)}
                    >
                      {item.isAvailable ? (
                        <><Check className="h-4 w-4 mr-1" /> Available</>
                      ) : (
                        <><X className="h-4 w-4 mr-1" /> Unavailable</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}