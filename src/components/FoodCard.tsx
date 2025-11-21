import { Star, ShoppingCart, Plus } from 'lucide-react';
import { MenuItem, CartItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/utils/cart';
import { toast } from 'sonner';
import { useState } from 'react';

interface FoodCardProps {
  item: MenuItem;
  restaurantId?: string;
  restaurantName?: string;
  isClosed?: boolean;
}

const FoodCard = ({ item, restaurantId = 'main', restaurantName = 'D&G Restaurent', isClosed = false }: FoodCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const handleAddToCart = () => {
    if (isClosed) {
      toast.warning('Restaurant is closed now. Please come back tomorrow.');
      return;
    }
    if (item.isAvailable === false) {
      toast.warning('This item is not available right now.');
      return;
    }
    setIsAdding(true);
    addToCart({ ...item, quantity: 1, restaurantId, restaurantName });
    toast.success(`${item.name} added to cart!`);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setIsAdding(false), 500);
  };
  return (
    <Card className={`overflow-hidden hover:shadow-xl transition-all group ${isClosed || item.isAvailable === false ? 'grayscale' : ''}`}>
      <div className="relative h-44 overflow-hidden">
        <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        {item.isAvailable === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-2 py-1 text-xs font-semibold bg-white/90 rounded">Not available now</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant={item.isVeg ? 'default' : 'destructive'}>{item.isVeg ? "Veg" : "Non-veg"}</Badge>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-lg truncate">{item.name}</h3>
          {item.rating && item.rating > 0 && <span className="flex items-center text-green-500"><Star className="w-4 h-4 mr-1"/>{item.rating}</span>}
        </div>
        <p className="text-sm text-gray-600 mb-2 truncate">{item.description || 'Delicious food item'}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-xl text-foreground">₹{item.price}</span>
          <Button onClick={handleAddToCart} disabled={isAdding || item.isAvailable === false} size="sm" className="flex items-center gap-1">
            {isAdding ? <div className="w-3 h-3 border-t-2 border-primary rounded-full animate-spin"/> : <Plus className="w-4 h-4" />}
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FoodCard;
